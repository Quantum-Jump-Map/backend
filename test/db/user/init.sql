CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  birth_date DATE NOT NULL,
  gender ENUM('male', 'female', 'other') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
