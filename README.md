# 💬 Chaat Whalla

A modern, real-time chat application built with the MERN stack + Socket.io. WhatsApp-style messaging with phone number-based authentication.

## ✨ Features

- **Phone OTP Authentication** — Login with your phone number
- **Real-time Messaging** — Instant message delivery via WebSockets
- **Contact Management** — Add contacts by phone number
- **Online/Offline Status** — See who's online with last seen timestamps
- **Typing Indicators** — Know when someone is typing
- **Message Delivery Status** — Sent ✓, Delivered ✓✓, Seen ✓✓ (blue)
- **Emoji Support** — Full emoji picker integration
- **Profile Management** — Avatar upload, name & about editing
- **Dark Theme** — Premium dark UI inspired by WhatsApp Web

## 🛠 Tech Stack

| Layer | Technology |
|:---|:---|
| Frontend | React 19, Vite 8, Zustand, Socket.io-client |
| Backend | Node.js, Express, Socket.io |
| Database | MongoDB (Mongoose) |
| Auth | JWT (HTTP-only cookies) + OTP |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or [Atlas](https://www.mongodb.com/atlas))

### 1. Clone & Install

```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

### 2. Configure Environment

Edit `server/.env`:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chaat-whalla
JWT_ACCESS_SECRET=your_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Start MongoDB

Make sure MongoDB is running locally, or update `MONGODB_URI` to your Atlas connection string.

### 4. Run the Application

```bash
# Terminal 1 — Start server
cd server
npm run dev

# Terminal 2 — Start client
cd client
npm run dev
```

### 5. Open in Browser

- **App:** http://localhost:5173
- **API:** http://localhost:5000/api/health

## 🧪 Testing (Dev Mode)

The app uses a **simulated OTP system** for development:

1. Enter any phone number (10 digits)
2. Use OTP code **`123456`** to bypass verification
3. Complete your profile
4. Open a second browser window (incognito) to register a second user
5. Add contact → Start chatting!

## 📁 Project Structure

```
├── client/           # React frontend (Vite)
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── context/      # Socket.io context
│   │   ├── store/        # Zustand state stores
│   │   ├── styles/       # CSS design system
│   │   └── utils/        # API client, formatters
│   └── ...
├── server/           # Node.js backend
│   ├── controllers/  # Route handlers
│   ├── models/       # Mongoose schemas
│   ├── routes/       # Express routes
│   ├── socket/       # Socket.io handlers
│   └── utils/        # OTP & JWT services
└── README.md
```

## 📄 License

MIT
