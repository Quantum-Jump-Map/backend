-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS map_society;
USE map_society;

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS user (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL
);

-- 도시 테이블
CREATE TABLE IF NOT EXISTS city (
  city_id INT AUTO_INCREMENT PRIMARY KEY,
  city_name VARCHAR(50) NOT NULL
);

-- 구/군 테이블
CREATE TABLE IF NOT EXISTS district (
  district_id INT AUTO_INCREMENT PRIMARY KEY,
  city_id INT NOT NULL,
  district_name VARCHAR(50) NOT NULL,
  FOREIGN KEY (city_id) REFERENCES city(city_id)
);

-- 도로 테이블
CREATE TABLE IF NOT EXISTS road (
  road_id INT AUTO_INCREMENT PRIMARY KEY,
  district_id INT NOT NULL,
  road_name VARCHAR(100) NOT NULL,
  FOREIGN KEY (district_id) REFERENCES district(district_id)
);

-- 주소 블록 테이블
CREATE TABLE IF NOT EXISTS address_block (
  block_id INT AUTO_INCREMENT PRIMARY KEY,
  road_id INT NOT NULL,
  number_start INT NOT NULL,
  number_end INT NOT NULL,
  latitude DOUBLE NULL,
  longitude DOUBLE NULL,
  FOREIGN KEY (road_id) REFERENCES road(road_id)
);

-- 댓글 테이블
CREATE TABLE IF NOT EXISTS comment (
  comment_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  block_id INT NOT NULL,
  content TEXT NOT NULL,
  likes INT DEFAULT 0,
  dislikes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user(user_id),
  FOREIGN KEY (block_id) REFERENCES address_block(block_id)
);

-- 댓글 반응 테이블
CREATE TABLE IF NOT EXISTS comment_reaction (
  reaction_id INT AUTO_INCREMENT PRIMARY KEY,
  comment_id INT NOT NULL,
  user_id INT NOT NULL,
  is_like BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (comment_id) REFERENCES comment(comment_id),
  FOREIGN KEY (user_id) REFERENCES user(user_id),
  UNIQUE KEY (comment_id, user_id)
);

-- 채팅방 테이블
CREATE TABLE IF NOT EXISTS chat_room (
  room_id INT AUTO_INCREMENT PRIMARY KEY,
  district_id INT NOT NULL,
  room_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (district_id) REFERENCES district(district_id)
);

-- 채팅 메시지 테이블
CREATE TABLE IF NOT EXISTS chat_message (
  message_id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES chat_room(room_id),
  FOREIGN KEY (user_id) REFERENCES user(user_id)
);

-- 샘플 데이터 삽입
-- 도시
INSERT INTO city (city_name) VALUES ('서울특별시');

-- 구/군
INSERT INTO district (city_id, district_name) VALUES (1, '강남구');
INSERT INTO district (city_id, district_name) VALUES (1, '서초구');
INSERT INTO district (city_id, district_name) VALUES (1, '마포구');

-- 도로
INSERT INTO road (district_id, road_name) VALUES (1, '테헤란로');
INSERT INTO road (district_id, road_name) VALUES (2, '강남대로');
INSERT INTO road (district_id, road_name) VALUES (3, '월드컵북로');

-- 주소 블록
INSERT INTO address_block (road_id, number_start, number_end, latitude, longitude)
VALUES (1, 1, 100, 37.5024, 127.0303);
INSERT INTO address_block (road_id, number_start, number_end, latitude, longitude)
VALUES (1, 101, 200, 37.5032, 127.0411);
INSERT INTO address_block (road_id, number_start, number_end, latitude, longitude)
VALUES (2, 1, 100, 37.4968, 127.0280);
INSERT INTO address_block (road_id, number_start, number_end, latitude, longitude)
VALUES (3, 1, 100, 37.5665, 126.9780); 