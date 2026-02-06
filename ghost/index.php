<?php
/**
 * GHOST v1.0 - Global Host Orchestration Specification for Tapes
 * Main router for all tape operations
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Configuration
define('TAPES_DIR', __DIR__ . '/../tapes');
define('GHOST_DIR', __DIR__);
define('SETTINGS_FILE', GHOST_DIR . '/settings.json');
define('SWARM_FILE', GHOST_DIR . '/swarm.json');

// Parse request path
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);
$path = str_replace('/ghost', '', $path);
$path = trim($path, '/');
$parts = explode('/', $path);

// Route handler
$route = $parts[0] ?? 'index';
$param = $parts[1] ?? null;

try {
    switch ($route) {
        case '':
        case 'index':
            handleIndex();
            break;

        case 'tapes':
            if ($param) {
                handleTapeInfo($param);
            } else {
                handleTapeList();
            }
            break;

        case 'proxy':
            if (!$param) {
                throw new Exception('Tape ID required for proxy');
            }
            handleTapeProxy($param);
            break;

        case 'proxy-external':
            if (!$param) {
                throw new Exception('Service name required for external proxy');
            }
            handleExternalProxy($param);
            break;

        case 'swarm':
            if ($param === 'route') {
                handleSwarmRoute();
            } else {
                throw new Exception('Unknown swarm endpoint');
            }
            break;

        default:
            http_response_code(404);
            echo json_encode(['error' => 'Unknown endpoint']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

/**
 * Index - Basic info
 */
function handleIndex() {
    echo json_encode([
        'ghost' => 'v1.0',
        'status' => 'online',
        'endpoints' => [
            'GET /ghost' => 'This info',
            'GET /ghost/tapes' => 'List all tapes',
            'GET /ghost/tapes/:id' => 'Get tape info',
            'POST /ghost/proxy/:id' => 'Proxy to tape API',
            'POST /ghost/proxy-external/:service' => 'Proxy to external service',
            'POST /ghost/swarm/route' => 'Route task to best agent'
        ]
    ]);
}

/**
 * List all tapes
 */
function handleTapeList() {
    $tapes = scanTapes();

    // Generate ghost.json
    $registry = [
        'version' => '1.0',
        'generated' => date('c'),
        'tapes' => $tapes,
        'host' => [
            'root' => GHOST_DIR,
            'swarm' => SWARM_FILE,
            'settings' => SETTINGS_FILE
        ]
    ];

    file_put_contents(GHOST_DIR . '/ghost.json', json_encode($registry, JSON_PRETTY_PRINT));

    echo json_encode(array_values($tapes));
}

/**
 * Get single tape info
 */
function handleTapeInfo($tapeId) {
    $tapes = scanTapes();

    if (!isset($tapes[$tapeId])) {
        http_response_code(404);
        echo json_encode(['error' => 'Tape not found']);
        return;
    }

    echo json_encode($tapes[$tapeId]);
}

/**
 * Proxy to tape API
 */
function handleTapeProxy($tapeId) {
    $tapes = scanTapes();

    if (!isset($tapes[$tapeId])) {
        http_response_code(404);
        echo json_encode(['error' => 'Tape not found']);
        return;
    }

    $input = json_decode(file_get_contents('php://input'), true);

    $tapePath = $input['path'] ?? '/api';
    $method = $input['method'] ?? 'POST';
    $payload = $input['payload'] ?? [];

    // Build tape URL
    $scheme = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'];
    $tapeUrl = "$scheme://$host/tapes/$tapeId$tapePath";

    // Forward request
    $result = makeRequest($tapeUrl, $method, $payload);

    echo json_encode([
        'ok' => true,
        'tape' => $tapeId,
        'status' => $result['status'],
        'data' => $result['data']
    ]);
}

/**
 * Proxy to external service
 */
function handleExternalProxy($service) {
    $settings = loadSettings();

    if (!isset($settings['external'][$service])) {
        http_response_code(404);
        echo json_encode(['error' => "Service '$service' not configured"]);
        return;
    }

    $serviceUrl = $settings['external'][$service];
    $payload = json_decode(file_get_contents('php://input'), true);

    $result = makeRequest($serviceUrl, 'POST', $payload);

    echo json_encode([
        'ok' => true,
        'service' => $service,
        'status' => $result['status'],
        'data' => $result['data']
    ]);
}

/**
 * Route task to best agent
 */
function handleSwarmRoute() {
    $swarm = loadSwarm();
    $input = json_decode(file_get_contents('php://input'), true);

    $task = $input['task'] ?? '';
    $payload = $input['payload'] ?? [];

    // Simple routing heuristics
    $agent = routeToAgent($task, $swarm);

    if (!$agent) {
        echo json_encode([
            'ok' => false,
            'error' => 'No suitable agent found',
            'task' => $task
        ]);
        return;
    }

    $agentUrl = $swarm['agents'][$agent]['url'];
    $result = makeRequest($agentUrl, 'POST', $payload);

    echo json_encode([
        'ok' => true,
        'agent' => $agent,
        'task' => $task,
        'status' => $result['status'],
        'data' => $result['data']
    ]);
}

/**
 * Scan tapes directory
 */
function scanTapes() {
    $tapes = [];

    if (!is_dir(TAPES_DIR)) {
        return $tapes;
    }

    $dirs = scandir(TAPES_DIR);

    foreach ($dirs as $dir) {
        if ($dir === '.' || $dir === '..') continue;

        $tapeDir = TAPES_DIR . '/' . $dir;
        $manifestFile = $tapeDir . '/tape.json';

        if (!is_dir($tapeDir) || !file_exists($manifestFile)) {
            continue;
        }

        $manifest = json_decode(file_get_contents($manifestFile), true);

        if (!$manifest) continue;

        $tapeId = $manifest['id'] ?? $dir;

        $tapes[$tapeId] = [
            'id' => $tapeId,
            'name' => $manifest['name'] ?? $dir,
            'version' => $manifest['version'] ?? '1.0.0',
            'description' => $manifest['description'] ?? '',
            'author' => $manifest['author'] ?? 'Unknown',
            'path' => "/tapes/$dir/",
            'entry' => $manifest['entry'] ?? "/tapes/$dir/public/index.html",
            'api' => $manifest['routes']['api'] ?? "/tapes/$dir/route.php",
            'agents' => $manifest['agents'] ?? null,
            'mounted' => true,
            'status' => 'online',
            'lastAccessed' => date('c')
        ];
    }

    return $tapes;
}

/**
 * Load settings
 */
function loadSettings() {
    if (!file_exists(SETTINGS_FILE)) {
        return ['external' => []];
    }

    return json_decode(file_get_contents(SETTINGS_FILE), true);
}

/**
 * Load swarm config
 */
function loadSwarm() {
    if (!file_exists(SWARM_FILE)) {
        return [
            'agents' => [],
            'router' => ['fallback' => null]
        ];
    }

    return json_decode(file_get_contents(SWARM_FILE), true);
}

/**
 * Route task to best agent
 */
function routeToAgent($task, $swarm) {
    $task = strtolower($task);

    // Check for keywords
    $keywords = [
        'build' => 'cline',
        'deploy' => 'cline',
        'ops' => 'cline',
        'git' => 'cline',
        'eval' => 'qwen',
        'judge' => 'qwen',
        'grade' => 'qwen',
        'code' => 'qwen',
        'fast' => 'qwen',
        'reason' => 'mx2lm',
        'analyze' => 'mx2lm',
        'longform' => 'mx2lm'
    ];

    foreach ($keywords as $keyword => $agent) {
        if (strpos($task, $keyword) !== false) {
            if (isset($swarm['agents'][$agent])) {
                return $agent;
            }
        }
    }

    // Fallback
    return $swarm['router']['fallback'] ?? null;
}

/**
 * Make HTTP request
 */
function makeRequest($url, $method, $data) {
    $ch = curl_init();

    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);

    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    }

    $response = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);

    curl_close($ch);

    if ($error) {
        return [
            'status' => 0,
            'data' => ['error' => $error]
        ];
    }

    return [
        'status' => $status,
        'data' => json_decode($response, true) ?? $response
    ];
}
