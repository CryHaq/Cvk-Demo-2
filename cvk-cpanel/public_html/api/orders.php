<?php
/**
 * CVK Dijital - Orders API
 *
 * Endpoints:
 * - POST /api/orders.php           -> create order
 * - GET  /api/orders.php?action=my -> list current user orders
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config/database.php';
require_once '../middleware/auth.php';
require_once '../utils/response.php';

$auth = new AuthMiddleware();
$currentUser = $auth->verifyToken();

if (!$currentUser) {
    jsonResponse(false, 'Yetkisiz erişim', null, 401);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $action = $_GET['action'] ?? 'my';
    if ($action !== 'my') {
        jsonResponse(false, 'Geçersiz action', null, 400);
    }
    listMyOrders($pdo, $currentUser);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Sadece GET/POST istekleri kabul edilir', null, 405);
}

$data = json_decode(file_get_contents('php://input'), true);
if (!is_array($data)) {
    jsonResponse(false, 'Geçersiz JSON verisi', null, 400);
}

createOrder($pdo, $currentUser, $data);

function createOrder($pdo, $currentUser, $data) {
    $required = ['items', 'subtotal', 'vat_amount', 'total_amount', 'shipping_address', 'billing_address'];
    foreach ($required as $field) {
        if (!isset($data[$field])) {
            jsonResponse(false, "Eksik alan: $field", null, 400);
        }
    }

    if (!is_array($data['items']) || count($data['items']) === 0) {
        jsonResponse(false, 'Sipariş kalemleri boş olamaz', null, 400);
    }

    $subtotal = (float) $data['subtotal'];
    $vatAmount = (float) $data['vat_amount'];
    $totalAmount = (float) $data['total_amount'];
    if ($subtotal < 0 || $vatAmount < 0 || $totalAmount <= 0) {
        jsonResponse(false, 'Tutar bilgileri geçersiz', null, 400);
    }

    $userId = (int) $currentUser['id'];
    $orderNumber = generateOrderNumber();
    $shippingAddress = json_encode($data['shipping_address'], JSON_UNESCAPED_UNICODE);
    $billingAddress = json_encode($data['billing_address'], JSON_UNESCAPED_UNICODE);
    $paymentMethod = sanitizeText($data['payment_method'] ?? 'iyzico');
    $customerNote = sanitizeText($data['customer_note'] ?? '');
    $currency = sanitizeText($data['currency'] ?? 'EUR');

    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare("
            INSERT INTO orders (
                order_number, user_id, subtotal, vat_amount, discount_amount, shipping_cost,
                total_amount, currency, status, payment_status, payment_method,
                shipping_address, billing_address, customer_note, created_at, updated_at
            ) VALUES (
                ?, ?, ?, ?, 0, 0,
                ?, ?, 'pending', 'pending', ?,
                ?, ?, ?, NOW(), NOW()
            )
        ");
        $stmt->execute([
            $orderNumber,
            $userId,
            $subtotal,
            $vatAmount,
            $totalAmount,
            $currency,
            $paymentMethod,
            $shippingAddress,
            $billingAddress,
            $customerNote,
        ]);

        $orderId = (int) $pdo->lastInsertId();

        $itemStmt = $pdo->prepare("
            INSERT INTO order_items (
                order_id, product_type, size, dimensions, material, material_spec,
                optional_features, corner_type, quantity, graphics_count, unit_price,
                total_price, design_file_url, has_zip, has_valve, created_at
            ) VALUES (
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW()
            )
        ");

        foreach ($data['items'] as $item) {
            $itemStmt->execute([
                $orderId,
                sanitizeText($item['product_type'] ?? 'Stand-Up Pouch'),
                sanitizeText($item['size'] ?? ''),
                sanitizeText($item['dimensions'] ?? ''),
                sanitizeText($item['material'] ?? ''),
                sanitizeText($item['material_spec'] ?? ''),
                sanitizeText($item['optional_features'] ?? ''),
                sanitizeText($item['corner_type'] ?? ''),
                max(1, (int)($item['quantity'] ?? 1)),
                max(1, (int)($item['graphics_count'] ?? 1)),
                (float)($item['unit_price'] ?? 0),
                (float)($item['total_price'] ?? 0),
                sanitizeText($item['design_file_url'] ?? ''),
                !empty($item['has_zip']) ? 1 : 0,
                !empty($item['has_valve']) ? 1 : 0,
            ]);
        }

        $historyStmt = $pdo->prepare("
            INSERT INTO order_status_history (
                order_id, old_status, new_status, changed_by, changed_by_type, note, created_at
            ) VALUES (?, NULL, 'pending', ?, 'customer', 'Sipariş oluşturuldu', NOW())
        ");
        $historyStmt->execute([$orderId, $userId]);

        $pdo->commit();

        jsonResponse(true, 'Sipariş başarıyla oluşturuldu', [
            'order_id' => $orderId,
            'order_number' => $orderNumber,
            'status' => 'pending',
            'payment_status' => 'pending',
        ], 201);
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        jsonResponse(false, 'Sipariş oluşturulamadı: ' . $e->getMessage(), null, 500);
    }
}

function listMyOrders($pdo, $currentUser) {
    $userId = (int) $currentUser['id'];
    $stmt = $pdo->prepare("
        SELECT id, order_number, total_amount, currency, status, payment_status, created_at
        FROM orders
        WHERE user_id = ?
        ORDER BY created_at DESC
    ");
    $stmt->execute([$userId]);
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    jsonResponse(true, 'Siparişler listelendi', ['orders' => $orders]);
}

function generateOrderNumber() {
    return 'CVK-' . date('Ymd') . '-' . strtoupper(substr(uniqid('', true), -6));
}

function sanitizeText($value) {
    return trim((string)$value);
}
