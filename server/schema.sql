CREATE DATABASE IF NOT EXISTS aplicativo_saude
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE aplicativo_saude;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(254) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  age TINYINT UNSIGNED NULL,
  weight DECIMAL(6,2) NULL,
  height DECIMAL(5,2) NULL,
  blood_type VARCHAR(3) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY users_email_unique (email),
  CONSTRAINT users_age_check CHECK (age IS NULL OR age <= 130),
  CONSTRAINT users_weight_check CHECK (weight IS NULL OR weight > 0),
  CONSTRAINT users_height_check CHECK (height IS NULL OR height BETWEEN 40 AND 250)
);

CREATE TABLE IF NOT EXISTS glucose_readings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  value DECIMAL(6,2) NOT NULL,
  context VARCHAR(30) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  note VARCHAR(300) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX glucose_user_date_idx (user_id, date, time),
  CONSTRAINT glucose_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT glucose_value_check CHECK (value BETWEEN 20 AND 800)
);
