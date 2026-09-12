CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    level INT DEFAULT 1,
    xp INT DEFAULT 0,
    tokens INT DEFAULT 0,
    intellect INT DEFAULT 10,
    strength INT DEFAULT 10,
    creativity INT DEFAULT 10,
    streak_days INT DEFAULT 0,
    last_active_date DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    attribute VARCHAR(50) NOT NULL,
    xp_reward INT DEFAULT 25,
    tokens_reward INT DEFAULT 10,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shop_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    cost INT NOT NULL,
    type VARCHAR(50) DEFAULT 'badge'
);

CREATE TABLE IF NOT EXISTS user_inventory (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    item_id INT REFERENCES shop_items(id) ON DELETE CASCADE,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial Seed Data
INSERT INTO users (username, level, xp, tokens, streak_days)
VALUES ('Pakshalika', 1, 30, 50, 1)
ON CONFLICT (username) DO NOTHING;

INSERT INTO shop_items (name, cost, type) VALUES
('Golden Keyboard Badge', 50, 'badge'),
('Neon Dark Mode Theme', 150, 'theme'),
('Pixel Crown', 300, 'badge')
ON CONFLICT DO NOTHING;

INSERT INTO tasks (user_id, title, attribute, xp_reward, tokens_reward)
VALUES
(1, 'Read 20 pages of documentation', 'Intellect', 30, 15),
(1, '30-minute cardio session', 'Strength', 25, 10),
(1, 'Sketch 3 layout wireframes', 'Creativity', 35, 20)
ON CONFLICT DO NOTHING;
