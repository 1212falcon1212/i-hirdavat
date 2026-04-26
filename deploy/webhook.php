<?php
/**
 * GitHub Webhook Auto-Deploy Script
 *
 * Bu dosyayı sunucunuza yükleyin ve GitHub webhook'una URL olarak verin.
 * Örnek: https://api.siteniz.com/deploy/webhook.php
 */

// ======= YAPILANDIRMA =======
$secret = 'BURAYA_GUCLU_BIR_SECRET_YAZIN'; // GitHub webhook secret ile aynı olmalı
$repo_path = '/home/KULLANICI/htdocs/SITE'; // Projenin ana dizini
$branch = 'main';
$log_file = __DIR__ . '/deploy.log';

// ======= GÜVENLİK KONTROLÜ =======
$headers = getallheaders();
$hub_signature = $headers['X-Hub-Signature-256'] ?? '';
$payload = file_get_contents('php://input');

// İmza doğrulama
$expected_signature = 'sha256=' . hash_hmac('sha256', $payload, $secret);
if (!hash_equals($expected_signature, $hub_signature)) {
    http_response_code(403);
    die('Invalid signature');
}

// Sadece push event'lerini işle
$event = $headers['X-GitHub-Event'] ?? '';
if ($event !== 'push') {
    die('Not a push event');
}

// Branch kontrolü
$data = json_decode($payload, true);
$pushed_branch = str_replace('refs/heads/', '', $data['ref'] ?? '');
if ($pushed_branch !== $branch) {
    die("Push to $pushed_branch, not $branch. Skipping.");
}

// ======= DEPLOY İŞLEMİ =======
function logMessage($message) {
    global $log_file;
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($log_file, "[$timestamp] $message\n", FILE_APPEND);
}

logMessage("=== Deploy started ===");
logMessage("Commit: " . ($data['head_commit']['message'] ?? 'N/A'));

// Deploy komutları
$commands = [
    "cd $repo_path",
    "git fetch origin $branch",
    "git reset --hard origin/$branch",

    // Backend
    "cd $repo_path/backend",
    "composer install --no-dev --optimize-autoloader",
    "php artisan migrate --force",
    "php artisan config:cache",
    "php artisan route:cache",
    "php artisan view:cache",

    // Frontend (opsiyonel - build uzun sürerse ayrı çalıştırın)
    // "cd $repo_path/frontend",
    // "npm install",
    // "npm run build",
];

$full_command = implode(' && ', $commands) . ' 2>&1';

// Komutu arka planda çalıştır (webhook timeout'u önlemek için)
$output_file = __DIR__ . '/deploy_output.log';
exec("nohup bash -c '$full_command' > $output_file 2>&1 &");

logMessage("Deploy command triggered in background");
logMessage("=== Deploy queued ===");

http_response_code(200);
echo json_encode([
    'status' => 'success',
    'message' => 'Deploy started',
    'branch' => $branch,
    'commit' => $data['head_commit']['id'] ?? 'N/A'
]);
