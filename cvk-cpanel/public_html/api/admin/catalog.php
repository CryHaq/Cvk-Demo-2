<?php
/**
 * Admin Catalog API
 *
 * Stores admin product/inventory state in SQL so panel is shared across devices.
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../utils/response.php';

$auth = new AuthMiddleware();
$currentUser = $auth->verifyToken();
if (!$currentUser) {
    jsonResponse(false, 'Yetkisiz erişim', null, 401);
}
$auth->requireAdmin($currentUser);

ensureCatalogTables($pdo);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $action = $_GET['action'] ?? 'snapshot';
    if ($action !== 'snapshot') {
        jsonResponse(false, 'Geçersiz action', null, 400);
    }
    getSnapshot($pdo);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Sadece GET/POST desteklenir', null, 405);
}

$body = json_decode(file_get_contents('php://input'), true);
if (!is_array($body)) {
    jsonResponse(false, 'Geçersiz JSON', null, 400);
}

$action = $body['action'] ?? '';
if ($action !== 'save_snapshot') {
    jsonResponse(false, 'Geçersiz action', null, 400);
}

saveSnapshot($pdo, $body);

function ensureCatalogTables(PDO $pdo): void {
    $queries = [
        "CREATE TABLE IF NOT EXISTS admin_products (
            id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            slug VARCHAR(255) NOT NULL,
            image VARCHAR(500) DEFAULT '',
            category VARCHAR(120) DEFAULT '',
            sub_category VARCHAR(120) DEFAULT '',
            tags_json JSON DEFAULT NULL,
            status ENUM('active', 'passive', 'out_of_stock') DEFAULT 'active',
            description TEXT,
            meta_title VARCHAR(255) DEFAULT '',
            meta_description TEXT,
            base_price DECIMAL(10,2) DEFAULT 0,
            updated_at DATETIME NOT NULL,
            PRIMARY KEY (id),
            UNIQUE KEY uniq_slug (slug)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

        "CREATE TABLE IF NOT EXISTS admin_product_variants (
            id VARCHAR(120) NOT NULL,
            product_id INT NOT NULL,
            size VARCHAR(80) DEFAULT '',
            color VARCHAR(80) DEFAULT '',
            palette VARCHAR(80) DEFAULT '',
            subscription VARCHAR(120) DEFAULT '',
            sku VARCHAR(120) DEFAULT '',
            barcode VARCHAR(120) DEFAULT '',
            price DECIMAL(10,2) DEFAULT 0,
            stock INT DEFAULT 0,
            PRIMARY KEY (id),
            KEY idx_product_id (product_id),
            KEY idx_sku (sku),
            CONSTRAINT fk_admin_variants_product FOREIGN KEY (product_id) REFERENCES admin_products(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

        "CREATE TABLE IF NOT EXISTS inventory_depots (
            name VARCHAR(120) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

        "CREATE TABLE IF NOT EXISTS inventory_depot_stocks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            variant_id VARCHAR(120) NOT NULL,
            depot_name VARCHAR(120) NOT NULL,
            stock INT DEFAULT 0,
            min_stock INT DEFAULT 0,
            UNIQUE KEY uniq_variant_depot (variant_id, depot_name),
            KEY idx_variant_id (variant_id),
            KEY idx_depot_name (depot_name),
            CONSTRAINT fk_inventory_stock_variant FOREIGN KEY (variant_id) REFERENCES admin_product_variants(id) ON DELETE CASCADE,
            CONSTRAINT fk_inventory_stock_depot FOREIGN KEY (depot_name) REFERENCES inventory_depots(name) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

        "CREATE TABLE IF NOT EXISTS inventory_movements (
            id VARCHAR(160) NOT NULL,
            movement_at DATETIME NOT NULL,
            product_id INT NOT NULL,
            variant_id VARCHAR(120) NOT NULL,
            depot_name VARCHAR(120) NOT NULL,
            movement_type ENUM('in', 'out', 'return') NOT NULL,
            quantity INT NOT NULL,
            note TEXT,
            PRIMARY KEY (id),
            KEY idx_variant_id (variant_id),
            KEY idx_product_id (product_id),
            KEY idx_depot_name (depot_name),
            CONSTRAINT fk_inventory_movement_variant FOREIGN KEY (variant_id) REFERENCES admin_product_variants(id) ON DELETE CASCADE,
            CONSTRAINT fk_inventory_movement_depot FOREIGN KEY (depot_name) REFERENCES inventory_depots(name) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

        "CREATE TABLE IF NOT EXISTS admin_settings (
            setting_key VARCHAR(120) NOT NULL,
            setting_value JSON DEFAULT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (setting_key)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
    ];

    foreach ($queries as $sql) {
        $pdo->exec($sql);
    }
}

function getSnapshot(PDO $pdo): void {
    $productRows = $pdo->query('SELECT * FROM admin_products ORDER BY id DESC')->fetchAll(PDO::FETCH_ASSOC);
    $variantRows = $pdo->query('SELECT * FROM admin_product_variants ORDER BY product_id ASC')->fetchAll(PDO::FETCH_ASSOC);

    $variantMap = [];
    foreach ($variantRows as $variant) {
        $productId = (int)$variant['product_id'];
        if (!isset($variantMap[$productId])) {
            $variantMap[$productId] = [];
        }
        $variantMap[$productId][] = [
            'id' => $variant['id'],
            'size' => $variant['size'] ?? '',
            'color' => $variant['color'] ?? '',
            'palette' => $variant['palette'] ?? '',
            'subscription' => $variant['subscription'] ?? '',
            'sku' => $variant['sku'] ?? '',
            'barcode' => $variant['barcode'] ?? '',
            'price' => (float)$variant['price'],
            'stock' => (int)$variant['stock'],
        ];
    }

    $products = [];
    foreach ($productRows as $row) {
        $tags = json_decode((string)($row['tags_json'] ?? '[]'), true);
        if (!is_array($tags)) {
            $tags = [];
        }

        $id = (int)$row['id'];
        $products[] = [
            'id' => $id,
            'name' => $row['name'] ?? '',
            'slug' => $row['slug'] ?? '',
            'image' => $row['image'] ?? '',
            'category' => $row['category'] ?? '',
            'subCategory' => $row['sub_category'] ?? '',
            'tags' => $tags,
            'status' => $row['status'] ?? 'active',
            'description' => $row['description'] ?? '',
            'metaTitle' => $row['meta_title'] ?? '',
            'metaDescription' => $row['meta_description'] ?? '',
            'basePrice' => (float)$row['base_price'],
            'updatedAt' => isset($row['updated_at']) ? date(DATE_ATOM, strtotime((string)$row['updated_at'])) : date(DATE_ATOM),
            'variants' => $variantMap[$id] ?? [],
        ];
    }

    $depotRows = $pdo->query('SELECT name FROM inventory_depots ORDER BY name ASC')->fetchAll(PDO::FETCH_ASSOC);
    $depots = array_map(static fn($row) => $row['name'], $depotRows);

    $stockRows = $pdo->query('SELECT variant_id, depot_name, stock, min_stock FROM inventory_depot_stocks')->fetchAll(PDO::FETCH_ASSOC);
    $depotStocks = array_map(static fn($row) => [
        'variantId' => $row['variant_id'],
        'depot' => $row['depot_name'],
        'stock' => (int)$row['stock'],
        'minStock' => (int)$row['min_stock'],
    ], $stockRows);

    $movementRows = $pdo->query('SELECT id, movement_at, product_id, variant_id, depot_name, movement_type, quantity, note FROM inventory_movements ORDER BY movement_at DESC LIMIT 5000')->fetchAll(PDO::FETCH_ASSOC);
    $inventoryMovements = array_map(static fn($row) => [
        'id' => $row['id'],
        'timestamp' => date(DATE_ATOM, strtotime((string)$row['movement_at'])),
        'productId' => (int)$row['product_id'],
        'variantId' => $row['variant_id'],
        'depot' => $row['depot_name'],
        'type' => $row['movement_type'],
        'quantity' => (int)$row['quantity'],
        'note' => $row['note'] ?? '',
    ], $movementRows);

    $settingsStmt = $pdo->prepare('SELECT setting_value FROM admin_settings WHERE setting_key = ? LIMIT 1');
    $settingsStmt->execute(['inventory_processed_order_ids']);
    $settingRow = $settingsStmt->fetch(PDO::FETCH_ASSOC);
    $processedOrderIds = [];
    if ($settingRow && isset($settingRow['setting_value'])) {
        $decoded = json_decode((string)$settingRow['setting_value'], true);
        if (is_array($decoded)) {
            $processedOrderIds = array_values(array_map('intval', $decoded));
        }
    }

    successResponse([
        'products' => $products,
        'depots' => $depots,
        'depotStocks' => $depotStocks,
        'inventoryMovements' => $inventoryMovements,
        'processedOrderIds' => $processedOrderIds,
    ], 'Katalog verisi hazır');
}

function saveSnapshot(PDO $pdo, array $payload): void {
    $products = isset($payload['products']) && is_array($payload['products']) ? $payload['products'] : [];
    $depots = isset($payload['depots']) && is_array($payload['depots']) ? $payload['depots'] : [];
    $depotStocks = isset($payload['depotStocks']) && is_array($payload['depotStocks']) ? $payload['depotStocks'] : [];
    $inventoryMovements = isset($payload['inventoryMovements']) && is_array($payload['inventoryMovements']) ? $payload['inventoryMovements'] : [];
    $processedOrderIds = isset($payload['processedOrderIds']) && is_array($payload['processedOrderIds'])
        ? array_values(array_map('intval', $payload['processedOrderIds']))
        : [];

    try {
        $pdo->beginTransaction();

        $pdo->exec('DELETE FROM inventory_movements');
        $pdo->exec('DELETE FROM inventory_depot_stocks');
        $pdo->exec('DELETE FROM inventory_depots');
        $pdo->exec('DELETE FROM admin_product_variants');
        $pdo->exec('DELETE FROM admin_products');

        $insertProduct = $pdo->prepare(
            'INSERT INTO admin_products (id, name, slug, image, category, sub_category, tags_json, status, description, meta_title, meta_description, base_price, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );

        $insertVariant = $pdo->prepare(
            'INSERT INTO admin_product_variants (id, product_id, size, color, palette, subscription, sku, barcode, price, stock)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );

        $validVariantIds = [];
        $validProductIds = [];

        foreach ($products as $product) {
            $productId = (int)($product['id'] ?? 0);
            if ($productId <= 0) {
                continue;
            }

            $validProductIds[$productId] = true;

            $updatedAt = $product['updatedAt'] ?? date(DATE_ATOM);
            $updatedAtSql = date('Y-m-d H:i:s', strtotime((string)$updatedAt));
            $tagsJson = json_encode(array_values(array_filter((array)($product['tags'] ?? []))), JSON_UNESCAPED_UNICODE);

            $insertProduct->execute([
                $productId,
                trim((string)($product['name'] ?? '')),
                trim((string)($product['slug'] ?? '')),
                trim((string)($product['image'] ?? '')),
                trim((string)($product['category'] ?? '')),
                trim((string)($product['subCategory'] ?? '')),
                $tagsJson,
                in_array(($product['status'] ?? 'active'), ['active', 'passive', 'out_of_stock'], true) ? $product['status'] : 'active',
                trim((string)($product['description'] ?? '')),
                trim((string)($product['metaTitle'] ?? '')),
                trim((string)($product['metaDescription'] ?? '')),
                (float)($product['basePrice'] ?? 0),
                $updatedAtSql,
            ]);

            $variants = isset($product['variants']) && is_array($product['variants']) ? $product['variants'] : [];
            foreach ($variants as $variant) {
                $variantId = trim((string)($variant['id'] ?? ''));
                if ($variantId === '') {
                    continue;
                }

                $validVariantIds[$variantId] = true;

                $insertVariant->execute([
                    $variantId,
                    $productId,
                    trim((string)($variant['size'] ?? '')),
                    trim((string)($variant['color'] ?? '')),
                    trim((string)($variant['palette'] ?? '')),
                    trim((string)($variant['subscription'] ?? '')),
                    trim((string)($variant['sku'] ?? '')),
                    trim((string)($variant['barcode'] ?? '')),
                    (float)($variant['price'] ?? 0),
                    max(0, (int)($variant['stock'] ?? 0)),
                ]);
            }
        }

        $insertDepot = $pdo->prepare('INSERT INTO inventory_depots (name) VALUES (?)');
        $validDepots = [];
        foreach ($depots as $depot) {
            $name = trim((string)$depot);
            if ($name === '') {
                continue;
            }
            if (isset($validDepots[$name])) {
                continue;
            }
            $validDepots[$name] = true;
            $insertDepot->execute([$name]);
        }

        $insertStock = $pdo->prepare(
            'INSERT INTO inventory_depot_stocks (variant_id, depot_name, stock, min_stock) VALUES (?, ?, ?, ?)'
        );

        foreach ($depotStocks as $stockRow) {
            $variantId = trim((string)($stockRow['variantId'] ?? ''));
            $depotName = trim((string)($stockRow['depot'] ?? ''));
            if ($variantId === '' || $depotName === '') {
                continue;
            }
            if (!isset($validVariantIds[$variantId]) || !isset($validDepots[$depotName])) {
                continue;
            }

            $insertStock->execute([
                $variantId,
                $depotName,
                max(0, (int)($stockRow['stock'] ?? 0)),
                max(0, (int)($stockRow['minStock'] ?? 0)),
            ]);
        }

        $insertMovement = $pdo->prepare(
            'INSERT INTO inventory_movements (id, movement_at, product_id, variant_id, depot_name, movement_type, quantity, note)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        );

        foreach ($inventoryMovements as $movement) {
            $movementId = trim((string)($movement['id'] ?? ''));
            $variantId = trim((string)($movement['variantId'] ?? ''));
            $depotName = trim((string)($movement['depot'] ?? ''));
            $movementType = (string)($movement['type'] ?? 'in');
            $productId = (int)($movement['productId'] ?? 0);
            if ($movementId === '' || $variantId === '' || $depotName === '' || $productId <= 0) {
                continue;
            }
            if (!isset($validVariantIds[$variantId]) || !isset($validDepots[$depotName])) {
                continue;
            }
            if (!isset($validProductIds[$productId])) {
                continue;
            }
            if (!in_array($movementType, ['in', 'out', 'return'], true)) {
                $movementType = 'in';
            }

            $movementAt = $movement['timestamp'] ?? date(DATE_ATOM);
            $movementAtSql = date('Y-m-d H:i:s', strtotime((string)$movementAt));

            $insertMovement->execute([
                $movementId,
                $movementAtSql,
                $productId,
                $variantId,
                $depotName,
                $movementType,
                max(1, (int)($movement['quantity'] ?? 1)),
                trim((string)($movement['note'] ?? '')),
            ]);
        }

        $settingsStmt = $pdo->prepare(
            'INSERT INTO admin_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)'
        );
        $settingsStmt->execute(['inventory_processed_order_ids', json_encode($processedOrderIds, JSON_UNESCAPED_UNICODE)]);

        $pdo->commit();
        successResponse(null, 'Katalog snapshot veritabanına kaydedildi');
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log('catalog save failed: ' . $e->getMessage());
        jsonResponse(false, 'Katalog kaydedilemedi', null, 500);
    }
}
