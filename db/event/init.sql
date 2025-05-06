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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
);