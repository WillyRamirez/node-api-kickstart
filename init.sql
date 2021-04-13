CREATE TABLE users ( ID SERIAL PRIMARY KEY, first_name VARCHAR(30), last_name VARCHAR(30), username VARCHAR(30), is_admin BOOLEAN, email VARCHAR(30), password VARCHAR(30));

INSERT INTO users (first_name, last_name, username, is_admin, email)
  VALUES ('admin', 'admin', 'admin', true, 'test@test.com'), ('Test', 'McTest', 'test', false, 'george@example.com');