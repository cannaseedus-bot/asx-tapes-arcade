<?php
/**
 * ROMBOS CODER QWEN 7B - ASX TAPE ROUTE HANDLER
 *
 * Mx2PHP-style proxy for rombos-coder-v2.5-qwen-7b-Q4_K_M.gguf
 * Routes inference requests to local Ollama/llama.cpp backend
 *
 * @author ASX Labs
 * @version 1.0.0
 */

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

$method = $_SERVER["REQUEST_METHOD"];
$path   = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);

// Configuration
$CONFIG = [
    "endpoint" => "http://127.0.0.1:11434/api/generate",
    "model"    => "rombos-coder-v2.5-qwen-7b-Q4_K_M",
    "adapter"  => "ollama", // or "llamacpp"
    "timeout"  => 60,
    "log_dir"  => __DIR__ . "/logs/"
];

// Ensure logs directory exists
if (!file_exists($CONFIG["log_dir"])) {
    mkdir($CONFIG["log_dir"], 0755, true);
}

/**
 * Log request/response
 */
function logInference($data) {
    global $CONFIG;
    $timestamp = date('Y-m-d H:i:s');
    $logfile = $CONFIG["log_dir"] . date('Y-m-d') . ".log";

    $entry = sprintf(
        "[%s] %s\n",
        $timestamp,
        json_encode($data, JSON_PRETTY_PRINT)
    );

    file_put_contents($logfile, $entry, FILE_APPEND);
}

/**
 * Call Ollama/llama.cpp inference endpoint
 */
function callLLM($prompt, $system = "", $options = []) {
    global $CONFIG;

    $systemPrompt = $system ?: "You are a precise, helpful coding assistant inside the ASX runtime. Analyze code for bugs, security issues, and optimization opportunities.";

    $payload = [
        "model"  => $CONFIG["model"],
        "prompt" => $systemPrompt . "\n\nUser:\n" . $prompt . "\n\nAssistant:",
        "options" => array_merge([
            "temperature" => 0.2,
            "top_p"       => 0.9,
            "num_predict" => 512
        ], $options),
        "stream" => false
    ];

    $ch = curl_init($CONFIG["endpoint"]);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER     => ["Content-Type: application/json"],
        CURLOPT_POSTFIELDS     => json_encode($payload),
        CURLOPT_TIMEOUT        => $CONFIG["timeout"]
    ]);

    $startTime = microtime(true);
    $response  = curl_exec($ch);
    $duration  = round((microtime(true) - $startTime) * 1000); // ms

    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error    = curl_error($ch);
    curl_close($ch);

    if ($error) {
        return [
            "ok"    => false,
            "error" => $error,
            "code"  => $httpCode
        ];
    }

    $parsed = json_decode($response, true);

    if (!$parsed) {
        return [
            "ok"    => false,
            "error" => "Invalid JSON response from LLM backend",
            "raw"   => $response
        ];
    }

    $output = $parsed["response"] ?? ($parsed["text"] ?? $response);

    return [
        "ok"       => true,
        "model"    => $CONFIG["model"],
        "output"   => $output,
        "duration" => $duration,
        "tokens"   => $parsed["eval_count"] ?? null,
        "raw"      => $parsed
    ];
}

// ============================================================
// ROUTES
// ============================================================

/**
 * POST /api/rombos/infer
 * Main inference endpoint
 */
if ($path === "/api/rombos/infer" && $method === "POST") {
    $raw  = file_get_contents("php://input");
    $json = json_decode($raw, true);

    if (!$json) {
        http_response_code(400);
        echo json_encode(["ok" => false, "error" => "Invalid JSON"]);
        exit;
    }

    $prompt  = $json["prompt"] ?? "";
    $system  = $json["system"] ?? "";
    $options = $json["options"] ?? [];

    if (empty($prompt)) {
        http_response_code(400);
        echo json_encode(["ok" => false, "error" => "Missing 'prompt' field"]);
        exit;
    }

    $result = callLLM($prompt, $system, $options);

    // Log
    logInference([
        "endpoint" => "/api/rombos/infer",
        "prompt"   => substr($prompt, 0, 100) . "...",
        "result"   => $result["ok"] ? "success" : "failed",
        "duration" => $result["duration"] ?? null,
        "error"    => $result["error"] ?? null
    ]);

    http_response_code($result["ok"] ? 200 : 500);
    echo json_encode($result);
    exit;
}

/**
 * GET /api/rombos/status
 * Check if LLM backend is available
 */
if ($path === "/api/rombos/status" && $method === "GET") {
    $ch = curl_init($CONFIG["endpoint"]);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 5,
        CURLOPT_NOBODY         => true
    ]);

    curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $online = ($httpCode === 200 || $httpCode === 404); // 404 is ok, means endpoint exists

    echo json_encode([
        "ok"       => true,
        "status"   => $online ? "online" : "offline",
        "model"    => $CONFIG["model"],
        "endpoint" => $CONFIG["endpoint"],
        "adapter"  => $CONFIG["adapter"]
    ]);
    exit;
}

/**
 * GET /api/rombos/config
 * Get current configuration
 */
if ($path === "/api/rombos/config" && $method === "GET") {
    echo json_encode([
        "ok"     => true,
        "config" => [
            "model"    => $CONFIG["model"],
            "endpoint" => $CONFIG["endpoint"],
            "adapter"  => $CONFIG["adapter"],
            "timeout"  => $CONFIG["timeout"]
        ]
    ]);
    exit;
}

/**
 * POST /api/rombos/tribunal
 * Special route for tribunal integration
 */
if ($path === "/api/rombos/tribunal" && $method === "POST") {
    $raw  = file_get_contents("php://input");
    $json = json_decode($raw, true);

    $taskType = $json["task"]["type"] ?? "code_review";
    $content  = $json["task"]["content"] ?? "";
    $context  = $json["task"]["context"] ?? [];

    // Build specialized prompt based on task type
    $prompts = [
        "code_review" => "Review this code and provide:\n1. Overall assessment (APPROVE, REQUEST_CHANGES, REJECT)\n2. Issues found\n3. Suggestions\n4. Confidence (0-1)\n\nCode:\n",
        "bug_analysis" => "Analyze for bugs:\n1. Severity (CRITICAL, HIGH, MEDIUM, LOW, NONE)\n2. Bugs found\n3. Root cause\n4. Fixes\n5. Confidence (0-1)\n\nCode:\n",
        "optimization" => "Evaluate optimization:\n1. Rating (EXCELLENT, GOOD, FAIR, POOR)\n2. Bottlenecks\n3. Suggestions\n4. Expected improvement\n5. Confidence (0-1)\n\nCode:\n",
        "security_audit" => "Security audit:\n1. Rating (SECURE, MINOR_ISSUES, MAJOR_ISSUES, CRITICAL)\n2. Vulnerabilities\n3. Violations\n4. Remediation\n5. Confidence (0-1)\n\nCode:\n"
    ];

    $promptTemplate = $prompts[$taskType] ?? $prompts["code_review"];
    $fullPrompt = $promptTemplate . $content;

    $result = callLLM($fullPrompt, "", ["num_predict" => 768]);

    echo json_encode([
        "ok"     => $result["ok"],
        "judge"  => "rombos-coder-qwen7b",
        "task"   => $taskType,
        "result" => $result
    ]);
    exit;
}

// Default: 404
http_response_code(404);
echo json_encode([
    "ok"    => false,
    "error" => "Not found",
    "path"  => $path
]);
