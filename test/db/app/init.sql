CREATE TABLE IF NOT EXISTS cities (    //  시/도 저장장
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS districts (   //  시/군/구
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  city_id INT NOT NULL,
  UNIQUE(name, city_id),
  FOREIGN KEY (city_id) REFERENCES cities(id)
);

CREATE TABLE IF NOT EXISTS roads (     //도로명
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  district_id INT NOT NULL,
  UNIQUE(name, district_id),
  FOREIGN KEY (district_id) REFERENCES districts(id)
);

CREATE TABLE IF NOT EXISTS addresses (  //주소
  id INT AUTO_INCREMENT PRIMARY KEY,
  road_id INT NOT NULL,
  building_main_num VARCHAR(10) NOT NULL,
  building_sub_num VARCHAR(10),
  latitude DOUBLE NOT NULL,
  longitude DOUBLE NOT NULL,
  FOREIGN KEY (road_id) REFERENCES roads(id),
  UNIQUE(road_id, building_main_num, building_sub_num);
);

CREATE TABLE IF NOT EXISTS COMMENTS (
  id INT AUTO_INCREMENT PRIMARY KEY,
  address_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT FALSE,
  clicked_lat DOUBLE,
  clicked_lng DOUBLE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (address_id) REFERENCES addresses(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  like_count INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS LIKES (
  
)
