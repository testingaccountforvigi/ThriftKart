-- THRIFTKART relational schema (proposed implementation model)
-- Product rule decisions: price 1..20000, condition 1..5.

CREATE TABLE users (
  user_id CHAR(36) PRIMARY KEY,
  university_email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  year_of_study TINYINT,
  role ENUM('student','admin') NOT NULL DEFAULT 'student',
  status ENUM('active','suspended','pending') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  category_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(80) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE listings (
  listing_id CHAR(36) PRIMARY KEY,
  seller_id CHAR(36) NOT NULL,
  category_id INT NOT NULL,
  title VARCHAR(180) NOT NULL,
  author VARCHAR(160),
  isbn VARCHAR(32),
  edition VARCHAR(60),
  course_code VARCHAR(40),
  price DECIMAL(10,2) NOT NULL,
  condition_rating TINYINT NOT NULL,
  description TEXT,
  campus_location VARCHAR(160) NOT NULL,
  status ENUM('draft','pending_moderation','published','reserved','sold','rejected','archived') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_listing_seller FOREIGN KEY (seller_id) REFERENCES users(user_id),
  CONSTRAINT fk_listing_category FOREIGN KEY (category_id) REFERENCES categories(category_id),
  CONSTRAINT chk_listing_price CHECK (price >= 1 AND price <= 20000),
  CONSTRAINT chk_listing_condition CHECK (condition_rating BETWEEN 1 AND 5)
);
CREATE INDEX idx_listing_search ON listings(status, category_id, price, condition_rating);

CREATE TABLE listing_images (
  image_id CHAR(36) PRIMARY KEY,
  listing_id CHAR(36) NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_image_listing FOREIGN KEY (listing_id) REFERENCES listings(listing_id) ON DELETE CASCADE
);

CREATE TABLE conversations (
  conversation_id CHAR(36) PRIMARY KEY,
  listing_id CHAR(36) NOT NULL,
  buyer_id CHAR(36) NOT NULL,
  seller_id CHAR(36) NOT NULL,
  status ENUM('open','closed') NOT NULL DEFAULT 'open',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_conversation (listing_id, buyer_id, seller_id),
  CONSTRAINT fk_convo_listing FOREIGN KEY (listing_id) REFERENCES listings(listing_id),
  CONSTRAINT fk_convo_buyer FOREIGN KEY (buyer_id) REFERENCES users(user_id),
  CONSTRAINT fk_convo_seller FOREIGN KEY (seller_id) REFERENCES users(user_id)
);

CREATE TABLE messages (
  message_id CHAR(36) PRIMARY KEY,
  conversation_id CHAR(36) NOT NULL,
  sender_id CHAR(36) NOT NULL,
  body TEXT NOT NULL,
  sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL,
  CONSTRAINT fk_message_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id) ON DELETE CASCADE,
  CONSTRAINT fk_message_sender FOREIGN KEY (sender_id) REFERENCES users(user_id)
);

CREATE TABLE transactions (
  transaction_id CHAR(36) PRIMARY KEY,
  listing_id CHAR(36) NOT NULL,
  buyer_id CHAR(36) NOT NULL,
  seller_id CHAR(36) NOT NULL,
  agreed_price DECIMAL(10,2) NOT NULL,
  payment_method ENUM('cash_on_handover','external_upi','online_gateway') NOT NULL,
  payment_status ENUM('pending','confirmed','failed','not_required') NOT NULL DEFAULT 'pending',
  handover_location VARCHAR(160) NOT NULL,
  handover_at DATETIME NULL,
  status ENUM('requested','reserved','handover_scheduled','completed','cancelled') NOT NULL DEFAULT 'requested',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME NULL,
  CONSTRAINT fk_tx_listing FOREIGN KEY (listing_id) REFERENCES listings(listing_id),
  CONSTRAINT fk_tx_buyer FOREIGN KEY (buyer_id) REFERENCES users(user_id),
  CONSTRAINT fk_tx_seller FOREIGN KEY (seller_id) REFERENCES users(user_id)
);

CREATE TABLE payment_records (
  payment_id CHAR(36) PRIMARY KEY,
  transaction_id CHAR(36) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  method VARCHAR(40) NOT NULL,
  provider_reference VARCHAR(120),
  status ENUM('pending','confirmed','failed') NOT NULL DEFAULT 'pending',
  paid_at DATETIME NULL,
  CONSTRAINT fk_payment_transaction FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id) ON DELETE CASCADE
);

CREATE TABLE moderation_reviews (
  review_id CHAR(36) PRIMARY KEY,
  listing_id CHAR(36) NOT NULL,
  moderator_id CHAR(36) NOT NULL,
  decision ENUM('approved','rejected') NOT NULL,
  reason VARCHAR(500) NOT NULL,
  reviewed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_review_listing FOREIGN KEY (listing_id) REFERENCES listings(listing_id),
  CONSTRAINT fk_review_moderator FOREIGN KEY (moderator_id) REFERENCES users(user_id)
);

CREATE TABLE reports (
  report_id CHAR(36) PRIMARY KEY,
  reporter_id CHAR(36) NOT NULL,
  listing_id CHAR(36) NULL,
  reported_user_id CHAR(36) NULL,
  reason VARCHAR(500) NOT NULL,
  status ENUM('open','under_review','resolved','dismissed') NOT NULL DEFAULT 'open',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME NULL,
  CONSTRAINT fk_reporter FOREIGN KEY (reporter_id) REFERENCES users(user_id),
  CONSTRAINT fk_report_listing FOREIGN KEY (listing_id) REFERENCES listings(listing_id),
  CONSTRAINT fk_reported_user FOREIGN KEY (reported_user_id) REFERENCES users(user_id)
);
