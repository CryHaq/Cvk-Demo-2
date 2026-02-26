<?php
/**
 * Blog API Endpoints
 * 
 * Actions:
 * - list: Get all blog posts (with optional filters)
 * - get: Get single post by slug
 * - create: Create new post (admin only)
 * - update: Update post (admin only)
 * - delete: Delete post (admin only)
 * - categories: Get all categories
 * - comments: Get comments for a post
 * - add_comment: Add comment to post
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'config.php';

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);
$action = $_GET['action'] ?? $input['action'] ?? '';

// JWT Helper functions
function generateJWT($payload) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload['iat'] = time();
    $payload['exp'] = time() + (24 * 60 * 60); // 24 hours
    
    $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(json_encode($payload)));
    
    $signature = hash_hmac('sha256', "$base64Header.$base64Payload", JWT_SECRET_KEY, true);
    $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    return "$base64Header.$base64Payload.$base64Signature";
}

function verifyJWT($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return false;
    
    $expectedSignature = hash_hmac('sha256', $parts[0] . '.' . $parts[1], JWT_SECRET_KEY, true);
    $signature = str_replace(['-', '_'], ['+', '/'], $parts[2]);
    $signature .= str_repeat('=', (4 - strlen($signature) % 4) % 4);
    if (!hash_equals($expectedSignature, base64_decode($signature))) {
        return false;
    }

    $payloadBase64 = str_replace(['-', '_'], ['+', '/'], $parts[1]);
    $payloadBase64 .= str_repeat('=', (4 - strlen($payloadBase64) % 4) % 4);
    $payload = json_decode(base64_decode($payloadBase64), true);
    if (!$payload || !isset($payload['exp']) || $payload['exp'] < time()) {
        return false;
    }
    
    return $payload;
}

function getAuthUser() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? ($headers['authorization'] ?? '');
    
    if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        return null;
    }
    
    $payload = verifyJWT($matches[1]);
    if (!$payload) return null;
    
    return $payload;
}

function requireAdmin($conn) {
    $user = getAuthUser();
    if (!$user) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Unauthorized']);
        exit;
    }
    
    $userId = intval($user['sub'] ?? $user['id'] ?? 0);
    if ($userId <= 0) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Unauthorized']);
        exit;
    }

    $stmt = $conn->prepare("SELECT role FROM users WHERE id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $dbUser = $result->fetch_assoc();
    
    if (!$dbUser || $dbUser['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Admin access required']);
        exit;
    }
    
    return $user;
}

// Generate slug from title
function generateSlug($title) {
    $slug = strtolower(trim($title));
    $slug = preg_replace('/[^a-z0-9-]/', '-', $slug);
    $slug = preg_replace('/-+/', '-', $slug);
    return trim($slug, '-');
}

try {
    $conn = new mysqli(DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME);
    $conn->set_charset("utf8mb4");
    
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    switch ($action) {
        // LIST POSTS
        case 'list':
            $category = $_GET['category'] ?? '';
            $search = $_GET['search'] ?? '';
            $page = max(1, intval($_GET['page'] ?? 1));
            $limit = min(50, max(1, intval($_GET['limit'] ?? 12)));
            $offset = ($page - 1) * $limit;
            
            $where = ["status = 'published'"];
            $params = [];
            $types = '';
            
            if ($category && $category !== 'all') {
                $where[] = "category_slug = ?";
                $params[] = $category;
                $types .= 's';
            }
            
            if ($search) {
                $where[] = "(title LIKE ? OR excerpt LIKE ? OR content LIKE ?)";
                $searchTerm = "%$search%";
                $params[] = $searchTerm;
                $params[] = $searchTerm;
                $params[] = $searchTerm;
                $types .= 'sss';
            }
            
            $whereClause = implode(' AND ', $where);
            
            // Get total count
            $countSql = "SELECT COUNT(*) as total FROM blog_posts WHERE $whereClause";
            $countStmt = $conn->prepare($countSql);
            if ($params) {
                $countStmt->bind_param($types, ...$params);
            }
            $countStmt->execute();
            $total = $countStmt->get_result()->fetch_assoc()['total'];
            
            // Get posts
            $sql = "SELECT id, title, excerpt, slug, image, author, author_bio, 
                           DATE_FORMAT(created_at, '%d %M %Y') as date, 
                           read_time, category, category_slug, tags, views, likes
                    FROM blog_posts 
                    WHERE $whereClause
                    ORDER BY created_at DESC
                    LIMIT ? OFFSET ?";
            
            $stmt = $conn->prepare($sql);
            $params[] = $limit;
            $params[] = $offset;
            $types .= 'ii';
            $stmt->bind_param($types, ...$params);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $posts = [];
            while ($row = $result->fetch_assoc()) {
                $row['tags'] = json_decode($row['tags'] ?? '[]', true);
                $posts[] = $row;
            }
            
            echo json_encode([
                'success' => true,
                'posts' => $posts,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $total,
                    'pages' => ceil($total / $limit)
                ]
            ]);
            break;
            
        // GET SINGLE POST
        case 'get':
            $slug = $_GET['slug'] ?? '';
            if (!$slug) {
                throw new Exception('Slug required');
            }
            
            $stmt = $conn->prepare("
                SELECT id, title, excerpt, content, slug, image, author, author_bio,
                       DATE_FORMAT(created_at, '%d %M %Y') as date,
                       read_time, category, category_slug, tags, views, likes
                FROM blog_posts 
                WHERE slug = ? AND status = 'published'
            ");
            $stmt->bind_param('s', $slug);
            $stmt->execute();
            $result = $stmt->get_result();
            $post = $result->fetch_assoc();
            
            if (!$post) {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Post not found']);
                exit;
            }
            
            // Increment views
            $conn->query("UPDATE blog_posts SET views = views + 1 WHERE id = {$post['id']}");
            $post['views']++;
            
            $post['tags'] = json_decode($post['tags'] ?? '[]', true);
            
            // Get related posts
            $relatedStmt = $conn->prepare("
                SELECT id, title, slug, image, DATE_FORMAT(created_at, '%d %M %Y') as date, read_time
                FROM blog_posts 
                WHERE category_slug = ? AND id != ? AND status = 'published'
                ORDER BY created_at DESC
                LIMIT 3
            ");
            $relatedStmt->bind_param('si', $post['category_slug'], $post['id']);
            $relatedStmt->execute();
            $relatedResult = $relatedStmt->get_result();
            
            $related = [];
            while ($row = $relatedResult->fetch_assoc()) {
                $related[] = $row;
            }
            
            // Get comments
            $commentsStmt = $conn->prepare("
                SELECT id, author_name, author_email, content, 
                       DATE_FORMAT(created_at, '%d %M %Y') as date,
                       parent_id
                FROM blog_comments 
                WHERE post_id = ? AND status = 'approved'
                ORDER BY created_at ASC
            ");
            $commentsStmt->bind_param('i', $post['id']);
            $commentsStmt->execute();
            $commentsResult = $commentsStmt->get_result();
            
            $comments = [];
            while ($row = $commentsResult->fetch_assoc()) {
                $comments[] = $row;
            }
            
            echo json_encode([
                'success' => true,
                'post' => $post,
                'related' => $related,
                'comments' => $comments
            ]);
            break;
            
        // CREATE POST (Admin only)
        case 'create':
            requireAdmin($conn);
            
            $title = $input['title'] ?? '';
            $content = $input['content'] ?? '';
            $excerpt = $input['excerpt'] ?? substr(strip_tags($content), 0, 200) . '...';
            $image = $input['image'] ?? '';
            $author = $input['author'] ?? 'CVK Ambalaj';
            $authorBio = $input['authorBio'] ?? '';
            $category = $input['category'] ?? 'Genel';
            $categorySlug = generateSlug($category);
            $tags = json_encode($input['tags'] ?? []);
            $readTime = $input['readTime'] ?? '5 dk';
            $status = $input['status'] ?? 'published';
            $slug = generateSlug($title);
            
            // Check slug uniqueness
            $checkStmt = $conn->prepare("SELECT id FROM blog_posts WHERE slug = ?");
            $checkStmt->bind_param('s', $slug);
            $checkStmt->execute();
            if ($checkStmt->get_result()->num_rows > 0) {
                $slug .= '-' . time();
            }
            
            $stmt = $conn->prepare("
                INSERT INTO blog_posts (title, slug, excerpt, content, image, author, author_bio,
                                       category, category_slug, tags, read_time, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ");
            $stmt->bind_param('ssssssssssss', $title, $slug, $excerpt, $content, $image, 
                             $author, $authorBio, $category, $categorySlug, $tags, $readTime, $status);
            
            if ($stmt->execute()) {
                echo json_encode([
                    'success' => true,
                    'id' => $stmt->insert_id,
                    'slug' => $slug,
                    'message' => 'Post created successfully'
                ]);
            } else {
                throw new Exception('Failed to create post: ' . $stmt->error);
            }
            break;
            
        // UPDATE POST (Admin only)
        case 'update':
            requireAdmin($conn);
            
            $id = intval($input['id'] ?? 0);
            if (!$id) {
                throw new Exception('Post ID required');
            }
            
            $fields = [];
            $params = [];
            $types = '';
            
            $allowedFields = [
                'title' => 's',
                'content' => 's',
                'excerpt' => 's',
                'image' => 's',
                'author' => 's',
                'authorBio' => 's',
                'category' => 's',
                'readTime' => 's',
                'status' => 's'
            ];
            
            foreach ($allowedFields as $field => $type) {
                if (isset($input[$field])) {
                    $dbField = $field === 'authorBio' ? 'author_bio' : 
                               ($field === 'readTime' ? 'read_time' : $field);
                    $fields[] = "$dbField = ?";
                    $params[] = $input[$field];
                    $types .= $type;
                }
            }
            
            if (isset($input['category'])) {
                $fields[] = "category_slug = ?";
                $params[] = generateSlug($input['category']);
                $types .= 's';
            }
            
            if (isset($input['tags'])) {
                $fields[] = "tags = ?";
                $params[] = json_encode($input['tags']);
                $types .= 's';
            }
            
            if (isset($input['title'])) {
                $fields[] = "slug = ?";
                $params[] = generateSlug($input['title']);
                $types .= 's';
            }
            
            if (empty($fields)) {
                throw new Exception('No fields to update');
            }
            
            $sql = "UPDATE blog_posts SET " . implode(', ', $fields) . ", updated_at = NOW() WHERE id = ?";
            $params[] = $id;
            $types .= 'i';
            
            $stmt = $conn->prepare($sql);
            $stmt->bind_param($types, ...$params);
            
            if ($stmt->execute()) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Post updated successfully'
                ]);
            } else {
                throw new Exception('Failed to update post: ' . $stmt->error);
            }
            break;
            
        // DELETE POST (Admin only)
        case 'delete':
            requireAdmin($conn);
            
            $id = intval($input['id'] ?? 0);
            if (!$id) {
                throw new Exception('Post ID required');
            }
            
            $stmt = $conn->prepare("DELETE FROM blog_posts WHERE id = ?");
            $stmt->bind_param('i', $id);
            
            if ($stmt->execute()) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Post deleted successfully'
                ]);
            } else {
                throw new Exception('Failed to delete post: ' . $stmt->error);
            }
            break;
            
        // GET CATEGORIES
        case 'categories':
            $result = $conn->query("
                SELECT category, category_slug as slug, COUNT(*) as count
                FROM blog_posts 
                WHERE status = 'published'
                GROUP BY category_slug, category
                ORDER BY count DESC
            ");
            
            $categories = [['category' => 'Tümü', 'slug' => 'all', 'count' => 0]];
            $total = 0;
            
            while ($row = $result->fetch_assoc()) {
                $categories[] = $row;
                $total += $row['count'];
            }
            $categories[0]['count'] = $total;
            
            echo json_encode([
                'success' => true,
                'categories' => $categories
            ]);
            break;
            
        // ADD COMMENT
        case 'add_comment':
            $postId = intval($input['postId'] ?? 0);
            $authorName = trim($input['authorName'] ?? '');
            $authorEmail = trim($input['authorEmail'] ?? '');
            $content = trim($input['content'] ?? '');
            $parentId = !empty($input['parentId']) ? intval($input['parentId']) : null;
            
            if (!$postId || !$authorName || !$authorEmail || !$content) {
                throw new Exception('All fields are required');
            }
            
            if (!filter_var($authorEmail, FILTER_VALIDATE_EMAIL)) {
                throw new Exception('Invalid email address');
            }
            
            // Check if post exists
            $checkStmt = $conn->prepare("SELECT id FROM blog_posts WHERE id = ? AND status = 'published'");
            $checkStmt->bind_param('i', $postId);
            $checkStmt->execute();
            if ($checkStmt->get_result()->num_rows === 0) {
                throw new Exception('Post not found');
            }
            
            // Check for spam (basic)
            $forbiddenWords = ['http://', 'https://', 'www.', '.com', '.net', '.org'];
            foreach ($forbiddenWords as $word) {
                if (stripos($content, $word) !== false) {
                    throw new Exception('Links are not allowed in comments');
                }
            }
            
            $stmt = $conn->prepare("
                INSERT INTO blog_comments (post_id, author_name, author_email, content, parent_id, status, created_at)
                VALUES (?, ?, ?, ?, ?, 'pending', NOW())
            ");
            
            if ($parentId) {
                $stmt->bind_param('isssi', $postId, $authorName, $authorEmail, $content, $parentId);
            } else {
                $stmt->bind_param('isssi', $postId, $authorName, $authorEmail, $content, $parentId);
            }
            
            if ($stmt->execute()) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Comment submitted for moderation'
                ]);
            } else {
                throw new Exception('Failed to add comment: ' . $stmt->error);
            }
            break;
            
        // ADMIN: GET ALL POSTS (for admin panel)
        case 'admin_list':
            requireAdmin($conn);
            
            $page = max(1, intval($_GET['page'] ?? 1));
            $limit = min(50, max(1, intval($_GET['limit'] ?? 20)));
            $offset = ($page - 1) * $limit;
            $status = $_GET['status'] ?? '';
            
            $where = "1=1";
            $params = [];
            $types = '';
            
            if ($status) {
                $where .= " AND status = ?";
                $params[] = $status;
                $types .= 's';
            }
            
            // Get total
            $countSql = "SELECT COUNT(*) as total FROM blog_posts WHERE $where";
            $countStmt = $conn->prepare($countSql);
            if ($params) {
                $countStmt->bind_param($types, ...$params);
            }
            $countStmt->execute();
            $total = $countStmt->get_result()->fetch_assoc()['total'];
            
            // Get posts
            $sql = "SELECT id, title, slug, category, status, views, likes,
                           DATE_FORMAT(created_at, '%d %M %Y') as date
                    FROM blog_posts 
                    WHERE $where
                    ORDER BY created_at DESC
                    LIMIT ? OFFSET ?";
            
            $params[] = $limit;
            $params[] = $offset;
            $types .= 'ii';
            
            $stmt = $conn->prepare($sql);
            $stmt->bind_param($types, ...$params);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $posts = [];
            while ($row = $result->fetch_assoc()) {
                $posts[] = $row;
            }
            
            echo json_encode([
                'success' => true,
                'posts' => $posts,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $total,
                    'pages' => ceil($total / $limit)
                ]
            ]);
            break;
            
        // ADMIN: MODERATE COMMENTS
        case 'moderate_comment':
            requireAdmin($conn);
            
            $commentId = intval($input['commentId'] ?? 0);
            $action_type = $input['action'] ?? ''; // approve, reject, delete
            
            if (!$commentId || !in_array($action_type, ['approve', 'reject', 'delete'])) {
                throw new Exception('Invalid parameters');
            }
            
            if ($action_type === 'delete') {
                $stmt = $conn->prepare("DELETE FROM blog_comments WHERE id = ?");
                $stmt->bind_param('i', $commentId);
            } else {
                $status = $action_type === 'approve' ? 'approved' : 'rejected';
                $stmt = $conn->prepare("UPDATE blog_comments SET status = ? WHERE id = ?");
                $stmt->bind_param('si', $status, $commentId);
            }
            
            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Comment moderated']);
            } else {
                throw new Exception('Failed to moderate comment');
            }
            break;
            
        default:
            throw new Exception('Invalid action');
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

$conn?->close();
