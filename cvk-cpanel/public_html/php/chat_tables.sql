
-- ============================================
-- LIVE CHAT TABLES
-- ============================================

-- Chat sessions table
CREATE TABLE IF NOT EXISTS `chat_sessions` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `session_id` varchar(64) NOT NULL,
  `name` varchar(200) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `page_url` varchar(500) DEFAULT NULL,
  `agent_id` int(11) unsigned DEFAULT NULL,
  `status` enum('active','waiting','closed') NOT NULL DEFAULT 'active',
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_activity` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `closed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `session_id` (`session_id`),
  KEY `status` (`status`),
  KEY `created_at` (`created_at`),
  KEY `agent_id` (`agent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Chat messages table
CREATE TABLE IF NOT EXISTS `chat_messages` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `session_id` varchar(64) NOT NULL,
  `sender_type` enum('user','agent','system') NOT NULL DEFAULT 'user',
  `agent_id` int(11) unsigned DEFAULT NULL,
  `message` text NOT NULL,
  `attachment_url` varchar(500) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `session_id` (`session_id`),
  KEY `created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Chat agents table
CREATE TABLE IF NOT EXISTS `chat_agents` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) unsigned DEFAULT NULL,
  `name` varchar(200) NOT NULL,
  `email` varchar(255) NOT NULL,
  `avatar` varchar(10) DEFAULT '👨‍💼',
  `title` varchar(200) DEFAULT 'Müşteri Temsilcisi',
  `status` enum('online','busy','offline') NOT NULL DEFAULT 'offline',
  `max_chats` int(11) NOT NULL DEFAULT 5,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample agents
INSERT INTO `chat_agents` (`name`, `email`, `avatar`, `title`, `status`) VALUES
('Ayşe K.', 'ayse@cvkdijital.com', '👩‍💼', 'Müşteri Temsilcisi', 'online'),
('Mehmet T.', 'mehmet@cvkdijital.com', '👨‍💼', 'Teknik Destek', 'online'),
('Zeynep Y.', 'zeynep@cvkdijital.com', '👩‍💻', 'Satış Uzmanı', 'busy')
ON DUPLICATE KEY UPDATE status = VALUES(status);

-- Chat quick replies table
CREATE TABLE IF NOT EXISTS `chat_quick_replies` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `category` varchar(100) DEFAULT 'general',
  `text` text NOT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert quick replies
INSERT INTO `chat_quick_replies` (`category`, `text`, `sort_order`) VALUES
('general', 'Sipariş durumum nedir?', 1),
('general', 'Teslimat süresi nedir?', 2),
('general', 'Fiyat teklifi alabilir miyim?', 3),
('general', 'Tasarım desteği var mı?', 4),
('technical', 'Dosya yükleme sorunu yaşıyorum', 5),
('technical', 'Baskı kalitesi hakkında', 6),
('sales', 'Toplu sipariş indirimi', 7),
('sales', 'Özel tasarım talebi', 8)
ON DUPLICATE KEY UPDATE text = VALUES(text);
