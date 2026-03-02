# WhatsApp Chat Parser (Chat Formatter)

A full-stack web application that converts exported WhatsApp `.txt` chat files into a clean, readable chat interface with message bubbles, sender perspective, and timeline formatting.

Built using **React + Vite + Express + TypeScript** and designed to run both on Replit and fully offline on a local PC.

---

## ✨ Features

* 📂 Upload WhatsApp exported `.txt` chat files
* 💬 Chat-like UI with message bubbles
* 👤 Sender perspective switching
* 🧾 Multi-line message support
* 🔔 WhatsApp system notification parsing
* ⚡ Fully offline support (no database required)
* 🖥️ Local + Replit compatible

---

## 🛠️ Tech Stack

* Frontend: React + Vite + Tailwind CSS
* Backend: Express + TypeScript (Node.js)
* Parser: Custom WhatsApp chat parser (Regex-based)
* Runtime: tsx + Node.js

---

## 📁 Project Structure

```
Chat-Formatter/
├── client/          # React frontend (Vite)
├── server/          # Express backend + parser
├── shared/          # Shared types & schemas
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Getting Started (Local Setup - Offline)

### 1️⃣ Prerequisites

Install the following:

* Node.js **v18 or v20 LTS** (Recommended)
* npm (comes with Node)
* Git (optional)

Download Node.js: https://nodejs.org

Verify installation:

```
node -v
npm -v
```

---

### 2️⃣ Clone the Repository

```
git clone [https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git](https://github.com/kashif87627-tfafk/Whatsapp-Exported-chat-formatter
cd Whatsapp-Exported-chat-formatter-Whatsapp-Exported-chat-formatter
```

Or download ZIP and extract. and open folder Whatsapp-Exported-chat-formatter-Whatsapp-Exported-chat-formatter

---

### 3️⃣ Install Dependencies

Run in the project root (where `package.json` is located):

```
npm install
```

---

### 4️⃣ Run the App (Development Mode)

For Windows:

```
npm start
```
For development environment
```
npm run dev
```



The app will start on:

```
http://localhost:5000
```

Open this URL in your browser.

---

## 📴 Running Fully Offline (No Database)

This project has been configured to work in **offline mode** using in-memory storage instead of PostgreSQL.

This means:

* ❌ No DATABASE_URL required
* ❌ No PostgreSQL setup needed
* ✅ Works completely on local PC
* ⚠️ Chats reset when server restarts (RAM storage)

---

## 📤 How to Use the App

1. Export a WhatsApp chat as `.txt` file
   (WhatsApp → Chat → Export Chat → Without Media)
2. Open the app in browser
3. Upload the `.txt` file
4. Click **"Parse & View Chat"**
5. View formatted chat interface instantly 🎉

---

## ⚙️ Environment Variables (Optional)

Not required for offline mode.

If using a real database (advanced):
Create a `.env` file:

```
DATABASE_URL=your_postgresql_connection_string
PORT=5000
```

---

## 🧪 Build for Production

```
npm run build
npm start
```

---

## 🐛 Common Issues & Fixes

### Issue: `'NODE_ENV' is not recognized`

Fix (Windows):
Update `package.json`:

```
"dev": "set NODE_ENV=development && tsx server/index.ts"
```

---

### Issue: Chat Not Found

Cause: In-memory storage resets on server restart.
Solution: Re-upload the chat file after restarting the server.

---

### Issue: Port Already in Use

Change port in `server/index.ts`:

```
const port = process.env.PORT || 5000;
```

Or kill the running process on port 5000.

---

## 🎨 Customization

You can customize:

* App icon → `client/public/favicon.png`
* App title → `client/index.html`
* UI styling → Tailwind classes in `client/src`

---

## 📦 GitHub Setup (Recommended)

Before pushing to GitHub, ensure you have:

* `.gitignore`
* `LICENSE` (MIT recommended)
* `README.md` (this file)

---

## 📄 License

This project is licensed under the MIT License.
Feel free to use, modify, and distribute for educational and personal use.

---

## 👨‍💻 Author

Developed by: **Md Kashif**
Project Type: Full-Stack Web Application (Chat Parser)

---

## ⭐ If you found this project useful

Give it a ⭐ on GitHub and feel free to fork and improve it!
