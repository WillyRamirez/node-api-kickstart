CREATE EXTENSION pgcrypto;

CREATE TABLE users (
    ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    username VARCHAR(30) NOT NULL UNIQUE,
    is_admin BOOLEAN,
    email VARCHAR(30) NOT NULL UNIQUE,
    password TEXT NOT NULL);

CREATE TABLE blacklist (
      token TEXT PRIMARY KEY,
      data jsonb
    );

INSERT INTO users (first_name, last_name, username, is_admin, email, password)
  VALUES
  ('admin', 'admin', 'admin', true, 'rpmrodgers@gmail.com', crypt('admin', gen_salt('bf'))),
  ('Test', 'McTest', 'test', false, 'george@example.com', crypt('test', gen_salt('bf')));
