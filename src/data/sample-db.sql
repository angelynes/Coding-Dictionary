-- Sample database used by every runnable SQL box (SQLite).
-- It is rebuilt fresh before each run, so feel free to UPDATE / DELETE.
-- Add your own tables here whenever a new lesson needs them.

CREATE TABLE celebs (
  id INTEGER PRIMARY KEY,
  name TEXT UNIQUE,
  age INTEGER,
  income DECIMAL(10,2),
  twitter_handle TEXT
);
INSERT INTO celebs (id, name, age, income, twitter_handle) VALUES
  (1, 'Justin Bieber', 22, 80.5, NULL),
  (2, 'Beyonce Knowles', 33, 115.0, '@beyonce'),
  (3, 'Jeremy Lin', 26, 22.3, NULL),
  (4, 'Taylor Swift', 26, 185.0, NULL),
  (5, 'Adele', 36, 60.0, '@adele'),
  (6, 'Ariana Grande', 31, 72.0, '@arianagrande'),
  (7, 'Jackie Chan', 70, 40.0, '@eyeofjackiechan'),
  (8, 'Zendaya', 28, 45.0, '@zendaya'),
  (9, 'Ed Sheeran', 33, 110.0, NULL),
  (10, 'Anne Hathaway', 42, 30.0, '@annehathaway');

CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT,
  department TEXT,
  salary INTEGER,
  age INTEGER,
  year_hired INTEGER
);
INSERT INTO employees VALUES
  (1, 'Maya', 'Sales', 52000, 29, 2019),
  (2, 'Leo', 'Sales', 61000, 34, 2016),
  (3, 'Priya', 'Engineering', 98000, 31, 2018),
  (4, 'Tom', 'Engineering', 87000, 27, 2021),
  (5, 'Aisha', 'Engineering', 98000, 38, 2014),
  (6, 'Ken', 'Marketing', 57000, 45, 2012),
  (7, 'Sofia', 'Marketing', 49000, 24, 2023),
  (8, 'Maya', 'Support', 41000, 29, 2021);
CREATE TABLE employee AS SELECT * FROM employees;

CREATE TABLE films (
  id INTEGER PRIMARY KEY,
  title TEXT,
  release_year INTEGER,
  country TEXT,
  language TEXT,
  budget INTEGER
);
INSERT INTO films VALUES
  (1, 'Pan''s Labyrinth', 2006, 'Spain', 'Spanish', 19000000),
  (2, 'Parasite', 2019, 'South Korea', 'Korean', 11400000),
  (3, 'Roma', 2018, 'Mexico', 'Spanish', 15000000),
  (4, 'Inception', 2010, 'USA', 'English', 160000000),
  (5, 'Amélie', 2001, 'France', 'French', 10000000),
  (6, 'Spirited Away', 2001, 'Japan', 'Japanese', 19000000),
  (7, 'La La Land', 2016, 'USA', 'English', 30000000),
  (8, 'The Orphanage', 2007, 'Spain', 'Spanish', NULL);

CREATE TABLE reviews (
  film_id INTEGER,
  "facebook likes" INTEGER,
  imdb_score REAL
);
INSERT INTO reviews VALUES
  (1, 31000, 8.2), (2, 120000, 8.5), (3, 45000, 7.7), (4, 175000, 8.8),
  (5, 21000, 8.3), (6, 64000, 8.6), (7, 99000, 8.0), (8, NULL, 7.4);

CREATE TABLE products (
  product_id INTEGER PRIMARY KEY,
  product_name TEXT,
  category_id INTEGER
);
INSERT INTO products VALUES
  (1, 'Notebook', 1), (2, 'Gel Pen', 1), (3, 'Backpack', 2),
  (4, 'Water Bottle', 2), (5, 'Desk Lamp', 3);

CREATE TABLE order_items (
  order_id INTEGER,
  product_id INTEGER,
  quantity INTEGER
);
INSERT INTO order_items VALUES
  (101, 1, 3), (101, 2, 10), (102, 3, 1), (103, 1, 2),
  (104, 4, 2), (105, 2, 5), (106, 9, 1);

CREATE TABLE sales (
  sale_date DATE,
  category_id INTEGER,
  product TEXT,
  units_sold INTEGER,
  revenue DECIMAL(10,2)
);
INSERT INTO sales VALUES
  ('2024-03-01', 1, 'Notebook', 30, 90.00),
  ('2024-03-02', 1, 'Gel Pen', 50, 75.00),
  ('2024-03-03', 2, 'Backpack', 12, 480.00),
  ('2024-03-04', 1, 'Notebook', 30, 95.00),
  ('2024-03-05', 2, 'Water Bottle', 25, 250.00),
  ('2024-03-06', 3, 'Desk Lamp', 8, 320.00),
  ('2024-03-07', 2, 'Backpack', 50, 600.00);

CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  phone_number TEXT,
  email TEXT
);
INSERT INTO users VALUES
  (1, '555-0101', 'ana@example.com'),
  (2, NULL, 'ben@example.com'),
  (3, NULL, NULL),
  (4, '555-0144', NULL);

CREATE TABLE countries (code TEXT PRIMARY KEY, name TEXT);
INSERT INTO countries VALUES
  ('IDN', 'Indonesia'), ('SGP', 'Singapore'), ('ESP', 'Spain'), ('JPN', 'Japan'), ('BRA', 'Brazil');

CREATE TABLE languages (code TEXT, name TEXT, official INTEGER);
INSERT INTO languages VALUES
  ('IDN', 'Indonesian', 1), ('IDN', 'Javanese', 0),
  ('SGP', 'English', 1), ('SGP', 'Malay', 1), ('SGP', 'Mandarin', 1), ('SGP', 'Tamil', 1),
  ('ESP', 'Spanish', 1), ('ESP', 'Catalan', 0),
  ('JPN', 'Japanese', 1), ('FRA', 'French', 1);

CREATE TABLE branch_a_employees (email TEXT);
INSERT INTO branch_a_employees VALUES ('maya@shop.com'), ('leo@shop.com'), ('priya@shop.com');
CREATE TABLE branch_b_employees (email TEXT);
INSERT INTO branch_b_employees VALUES ('priya@shop.com'), ('tom@shop.com'), ('ken@shop.com');

CREATE TABLE presidents (country TEXT, president TEXT);
INSERT INTO presidents VALUES ('Indonesia', 'President A'), ('France', 'President B'), ('Portugal', 'President C'), ('USA', 'President D');
CREATE TABLE prime_ministers (country TEXT, prime_minister TEXT);
INSERT INTO prime_ministers VALUES ('France', 'PM A'), ('Portugal', 'PM B'), ('UK', 'PM C'), ('Japan', 'PM D'), ('Spain', 'PM E');
CREATE TABLE monarchs (country TEXT, monarch TEXT);
INSERT INTO monarchs VALUES ('UK', 'Monarch A'), ('Japan', 'Monarch B'), ('Spain', 'Monarch C'), ('Brunei', 'Monarch D');

CREATE TABLE country (id INTEGER PRIMARY KEY, name TEXT);
INSERT INTO country VALUES (1, 'Italy'), (2, 'Spain'), (3, 'England');

CREATE TABLE matches (
  id INTEGER PRIMARY KEY,
  country_id INTEGER,
  date DATE,
  season TEXT,
  home_team TEXT,
  away_team TEXT,
  hgoal INTEGER,
  agoal INTEGER,
  goals INTEGER
);
INSERT INTO matches VALUES
  (95, 1, '2012-09-02', '2012/2013', 'Bologna', 'Milan', 1, 3, 4),
  (96, 1, '2012-10-14', '2012/2013', 'Roma', 'Bologna', 2, 2, 4),
  (97, 2, '2012-11-03', '2012/2013', 'Sevilla', 'Betis', 1, 0, 1),
  (98, 1, '2013-09-21', '2013/2014', 'Bologna', 'Lazio', 2, 0, 2),
  (99, 3, '2013-10-05', '2013/2014', 'Arsenal', 'Chelsea', 1, 1, 2),
  (100, 2, '2013-10-19', '2013/2014', 'Valencia', 'Getafe', 3, 1, 4),
  (101, 1, '2013-11-09', '2013/2014', 'Napoli', 'Bologna', 0, 1, 1),
  (102, 3, '2013-11-23', '2013/2014', 'Everton', 'Spurs', 2, 3, 5),
  (103, 2, '2013-12-14', '2013/2014', 'Girona', 'Celta', 0, 0, 0);
CREATE VIEW match AS SELECT * FROM matches;
