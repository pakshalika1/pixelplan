# PixelPlan 🎮
 PixelPlan transforms daily habits into an engaging 8-bit arcade experience. It solves the "delayed gratification" problem of traditional productivity tools by bridging mundane real-world tasks with instant dopamine feedback loops. Users earn Tokens and XP to level up non-linear character attributes (Intellect, Strength, Creativity) and spend Tokens in the Item Shop.

**Developer:** Pakshalika Routray

## Tech Stack
- **Frontend:** HTML5, CSS3 (custom neubrutalist arcade theme), Vanilla JavaScript, EJS templates
- **Backend:** Node.js, Express.js REST API
- **Database:** PostgreSQL

## Features
- Quest (task) creation, categorized by Intellect / Strength / Creativity
- Non-linear XP leveling system (`100 * 1.5^(level-1)` XP per level)
- Token economy with a virtual item shop
- Daily streak tracking
- Fully keyboard-navigable, ARIA-labeled, responsive on mobile

## Local Setup
1. Clone this repository and `cd` into the project folder.
2. Run `npm install`.
3. Create a PostgreSQL database (locally or via [Neon.tech](https://neon.tech)) and run the SQL in `schema.sql` against it.
4. Copy `.env.example` to `.env` and fill in your real `DATABASE_URL`:
   ```
   PORT=3000
   DATABASE_URL=postgresql://username:password@localhost:5432/pixelplan
   ```
5. Start the app:
   - `npm start` for production mode
   - `npm run dev` for auto-reload during development
6. Visit `http://localhost:3000`.

## Deployment
- **Database:** hosted on [Neon.tech](https://neon.tech) (free tier PostgreSQL).
- **Backend + Frontend:** hosted on [Render.com](https://render.com) as a single Node web service (EJS is server-rendered, so no separate frontend host is needed).

See the full step-by-step hosting guide provided alongside this project for exact click-through instructions.

## Project Structure
```
pixelplan/
├── .env.example
├── .gitignore
├── package.json
├── schema.sql
├── db.js
├── server.js
├── views/
│   └── index.ejs
├── public/
│   ├── css/style.css
│   └── js/main.js
└── README.md
```
