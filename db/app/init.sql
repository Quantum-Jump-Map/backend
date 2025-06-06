DROP DATABASE IF EXISTS app_db;
CREATE DATABASE IF NOT EXISTS app_db;

USE app_db;


CREATE TABLE IF NOT EXISTS cities (  -- 시/도
  id INT AUTO_INCREMENT PRIMARY KEY,
  lat DOUBLE NOT NULL,
  lng DOUBLE NOT NULL,
  name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS districts (  -- 시/군/구
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  city_id INT NOT NULL,
  lat DOUBLE NOT NULL,
  lng DOUBLE NOT NULL,
  UNIQUE(name, city_id),
  FOREIGN KEY (city_id) REFERENCES cities(id)
);

CREATE TABLE IF NOT EXISTS legal_dongs (  -- 동/읍/면 
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  city_id INT NOT NULL,
  district_id INT NOT NULL,
  lat DOUBLE NOT NULL,
  lng DOUBLE NOT NULL,
  FOREIGN KEY (city_id) REFERENCES cities(id),
  FOREIGN KEY (district_id) REFERENCES districts(id)
);

CREATE TABLE IF NOT EXISTS roads (  -- 도로명
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  city_id INT NOT NULL,
  district_id INT NOT NULL,
  lat DOUBLE NOT NULL,
  lng DOUBLE NOT NULL,
  FOREIGN KEY (city_id) REFERENCES cities(id),
  FOREIGN KEY (district_id) REFERENCES districts(id)
);

CREATE TABLE IF NOT EXISTS addresses ( -- 주소
  id INT AUTO_INCREMENT PRIMARY KEY,
  is_road BOOLEAN DEFAULT 1,
  city_id INT NOT NULL,
  district_id INT NOT NULL,
  road_id INT,
  legal_dong_id INT,
  address_num VARCHAR(10) NOT NULL, 
  lat DOUBLE NOT NULL,
  lng DOUBLE NOT NULL,
  FOREIGN KEY (road_id) REFERENCES roads(id),
  FOREIGN KEY (legal_dong_id) REFERENCES legal_dongs(id)
  FOREIGN KEY (city_id) REFERENCES cities(id),
  FOREIGN KEY (district_id) REFERENCES districts(id)
);

CREATE TABLE IF NOT EXISTS comments ( -- 댓글
  id INT AUTO_INCREMENT PRIMARY KEY,
  address_id INT NOT NULL,
  city_id INT NOT NULL,
  district_id INT NOT NULL,
  legal_dong_id INT,
  road_id INT,
  user_id INT NOT NULL,
  content TEXT NOT NULL,  -- 댓글
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  like_count INT DEFAULT 0,
  FOREIGN KEY (city_id) REFERENCES cities(id),
  FOREIGN KEY (district_id) REFERENCES districts(id),
  FOREIGN KEY (legal_dong_id) REFERENCES legal_dongs(id),
  FOREIGN KEY (road_id) REFERENCES roads(id),
  FOREIGN KEY (address_id) REFERENCES addresses(id)
);

CREATE TABLE IF NOT EXISTS comment_likes (  -- 댓글 좋아요
  id INT AUTO_INCREMENT PRIMARY KEY,
  comment_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (comment_id, user_id),
  FOREIGN KEY (comment_id) REFERENCES comments(id)
);


DROP DATABASE IF EXISTS user_db;
CREATE DATABASE IF NOT EXISTS user_db;
USE user_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  birth_date DATE NOT NULL,
  gender ENUM('male', 'female', 'other') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  follower_count INT DEFAULT 0,
  followee_count INT DEFAULT 0,
  total_like_count INT DEFAULT 0,
  total_comment_count INT DEFAULT 0,
  profile_comment VARCHAR(255) DEFAULT ''
);


CREATE TABLE IF NOT EXISTS follows (  -- follow table
  follower_id INT NOT NULL,
  followee_id INT NOT NULL,
  PRIMARY KEY(follower_id, followee_id)
);



DROP DATABASE IF EXISTS event_db;
CREATE DATABASE IF NOT EXISTS event_db;
USE event_db;

CREATE TABLE IF NOT EXISTS festivals (
  content_id VARCHAR(20) PRIMARY KEY, -- TourAPI 고유값
  title VARCHAR(255) NOT NULL,
  address_id INT NOT NULL,
  event_start_date DATE NOT NULL,
  event_end_date DATE NOT NULL,
  first_image VARCHAR(255),
  first_image2 VARCHAR(255),
  mapx DOUBLE NOT NULL,
  mapy DOUBLE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
