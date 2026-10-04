# Hackathon Finder

A full-stack web application that helps developers discover and explore hackathons from multiple platforms in one place.

Hackathon Finder collects hackathon information using **SerpApi**, processes and structures the results with **Gemini**, stores normalized data in **MongoDB**, and provides a React-based interface for discovering hackathons.

## 🚀 Live Demo

* **Frontend:** [Hackathon Finder](https://hackathon-finder-five.vercel.app/?utm_source=chatgpt.com)
* **Backend API:** [Hackathon Finder API](https://hackathon-finder-siby.onrender.com/?utm_source=chatgpt.com)
* **API Documentation:** [Swagger API Docs](https://hackathon-finder-siby.onrender.com/docs?utm_source=chatgpt.com)

---

## ✨ Features

* 🔎 Discover hackathons from multiple platforms
* 🌐 Platform-based discovery

  * Devpost
  * HackerEarth
  * Unstop
  * Devfolio
* 🤖 AI-assisted hackathon classification and normalization using Gemini
* 🔍 Search and explore hackathons
* 📅 Structured hackathon information
* 👤 User registration and authentication
* 💾 Save hackathons
* 👤 User profile
* 🔗 Direct links to original hackathon pages
* 🔄 Automatic hackathon synchronization
* 🗄️ MongoDB-based persistent storage
* 📱 Responsive React frontend

---

## 🏗️ Architecture

```text
                         Hackathon Finder
                               │
                ┌──────────────┴──────────────┐
                │                             │
             Frontend                      Backend
             Vercel                        Render
                │                             │
                │                        FastAPI
                │                             │
                │              ┌──────────────┼──────────────┐
                │              │              │              │
                │           SerpApi         Gemini        MongoDB
                │              │              │              │
                │              └──────┬───────┘              │
                │                     │                      │
                │              Extraction &                  │
                │              Normalization                  │
                │                     │                      │
                │                     └──────────┬───────────┘
                │                                │
                └────────────── API ─────────────┘
```

### Background Synchronization

Hackathon data is synchronized automatically every **24 hours**:

```text
Background Sync
      ↓
SerpApi
      ↓
Search Results
      ↓
Extraction
      ↓
Gemini Classification / Normalization
      ↓
MongoDB
      ↓
Frontend
```

---

## 🛠️ Tech Stack

### Frontend

* React
* TypeScript
* Vite
* React Router
* CSS
* Vercel

### Backend

* Python
* FastAPI
* Uvicorn
* PyMongo
* Render

### AI & Data

* SerpApi
* Google Gemini
* MongoDB Atlas

---

## 📁 Project Structure

```text
hackathon-finder/
│
├── backend/
│   ├── app/
│   │   ├── database/
│   │   │   └── mongodb.py
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── hackathons.py
│   │   │   ├── search.py
│   │   │   └── resources.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── auth.py
│   │   │   ├── user.py
│   │   │   └── hackathon.py
│   │   │
│   │   ├── services/
│   │   │   ├── serpapi_app.py
│   │   │   ├── gemini_service.py
│   │   │   ├── extraction.py
│   │   │   ├── scraper_service.py
│   │   │   └── hackathon_sync.py
│   │   │
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── hooks/
│   │   └── animations/
│   │
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

---

## ⚙️ Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/hackathon-finder.git
cd hackathon-finder
```

### 2. Backend Setup

```bash
cd backend
```

Create and activate a virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### 3. Backend Environment Variables

Create:

```text
backend/.env
```

Add:

```env
MONGODB_URI=your_mongodb_connection_string
SERPAPI_KEY=your_serpapi_key
GEMINI_API_KEY=your_gemini_api_key
HACKATHON_SYNC_INTERVAL_HOURS=24
```

**Never commit `.env` to GitHub.**

### 4. Start the Backend

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Backend:

```text
http://127.0.0.1:8000
```

Swagger documentation:

```text
http://127.0.0.1:8000/docs
```

---

## 💻 Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create:

```text
frontend/.env
```

Add:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Start the development server:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## 🔐 Environment Variables

### Backend

| Variable                        | Description                         |
| ------------------------------- | ----------------------------------- |
| `MONGODB_URI`                   | MongoDB Atlas connection string     |
| `SERPAPI_KEY`                   | SerpApi API key                     |
| `GEMINI_API_KEY`                | Gemini API key                      |
| `HACKATHON_SYNC_INTERVAL_HOURS` | Background synchronization interval |

### Frontend

| Variable            | Description     |
| ------------------- | --------------- |
| `VITE_API_BASE_URL` | Backend API URL |

For production:

```env
VITE_API_BASE_URL=https://hackathon-finder-siby.onrender.com
```

`VITE_API_BASE_URL` is intentionally public because it only contains the backend URL. **API keys and database credentials must never be exposed through `VITE_` variables.**

---

## 🔄 Hackathon Data Pipeline

The application uses the following pipeline:

```text
Platform
   ↓
SerpApi Search
   ↓
Search Results
   ↓
Extraction
   ↓
Gemini
   ↓
Hackathon Classification
   ↓
Normalization
   ↓
MongoDB Upsert
   ↓
Frontend
```

The supported platforms currently include:

```text
Devpost
HackerEarth
Unstop
Devfolio
```

The synchronization runs every 24 hours.

---

## 🗄️ MongoDB Collections

The application uses MongoDB Atlas with the following main collections:

```text
Serpapi_Hackathon_FInder
│
├── Hackathon_Finder
├── users
└── saved_hackathons
```

### `Hackathon_Finder`

Stores normalized hackathon information.

### `users`

Stores registered user information.

### `saved_hackathons`

Stores the hackathons saved by users.

---

## 🌐 Deployment

### Frontend — Vercel

The frontend is deployed using Vercel.

Production API variable:

```env
VITE_API_BASE_URL=https://hackathon-finder-siby.onrender.com
```

### Backend — Render

The FastAPI backend is deployed using Render.

Start command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Required backend environment variables:

```env
MONGODB_URI=...
SERPAPI_KEY=...
GEMINI_API_KEY=...
HACKATHON_SYNC_INTERVAL_HOURS=24
```

### Database — MongoDB Atlas

MongoDB Atlas provides persistent storage for hackathons, users, and saved hackathons.

---

## 🔒 Security

* API keys are stored as environment variables.
* MongoDB credentials are not stored in the frontend.
* `.env` files are excluded from Git.
* Frontend only receives the public backend API URL.
* Backend handles communication with SerpApi, Gemini, and MongoDB.

---

## 📌 Current Status

The application is deployed and accessible online.

### Working

* User registration
* Hackathon synchronization
* Hackathon listing
* Recently added hackathons
* Frontend deployment
* Backend deployment
* MongoDB integration
* 24-hour background synchronization

### Remaining Improvements

* Hackathon details page
* External hackathon link handling
* Save/unsave functionality
* Profile page

These are application-level fixes and do not affect the deployment architecture.

---

## 👨‍💻 Author

**Jaswanth Kumar**

Built as a full-stack hackathon discovery platform using React, FastAPI, MongoDB, SerpApi, and Gemini.
