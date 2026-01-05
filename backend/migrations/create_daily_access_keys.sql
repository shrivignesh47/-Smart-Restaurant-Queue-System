-- Create daily_access_keys table for QR scanner authentication
CREATE TABLE IF NOT EXISTS daily_access_keys (
  id INT PRIMARY KEY AUTO_INCREMENT,
  restaurant_id INT NOT NULL,
  access_key VARCHAR(8) NOT NULL,
  valid_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_by INT,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY unique_restaurant_date (restaurant_id, valid_date),
  INDEX idx_access_key (access_key),
  INDEX idx_valid_date (valid_date)
);

-- Create scanner_activity_log table for audit trail
CREATE TABLE IF NOT EXISTS scanner_activity_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  restaurant_id INT NOT NULL,
  reservation_id INT,
  access_key_id INT,
  action VARCHAR(50) NOT NULL,
  scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE SET NULL,
  FOREIGN KEY (access_key_id) REFERENCES daily_access_keys(id) ON DELETE SET NULL,
  INDEX idx_restaurant_date (restaurant_id, scanned_at),
  INDEX idx_reservation (reservation_id)
);
