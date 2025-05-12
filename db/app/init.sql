DROP DATABASE IF EXISTS 'app-db'
CREATE DATABASE IF NOT EXISTS 'app-db'

USE 'app-db'


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

CREATE TABLE IF NOT EXISTS roads (  -- 도로명
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  city_id INT NOT NULL,
  district_id INT NOT NULL,
  lat DOUBLE NOT NULL,
  lng DOUBLE NOT NULL,
  UNIQUE(name, city_id, district_id),
  FOREIGN KEY (city_id) REFERENCES cities(id),
  FOREIGN KEY (district_id) REFERENCES districts(id)
);

CREATE TABLE IF NOT EXISTS addresses ( -- 주소
  id INT AUTO_INCREMENT PRIMARY KEY,
  road_id INT NOT NULL,
  city_id INT NOT NULL,
  district_id INT NOT NULL,
  building_num VARCHAR(10) NOT NULL, 
  lat DOUBLE NOT NULL,
  lng DOUBLE NOT NULL,
  FOREIGN KEY (road_id) REFERENCES roads(id),
  FOREIGN KEY (city_id) REFERENCES cities(id),
  FOREIGN KEY (district_id) REFERENCES districts(id),
  UNIQUE (road_id, city_id, district_id, building_num)
);

CREATE TABLE IF NOT EXISTS comments ( -- 댓글
  id INT AUTO_INCREMENT PRIMARY KEY,
  city_id INT NOT NULL,
  district_id INT NOT NULL,
  road_id INT NOT NULL,
  address_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,  -- 댓글글
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  like_count INT DEFAULT 0,
  FOREIGN KEY (address_id) REFERENCES addresses(id),
  FOREIGN KEY (road_id) REFERENCES roads(id),
  FOREIGN KEY (city_id) REFERENCES cities(id),
  FOREIGN KEY (district_id) REFERENCES districts(id)
  -- dangerous INT NOT NULL
  -- FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS comment_likes (  -- 댓글 좋아요
  id INT AUTO_INCREMENT PRIMARY KEY,
  comment_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (comment_id, user_id),
  FOREIGN KEY (comment_id) REFERENCES comments(id)
  -- FOREIGN KEY (user_id) REFERENCES users(id)
);




DROP DATABASE IF EXISTS 'user-db'
CREATE DATABASE IF NOT EXISTS 'user-db'
USE 'user-db'

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





DROP DATABASE IF EXISTS 'event-db'
CREATE DATABASE IF NOT EXISTS 'event-db'
USE 'event-db'

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
