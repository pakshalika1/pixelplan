require('dotenv').config();
const express = require('express');
const db = require('./db');

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Non-linear XP formula: each level requires more XP than the last
const getXpThreshold = (lvl) => Math.floor(100 * Math.pow(1.5, lvl - 1));

// Dashboard Route
app.get('/', async (req, res) => {
    try {
        // Streak Logic: increment if active yesterday, reset if a day was missed
        await db.query(`
            UPDATE users
            SET streak_days = CASE
                WHEN last_active_date = CURRENT_DATE - INTERVAL '1 day' THEN streak_days + 1
                WHEN last_active_date < CURRENT_DATE - INTERVAL '1 day' THEN 0
                ELSE streak_days
            END,
            last_active_date = CURRENT_DATE
            WHERE id = 1
        `);

        const userRes = await db.query('SELECT * FROM users WHERE id = 1');
        const tasksRes = await db.query('SELECT * FROM tasks WHERE user_id = 1 AND is_completed = FALSE ORDER BY id DESC');
        const shopRes = await db.query(`
            SELECT s.*,
            CASE WHEN i.item_id IS NOT NULL THEN true ELSE false END as is_owned
            FROM shop_items s
            LEFT JOIN user_inventory i ON s.id = i.item_id AND i.user_id = 1
        `);

        const user = userRes.rows[0];
        const nextLevelXp = getXpThreshold(user.level);
        const progressPercent = Math.min(Math.round((user.xp / nextLevelXp) * 100), 100);

        res.render('index', {
            user,
            tasks: tasksRes.rows,
            shopItems: shopRes.rows,
            nextLevelXp,
            progressPercent
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Database connection error');
    }
});

// Create Quest
app.post('/api/tasks', async (req, res) => {
    const { title, attribute } = req.body;
    if (!title || !title.trim() || !attribute) {
        return res.status(400).json({ error: 'Missing fields' });
    }

    try {
        await db.query(
            'INSERT INTO tasks (user_id, title, attribute) VALUES (1, $1, $2)',
            [title.trim(), attribute]
        );
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create quest' });
    }
});

// Complete Quest
app.post('/api/tasks/:id/complete', async (req, res) => {
    const taskId = req.params.id;

    try {
        const taskQuery = await db.query('SELECT * FROM tasks WHERE id = $1 AND user_id = 1', [taskId]);
        if (taskQuery.rows.length === 0) return res.status(404).json({ error: 'Quest not found' });
        const task = taskQuery.rows[0];

        if (task.is_completed) {
            return res.status(400).json({ error: 'Quest already completed' });
        }

        await db.query('UPDATE tasks SET is_completed = TRUE WHERE id = $1', [taskId]);

        const userQuery = await db.query('SELECT * FROM users WHERE id = 1');
        let { level, xp, tokens, intellect, strength, creativity } = userQuery.rows[0];

        xp += task.xp_reward;
        tokens += task.tokens_reward;

        if (task.attribute === 'Intellect') intellect += 1;
        if (task.attribute === 'Strength') strength += 1;
        if (task.attribute === 'Creativity') creativity += 1;

        let leveledUp = false;
        let threshold = getXpThreshold(level);
        while (xp >= threshold) {
            xp -= threshold;
            level += 1;
            leveledUp = true;
            threshold = getXpThreshold(level);
        }

        await db.query(
            `UPDATE users
             SET level = $1, xp = $2, tokens = $3, intellect = $4, strength = $5, creativity = $6
             WHERE id = 1`,
            [level, xp, tokens, intellect, strength, creativity]
        );

        res.json({ success: true, level, xp, tokens, leveledUp, nextLevelXp: threshold });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error processing reward' });
    }
});

// Shop Purchase
app.post('/api/shop/buy/:itemId', async (req, res) => {
    const itemId = req.params.itemId;
    try {
        const itemRes = await db.query('SELECT * FROM shop_items WHERE id = $1', [itemId]);
        if (itemRes.rows.length === 0) return res.status(404).json({ error: 'Item not found' });

        const userRes = await db.query('SELECT tokens FROM users WHERE id = 1');
        const item = itemRes.rows[0];
        const user = userRes.rows[0];

        if (user.tokens < item.cost) {
            return res.status(400).json({ error: 'Not enough tokens!' });
        }

        const ownedRes = await db.query(
            'SELECT 1 FROM user_inventory WHERE user_id = 1 AND item_id = $1',
            [itemId]
        );
        if (ownedRes.rows.length > 0) {
            return res.status(400).json({ error: 'Item already owned' });
        }

        await db.query('UPDATE users SET tokens = tokens - $1 WHERE id = 1', [item.cost]);
        await db.query('INSERT INTO user_inventory (user_id, item_id) VALUES (1, $1)', [itemId]);

        res.json({ success: true, newBalance: user.tokens - item.cost });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Transaction failed' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`PixelPlan live on http://localhost:${PORT}`));
