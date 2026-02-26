<?php
/**
 * Live Chat API
 * 
 * Handles chat sessions, messages, and agent assignments
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'config.php';

$input = json_decode(file_get_contents('php://input'), true);
$action = $_GET['action'] ?? $input['action'] ?? '';

try {
    $conn = getDBConnection();

    switch ($action) {
        // Start new chat session
        case 'start_session':
            $name = sanitize($input['name'] ?? '');
            $email = sanitize($input['email'] ?? '');
            $phone = sanitize($input['phone'] ?? '');
            $page = sanitize($input['page'] ?? '');
            
            if (!$name || !$email) {
                throw new Exception('Name and email are required');
            }
            
            // Generate session ID
            $sessionId = bin2hex(random_bytes(16));
            
            // Create session
            $stmt = $conn->prepare("INSERT INTO chat_sessions (session_id, name, email, phone, page_url, status, created_at) VALUES (?, ?, ?, ?, ?, 'active', NOW())");
            $stmt->bind_param('sssss', $sessionId, $name, $email, $phone, $page);
            $stmt->execute();
            $stmt->close();
            
            // Assign random online agent
            $agentsResult = $conn->query("SELECT id, name, avatar, title FROM chat_agents WHERE status = 'online' ORDER BY RAND() LIMIT 1");
            $agent = $agentsResult->fetch_assoc();
            
            if ($agent) {
                // Assign agent
                $stmt = $conn->prepare("UPDATE chat_sessions SET agent_id = ? WHERE session_id = ?");
                $stmt->bind_param('is', $agent['id'], $sessionId);
                $stmt->execute();
                $stmt->close();
                
                // Add welcome message
                $welcomeMsg = "Merhaba $name! Ben {$agent['name']}, {$agent['title']}. Size nasıl yardımcı olabilirim?";
                $stmt = $conn->prepare("INSERT INTO chat_messages (session_id, sender_type, message, created_at) VALUES (?, 'agent', ?, NOW())");
                $stmt->bind_param('ss', $sessionId, $welcomeMsg);
                $stmt->execute();
                $stmt->close();
            }
            
            echo json_encode([
                'success' => true,
                'session_id' => $sessionId,
                'agent' => $agent,
                'message' => 'Session created'
            ]);
            break;
            
        // Send message
        case 'send_message':
            $sessionId = sanitize($input['session_id'] ?? '');
            $message = sanitize($input['message'] ?? '');
            $senderType = sanitize($input['sender_type'] ?? 'user'); // 'user' or 'agent'
            
            if (!$sessionId || !$message) {
                throw new Exception('Session ID and message are required');
            }
            
            // Verify session exists and is active
            $stmt = $conn->prepare("SELECT id FROM chat_sessions WHERE session_id = ? AND status = 'active'");
            $stmt->bind_param('s', $sessionId);
            $stmt->execute();
            if ($stmt->get_result()->num_rows === 0) {
                throw new Exception('Session not found or inactive');
            }
            $stmt->close();
            
            // Insert message
            $stmt = $conn->prepare("INSERT INTO chat_messages (session_id, sender_type, message, created_at) VALUES (?, ?, ?, NOW())");
            $stmt->bind_param('sss', $sessionId, $senderType, $message);
            $stmt->execute();
            $messageId = $stmt->insert_id;
            $stmt->close();
            
            // Update session last activity
            $stmt = $conn->prepare("UPDATE chat_sessions SET last_activity = NOW() WHERE session_id = ?");
            $stmt->bind_param('s', $sessionId);
            $stmt->execute();
            $stmt->close();
            
            echo json_encode([
                'success' => true,
                'message_id' => $messageId,
                'message' => 'Message sent'
            ]);
            break;
            
        // Get messages (polling)
        case 'get_messages':
            $sessionId = sanitize($_GET['session_id'] ?? '');
            $lastId = intval($_GET['last_id'] ?? 0);
            
            if (!$sessionId) {
                throw new Exception('Session ID is required');
            }
            
            // Get messages newer than last_id
            $stmt = $conn->prepare("
                SELECT m.id, m.sender_type, m.message, m.created_at, 
                       a.name as agent_name, a.avatar as agent_avatar
                FROM chat_messages m
                LEFT JOIN chat_agents a ON m.sender_type = 'agent' AND m.session_id IN (
                    SELECT session_id FROM chat_sessions WHERE agent_id = a.id
                )
                WHERE m.session_id = ? AND m.id > ?
                ORDER BY m.created_at ASC
            ");
            $stmt->bind_param('si', $sessionId, $lastId);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $messages = [];
            while ($row = $result->fetch_assoc()) {
                $messages[] = [
                    'id' => $row['id'],
                    'sender' => $row['sender_type'],
                    'text' => $row['message'],
                    'timestamp' => $row['created_at'],
                    'agent_name' => $row['agent_name'],
                    'agent_avatar' => $row['agent_avatar']
                ];
            }
            $stmt->close();
            
            echo json_encode([
                'success' => true,
                'messages' => $messages,
                'count' => count($messages)
            ]);
            break;
            
        // Get active agents
        case 'get_agents':
            $result = $conn->query("SELECT id, name, avatar, title, status FROM chat_agents WHERE status IN ('online', 'busy')");
            
            $agents = [];
            while ($row = $result->fetch_assoc()) {
                $agents[] = $row;
            }
            
            echo json_encode([
                'success' => true,
                'agents' => $agents
            ]);
            break;
            
        // Close session
        case 'close_session':
            $sessionId = sanitize($input['session_id'] ?? '');
            
            if (!$sessionId) {
                throw new Exception('Session ID is required');
            }
            
            $stmt = $conn->prepare("UPDATE chat_sessions SET status = 'closed', closed_at = NOW() WHERE session_id = ?");
            $stmt->bind_param('s', $sessionId);
            $stmt->execute();
            $stmt->close();
            
            echo json_encode([
                'success' => true,
                'message' => 'Session closed'
            ]);
            break;
            
        // Admin: Get all active sessions
        case 'admin_get_sessions':
            // Verify admin (simplified - implement proper auth)
            $apiKey = $_SERVER['HTTP_X_API_KEY'] ?? '';
            if ($apiKey !== 'your-admin-api-key') {
                throw new Exception('Unauthorized');
            }
            
            $result = $conn->query("
                SELECT s.*, a.name as agent_name, a.avatar as agent_avatar,
                       COUNT(m.id) as message_count
                FROM chat_sessions s
                LEFT JOIN chat_agents a ON s.agent_id = a.id
                LEFT JOIN chat_messages m ON s.session_id = m.session_id
                WHERE s.status = 'active'
                GROUP BY s.id
                ORDER BY s.last_activity DESC
            ");
            
            $sessions = [];
            while ($row = $result->fetch_assoc()) {
                $sessions[] = $row;
            }
            
            echo json_encode([
                'success' => true,
                'sessions' => $sessions
            ]);
            break;
            
        default:
            throw new Exception('Invalid action');
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

$conn?->close();
