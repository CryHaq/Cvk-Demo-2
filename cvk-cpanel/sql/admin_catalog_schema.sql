-- Admin catalog + inventory tables

CREATE TABLE IF NOT EXISTS admin_products (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_product_variants (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inventory_depots (
    name VARCHAR(120) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inventory_depot_stocks (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inventory_movements (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_settings (
    setting_key VARCHAR(120) NOT NULL,
    setting_value JSON DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
