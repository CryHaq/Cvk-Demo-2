<?php
/**
 * CVK Dijital - JWT Authentication Middleware
 */

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../php/config.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthMiddleware {
    private $secretKey;
    
    public function __construct() {
        $this->secretKey = $_ENV['JWT_SECRET'] ?? JWT_SECRET_KEY;
    }
    
    /**
     * JWT Token doğrulama
     */
    public function verifyToken() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? ($headers['authorization'] ?? '');
        
        if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return null;
        }
        
        $token = $matches[1];

        // Preferred: firebase/php-jwt decode
        try {
            $decoded = JWT::decode($token, new Key($this->secretKey, 'HS256'));
            return $this->normalizeUserPayload((array) $decoded);
        } catch (Exception $e) {
            // Fallback below for legacy tokens created by php/auth.php
        }
        
        // Fallback: decode and validate legacy HS256 token format
        try {
            $parts = explode('.', $token);
            if (count($parts) !== 3) {
                return null;
            }

            $expectedSignature = hash_hmac('sha256', $parts[0] . '.' . $parts[1], JWT_SECRET_KEY, true);
            $signature = $this->base64UrlDecode($parts[2]);
            if (!hash_equals($expectedSignature, $signature)) {
                return null;
            }

            $payload = json_decode($this->base64UrlDecode($parts[1]), true);
            if (!is_array($payload) || empty($payload['exp']) || $payload['exp'] < time()) {
                return null;
            }

            return $this->normalizeUserPayload($payload);
        } catch (Exception $e) {
            return null;
        }
    }
    
    /**
     * Admin kontrolü
     */
    public function requireAdmin($user) {
        if (!$user || ($user['role'] ?? '') !== 'admin') {
            http_response_code(403);
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false,
                'message' => 'Admin yetkisi gerekli'
            ]);
            exit;
        }
    }

    private function base64UrlDecode($input) {
        $remainder = strlen($input) % 4;
        if ($remainder) {
            $input .= str_repeat('=', 4 - $remainder);
        }
        return base64_decode(strtr($input, '-_', '+/'));
    }

    private function normalizeUserPayload($payload) {
        global $pdo;

        $userId = (int)($payload['id'] ?? $payload['sub'] ?? 0);
        if ($userId <= 0) {
            return null;
        }

        $result = [
            'id' => $userId,
            'email' => $payload['email'] ?? null,
            'role' => $payload['role'] ?? null,
        ];

        // Role is not always present in auth.php token, fetch from DB when available.
        if ((!$result['role']) && isset($pdo)) {
            $stmt = $pdo->prepare('SELECT role, email FROM users WHERE id = ? LIMIT 1');
            $stmt->execute([$userId]);
            $user = $stmt->fetch();
            if ($user) {
                $result['role'] = $user['role'];
                if (!$result['email']) {
                    $result['email'] = $user['email'];
                }
            }
        }

        return $result;
    }
}

/**
 * Basit token doğrulama fonksiyonu
 */
function verifyJWT($token) {
    $secretKey = $_ENV['JWT_SECRET'] ?? JWT_SECRET_KEY;
    
    try {
        $decoded = JWT::decode($token, new Key($secretKey, 'HS256'));
        return (array) $decoded;
    } catch (Exception $e) {
        return null;
    }
}
