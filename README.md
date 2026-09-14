# 💬 Chaat Whalla

A modern, real-time chat application built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.io. It features a WhatsApp-inspired user interface with seamless real-time messaging and phone number-based OTP authentication.

---

## ✨ Key Features

- **Phone OTP Authentication:** Login securely using your phone number.
- **Real-time Messaging:** Instant message delivery via WebSockets.
- **Contact Management:** Add friends and start chatting using their phone numbers.
- **Online/Offline Status:** See who is currently online, complete with last seen timestamps.
- **Typing Indicators:** Know exactly when the other person is typing a message.
- **Message Delivery Status:** WhatsApp-style ticks (Sent ✓, Delivered ✓✓, Seen ✓✓).
- **Emoji Support:** Full emoji picker integration to make chats expressive.
- **Profile Management:** Upload custom avatars and update your display name and "about" section.
- **Dark Theme:** A sleek, premium dark UI inspired by WhatsApp Web.

---

## 🛠 Tech Stack

| Layer      | Technology                                     |
| :--------- | :--------------------------------------------- |
| **Frontend** | React 19, Vite 8, Zustand, Socket.io-client  |
| **Backend**  | Node.js, Express, Socket.io                    |
| **Database** | MongoDB (Mongoose)                             |
| **Auth**     | JWT (HTTP-only cookies) + OTP                  |

---

## 🚀 Getting Started

Follow these step-by-step instructions to set up the project on your local machine for development and testing purposes.

### 📋 Prerequisites

Before you begin, ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/en/download/) (v18.0.0 or higher)
- [Git](https://git-scm.com/downloads)
- [MongoDB](https://www.mongodb.com/try/download/community) installed locally, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cloud database.

---

### ⚙️ Installation & Setup

#### Step 1: Clone the Repository

Open your terminal and clone the project to your local machine:
```bash
git clone https://github.com/tanaydeshmukh7/chat-whalla.git
cd chat-whalla
```

#### Step 2: Backend Setup

The backend handles the API, database connection, and real-time WebSocket communication.

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables:
   Create a `.env` file in the `server` directory and add the following configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database Configuration
   # Use your local MongoDB URL or a MongoDB Atlas connection string
   MONGODB_URI=mongodb://localhost:27017/chaat-whalla

   # JWT Secrets (Can be any random secure strings)
   JWT_ACCESS_SECRET=your_access_secret_here
   JWT_REFRESH_SECRET=your_refresh_secret_here

   # Frontend URL for CORS (Cross-Origin Resource Sharing)
   CLIENT_URL=http://localhost:5173
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server should now be running on `http://localhost:5000`.*

#### Step 3: Frontend Setup

The frontend contains the React application built with Vite.

1. Open a **new terminal window/tab**, and navigate to the `client` directory from the project root:
   ```bash
   cd client
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. (Optional) If you changed the backend port, you may need to set the API URL in a client `.env` file. By default, it connects to `http://localhost:5000`.
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The app should now be running on `http://localhost:5173`.*

---

## 🏃‍♂️ Running the Application

Once both servers are running, open your web browser and navigate to:
👉 **[http://localhost:5173](http://localhost:5173)**

To check if the backend API is healthy, you can visit:
👉 **[http://localhost:5000/api/health](http://localhost:5000/api/health)**

---

## 🧪 Testing & Usage (Development Mode)

For development purposes, the app currently uses a **simulated OTP system** so you don't need a real SMS provider.

Here is how you can test the chat functionality on your own:
1. Open the app (`http://localhost:5173`) and enter any **10-digit phone number**.
2. When prompted for an OTP, use the default code: **`123456`**.
3. Complete your profile setup (Name, About, Avatar).
4. To chat with someone, open a **second browser window** (use an Incognito/Private window).
5. Register a second user using a *different* 10-digit phone number.
6. On the first user's account, click **Add Contact** and enter the second user's phone number.
7. Start chatting in real-time!

---

## 📁 Project Structure

```text
chat-whalla/
├── client/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React Context (e.g., Socket.io context)
│   │   ├── store/          # Zustand state management
│   │   ├── styles/         # Global styles and CSS modules
│   │   └── utils/          # API helpers and formatting utilities
│   └── package.json
├── server/                 # Node.js Backend (Express)
│   ├── controllers/        # Request handlers (API logic)
│   ├── models/             # Mongoose database schemas
│   ├── routes/             # Express API route definitions
│   ├── socket/             # Real-time Socket.io event handlers
│   ├── utils/              # Helper functions (OTP, JWT)
│   └── package.json
└── README.md
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/tanaydeshmukh7/chat-whalla/issues).

## 📄 License

This project is [MIT](LICENSE) licensed.
