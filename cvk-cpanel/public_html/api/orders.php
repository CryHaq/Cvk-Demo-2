<?php
/**
 * CVK Dijital - Orders API
 *
 * Endpoints:
 * - POST /api/orders.php                         -> create order (auth)
 * - GET  /api/orders.php?action=my               -> list current user orders (auth)
 * - GET  /api/orders.php?action=admin_list       -> list all orders (admin)
 * - POST /api/orders.php (action=update_status)  -> update order status (admin)
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

    if ($action === 'my') {
        listMyOrders($pdo, $currentUser);
    }

    if ($action === 'admin_list') {
        $auth->requireAdmin($currentUser);
        adminListOrders($pdo);
    }

    if ($action === 'detail') {
        $orderId = (int)($_GET['id'] ?? 0);
        if ($orderId <= 0) {
            jsonResponse(false, 'Geçersiz sipariş ID', null, 400);
        }
        getOrderDetail($pdo, $currentUser, $orderId);
    }

    jsonResponse(false, 'Geçersiz action', null, 400);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Sadece GET/POST istekleri kabul edilir', null, 405);
}

$data = json_decode(file_get_contents('php://input'), true);
if (!is_array($data)) {
    jsonResponse(false, 'Geçersiz JSON verisi', null, 400);
}

$action = $data['action'] ?? 'create';

if ($action === 'create') {
    createOrder($pdo, $currentUser, $data);
}

if ($action === 'update_status') {
    $auth->requireAdmin($currentUser);
    updateOrderStatus($pdo, $currentUser, $data);
}

jsonResponse(false, 'Geçersiz action', null, 400);

function createOrder(PDO $pdo, array $currentUser, array $data): void {
    $required = ['items', 'subtotal', 'vat_amount', 'total_amount', 'shipping_address', 'billing_address'];
    foreach ($required as $field) {
        if (!isset($data[$field])) {
            jsonResponse(false, "Eksik alan: $field", null, 400);
        }
    }

    if (!is_array($data['items']) || count($data['items']) === 0) {
        jsonResponse(false, 'Sipariş kalemleri boş olamaz', null, 400);
    }

    $subtotal = (float)$data['subtotal'];
    $vatAmount = (float)$data['vat_amount'];
    $totalAmount = (float)$data['total_amount'];
    if ($subtotal < 0 || $vatAmount < 0 || $totalAmount <= 0) {
        jsonResponse(false, 'Tutar bilgileri geçersiz', null, 400);
    }

    $userId = (int)$currentUser['id'];
    $orderNumber = generateOrderNumber();
    $shippingAddress = json_encode($data['shipping_address'], JSON_UNESCAPED_UNICODE);
    $billingAddress = json_encode($data['billing_address'], JSON_UNESCAPED_UNICODE);
    $paymentMethod = sanitizeText($data['payment_method'] ?? 'iyzico');
    $customerNote = sanitizeText($data['customer_note'] ?? '');
    $currency = sanitizeText($data['currency'] ?? 'EUR');

    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare(
            "INSERT INTO orders (
                order_number, user_id, subtotal, vat_amount, discount_amount, shipping_cost,
                total_amount, currency, status, payment_status, payment_method,
                shipping_address, billing_address, customer_note, created_at, updated_at
            ) VALUES (
                ?, ?, ?, ?, 0, 0,
                ?, ?, 'pending', 'pending', ?,
                ?, ?, ?, NOW(), NOW()
            )"
        );
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

        $orderId = (int)$pdo->lastInsertId();

        $itemStmt = $pdo->prepare(
            "INSERT INTO order_items (
                order_id, product_type, size, dimensions, material, material_spec,
                optional_features, corner_type, quantity, graphics_count, unit_price,
                total_price, design_file_url, has_zip, has_valve, created_at
            ) VALUES (
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW()
            )"
        );

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

        $historyStmt = $pdo->prepare(
            "INSERT INTO order_status_history (
                order_id, old_status, new_status, changed_by, changed_by_type, note, created_at
            ) VALUES (?, NULL, 'pending', ?, 'customer', 'Sipariş oluşturuldu', NOW())"
        );
        $historyStmt->execute([$orderId, $userId]);

        $pdo->commit();

        jsonResponse(true, 'Sipariş başarıyla oluşturuldu', [
            'order_id' => $orderId,
            'order_number' => $orderNumber,
            'status' => 'pending',
            'payment_status' => 'pending',
        ], 201);
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        jsonResponse(false, 'Sipariş oluşturulamadı: ' . $e->getMessage(), null, 500);
    }
}

function listMyOrders(PDO $pdo, array $currentUser): void {
    $userId = (int)$currentUser['id'];

    $stmt = $pdo->prepare(
        "SELECT id, order_number, user_id, subtotal, vat_amount, discount_amount, shipping_cost,
                total_amount, currency, status, payment_status, payment_method, shipping_company,
                tracking_number, shipping_address, billing_address, created_at, updated_at
         FROM orders
         WHERE user_id = ?
         ORDER BY created_at DESC"
    );
    $stmt->execute([$userId]);
    $orders = hydrateOrders($pdo, $stmt->fetchAll(PDO::FETCH_ASSOC));

    jsonResponse(true, 'Siparişler listelendi', [
        'orders' => $orders,
        'pagination' => [
            'total' => count($orders),
            'page' => 1,
            'limit' => count($orders),
            'total_pages' => 1,
        ],
    ]);
}

function adminListOrders(PDO $pdo): void {
    $status = sanitizeText($_GET['status'] ?? '');
    $limit = max(1, min(500, (int)($_GET['limit'] ?? 200)));

    $params = [];
    $where = '';
    if ($status !== '') {
        $where = 'WHERE status = ?';
        $params[] = $status;
    }

    $countSql = "SELECT COUNT(*) FROM orders $where";
    $countStmt = $pdo->prepare($countSql);
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    $sql = "SELECT id, order_number, user_id, subtotal, vat_amount, discount_amount, shipping_cost,
                   total_amount, currency, status, payment_status, payment_method, shipping_company,
                   tracking_number, shipping_address, billing_address, created_at, updated_at
            FROM orders
            $where
            ORDER BY created_at DESC
            LIMIT $limit";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $orders = hydrateOrders($pdo, $stmt->fetchAll(PDO::FETCH_ASSOC));

    jsonResponse(true, 'Admin sipariş listesi hazır', [
        'orders' => $orders,
        'pagination' => [
            'total' => $total,
            'page' => 1,
            'limit' => $limit,
            'total_pages' => $limit > 0 ? (int)ceil($total / $limit) : 1,
        ],
    ]);
}

function getOrderDetail(PDO $pdo, array $currentUser, int $orderId): void {
    $stmt = $pdo->prepare(
        "SELECT id, order_number, user_id, subtotal, vat_amount, discount_amount, shipping_cost,
                total_amount, currency, status, payment_status, payment_method, shipping_company,
                tracking_number, shipping_address, billing_address, created_at, updated_at
         FROM orders
         WHERE id = ?
         LIMIT 1"
    );
    $stmt->execute([$orderId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        jsonResponse(false, 'Sipariş bulunamadı', null, 404);
    }

    $isAdmin = ($currentUser['role'] ?? '') === 'admin';
    if (!$isAdmin && (int)$row['user_id'] !== (int)$currentUser['id']) {
        jsonResponse(false, 'Bu siparişe erişim yetkiniz yok', null, 403);
    }

    $orders = hydrateOrders($pdo, [$row]);
    jsonResponse(true, 'Sipariş detayı', ['order' => $orders[0] ?? null]);
}

function updateOrderStatus(PDO $pdo, array $currentUser, array $data): void {
    $orderId = (int)($data['orderId'] ?? 0);
    $newStatus = sanitizeText($data['status'] ?? '');
    $note = sanitizeText($data['note'] ?? '');

    $validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if ($orderId <= 0 || !in_array($newStatus, $validStatuses, true)) {
        jsonResponse(false, 'Geçersiz sipariş veya durum', null, 400);
    }

    $stmt = $pdo->prepare('SELECT status FROM orders WHERE id = ? LIMIT 1');
    $stmt->execute([$orderId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        jsonResponse(false, 'Sipariş bulunamadı', null, 404);
    }

    $oldStatus = (string)$row['status'];

    try {
        $pdo->beginTransaction();

        $updateStmt = $pdo->prepare('UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?');
        $updateStmt->execute([$newStatus, $orderId]);

        $historyStmt = $pdo->prepare(
            'INSERT INTO order_status_history (order_id, old_status, new_status, changed_by, changed_by_type, note, created_at)
             VALUES (?, ?, ?, ?, ?, ?, NOW())'
        );
        $historyStmt->execute([
            $orderId,
            $oldStatus,
            $newStatus,
            (int)$currentUser['id'],
            'admin',
            $note !== '' ? $note : "Durum $oldStatus -> $newStatus olarak güncellendi",
        ]);

        $pdo->commit();
        jsonResponse(true, 'Sipariş durumu güncellendi', null, 200);
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        jsonResponse(false, 'Durum güncellenemedi: ' . $e->getMessage(), null, 500);
    }
}

function hydrateOrders(PDO $pdo, array $rows): array {
    if (count($rows) === 0) {
        return [];
    }

    $ids = array_values(array_map(static fn($row) => (int)$row['id'], $rows));
    $placeholders = implode(',', array_fill(0, count($ids), '?'));

    $itemStmt = $pdo->prepare(
        "SELECT id, order_id, product_type, size, dimensions, material, material_spec,
                optional_features, corner_type, quantity, graphics_count, unit_price,
                total_price, design_file_url, has_zip, has_valve
         FROM order_items
         WHERE order_id IN ($placeholders)
         ORDER BY id ASC"
    );
    $itemStmt->execute($ids);
    $itemRows = $itemStmt->fetchAll(PDO::FETCH_ASSOC);

    $historyStmt = $pdo->prepare(
        "SELECT id, order_id, old_status, new_status, changed_by, changed_by_type, note, created_at
         FROM order_status_history
         WHERE order_id IN ($placeholders)
         ORDER BY id ASC"
    );
    $historyStmt->execute($ids);
    $historyRows = $historyStmt->fetchAll(PDO::FETCH_ASSOC);

    $itemsByOrder = [];
    foreach ($itemRows as $item) {
        $orderId = (int)$item['order_id'];
        if (!isset($itemsByOrder[$orderId])) {
            $itemsByOrder[$orderId] = [];
        }
        $itemsByOrder[$orderId][] = [
            'id' => (int)$item['id'],
            'product_type' => $item['product_type'] ?? '',
            'size' => $item['size'] ?? '',
            'dimensions' => $item['dimensions'] ?? '',
            'material' => $item['material'] ?? '',
            'material_spec' => $item['material_spec'] ?? '',
            'optional_features' => $item['optional_features'] ?? '',
            'corner_type' => $item['corner_type'] ?? '',
            'quantity' => (int)$item['quantity'],
            'graphics_count' => (int)$item['graphics_count'],
            'unit_price' => (float)$item['unit_price'],
            'total_price' => (float)$item['total_price'],
            'design_file_url' => $item['design_file_url'] ?? '',
            'has_zip' => (int)$item['has_zip'] === 1,
            'has_valve' => (int)$item['has_valve'] === 1,
        ];
    }

    $historyByOrder = [];
    foreach ($historyRows as $history) {
        $orderId = (int)$history['order_id'];
        if (!isset($historyByOrder[$orderId])) {
            $historyByOrder[$orderId] = [];
        }
        $historyByOrder[$orderId][] = [
            'id' => (int)$history['id'],
            'old_status' => $history['old_status'],
            'new_status' => $history['new_status'],
            'changed_by' => (int)$history['changed_by'],
            'changed_by_type' => $history['changed_by_type'] ?? 'system',
            'note' => $history['note'] ?? '',
            'created_at' => $history['created_at'],
        ];
    }

    $orders = [];
    foreach ($rows as $row) {
        $orderId = (int)$row['id'];
        $shipping = json_decode((string)$row['shipping_address'], true);
        $billing = json_decode((string)$row['billing_address'], true);

        $orders[] = [
            'id' => $orderId,
            'order_number' => $row['order_number'],
            'user_id' => (int)$row['user_id'],
            'subtotal' => (float)$row['subtotal'],
            'vat_amount' => (float)$row['vat_amount'],
            'discount_amount' => (float)$row['discount_amount'],
            'shipping_cost' => (float)$row['shipping_cost'],
            'total_amount' => (float)$row['total_amount'],
            'currency' => $row['currency'] ?? 'EUR',
            'status' => $row['status'],
            'payment_status' => $row['payment_status'],
            'payment_method' => $row['payment_method'] ?? '',
            'shipping_company' => $row['shipping_company'] ?? '',
            'tracking_number' => $row['tracking_number'] ?? '',
            'shipping_address' => is_array($shipping) ? $shipping : [],
            'billing_address' => is_array($billing) ? $billing : [],
            'items' => $itemsByOrder[$orderId] ?? [],
            'status_history' => $historyByOrder[$orderId] ?? [],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at'],
        ];
    }

    return $orders;
}

function generateOrderNumber(): string {
    return 'CVK-' . date('Ymd') . '-' . strtoupper(substr(uniqid('', true), -6));
}

function sanitizeText($value): string {
    return trim((string)$value);
}
