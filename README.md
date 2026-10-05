# Auraverse — Music Sharing & Collaboration Platform

Auraverse is a Spotify-style music streaming and artist collaboration web application built with React, Node.js, Express, and MongoDB.

---

## 1. Local Run on Windows

### Prerequisites
- **Node.js**: v18.x or higher
- **MongoDB Community Server**: Installed and running locally on port `27017`

### Step-by-Step Setup

1. **Start Local MongoDB**:
   Ensure the MongoDB service is running on Windows:
   ```cmd
   net start MongoDB
   ```
   *If MongoDB is not running, the application will display: `"MongoDB is not running. Start the MongoDB service and try again."`*

2. **Configure Environment Variables**:
   In the `server` directory, create a `.env` file based on `.env.example`:
   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/auraverse
   JWT_SECRET=your_secure_random_jwt_secret_here
   PORT=5000
   CLIENT_URL=http://localhost:5173
   ```

3. **Install Dependencies**:
   From the root `auraverse` directory, run:
   ```bash
   npm run build
   ```

4. **Seed the Database**:
   Populate local MongoDB with initial demo artists, tracks, and collabs:
   ```bash
   npm run seed
   ```

5. **Start the Application**:
   - **Development mode** (with hot reload):
     ```bash
     # In one terminal (server):
     cd server && npm run dev

     # In a second terminal (client):
     cd client && npm run dev
     ```
   - **Production mode** (single server):
     ```bash
     npm run start
     ```
   Open `http://localhost:5000` (or `http://localhost:5173` in dev mode) in your browser.

---

## 2. Environment Variables Reference (`server/.env`)

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/auraverse` |
| `JWT_SECRET` | Secret key for signing JWT auth tokens | `random_secret_string` |
| `PORT` | Server listening port | `5000` |
| `CLIENT_URL` | Frontend application URL | `http://localhost:5173` |
| `MAIL_HOST` | SMTP server host | `smtp.gmail.com` |
| `MAIL_PORT` | SMTP server port | `587` |
| `MAIL_USER` | Email account username | `your_email@gmail.com` |
| `MAIL_PASS` | 16-character Gmail App Password | `xxxx xxxx xxxx xxxx` |
| `MAIL_FROM` | Sender address header | `Auraverse <your_email@gmail.com>` |
| `BREVO_API_KEY` | *(Optional)* Brevo HTTPS API key | `xkeysib-...` |
| `CLOUDINARY_URL` | *(Optional)* Cloudinary connection URL | `cloudinary://KEY:SECRET@CLOUDNAME` |

*Note: Modes are controlled entirely by environment variables. If `CLOUDINARY_URL` is set, audio and images are stored on Cloudinary; otherwise local disk is used. If `BREVO_API_KEY` is set, emails send via Brevo API; otherwise Gmail SMTP is used.*

---

## 3. How to Seed Data

- **Default Seed Data**:
  ```bash
  npm run seed
  ```
  Populates MongoDB with sample artists (`Nila Raj`, `Kavin Beats`, etc.), demo audio files, and collab board postings.

- **Catalog Import** *(Optional)*:
  ```bash
  npm run import:catalog
  ```
  Imports 600+ Indian/Tamil music tracks from the iTunes Search API directly into local MongoDB.

---

## 4. Gmail App Password Setup

To send welcome emails via Gmail SMTP:
1. Enable **2-Step Verification** on your Google Account (`myaccount.google.com/security`).
2. Navigate to **App passwords** (`myaccount.google.com/apppasswords`).
3. Enter an app name (e.g., `Auraverse Mailer`) and click **Create**.
4. Copy the generated **16-character password** (without spaces) and paste it as `MAIL_PASS` in your `server/.env` file.

---

## 5. Cloudinary & Brevo Setup (Optional)

### Cloudinary (Cloud File Storage)
1. Sign up for a free account at [cloudinary.com](https://cloudinary.com).
2. Copy your **API Environment variable** (`CLOUDINARY_URL`) from the Dashboard.
3. Add `CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME` to `server/.env`.
4. Audio uploads (`resource_type: "video"`) and image uploads will automatically route to Cloudinary.

### Brevo (Transactional Email API)
1. Sign up for a free account at [brevo.com](https://brevo.com).
2. Generate a new API key from **SMTP & API** settings.
3. Add `BREVO_API_KEY=xkeysib-...` to `server/.env`.
4. Welcome emails will automatically route through Brevo's HTTPS API.

---

## 6. Deployment Guide (Atlas & Render)

### Database: MongoDB Atlas
1. Create a free Cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Database Access**, create a database user and password.
3. Under **Network Access**, add IP address `0.0.0.0/0` (Allow access from anywhere).
4. Get your connection string: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/auraverse?retryWrites=true&w=majority`.

### Hosting: Render Web Service
1. Push your code repository to GitHub.
2. Log into [Render](https://render.com) and create a **New Web Service**.
3. Connect your GitHub repository.
4. Configure settings:
   - **Root Directory**: `auraverse` (or `./`)
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start`
5. Under **Environment Variables**, add:
   - `MONGO_URI` = *(your Atlas connection string)*
   - `JWT_SECRET` = *(your secret key)*
   - `PORT` = `10000` (or leave default)
   - `CLIENT_URL` = *(your Render app URL, e.g., https://auraverse.onrender.com)*
   - `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM` (or `BREVO_API_KEY`)
   - `CLOUDINARY_URL` *(if using Cloudinary for persistent file uploads)*

---

## 7. Final Deployment Checklist

- [ ] Local MongoDB service is running and verified on `mongodb://127.0.0.1:27017/auraverse`.
- [ ] Environment variables configured in `server/.env` and `.env` is listed in `.gitignore`.
- [ ] No hardcoded passwords, keys, or tokens exist in code or repository files.
- [ ] `npm run build` completes with zero compilation errors.
- [ ] Health check endpoint `/api/health` returns `{ "status": "ok" }`.
- [ ] Production build (`npm run start`) successfully serves both API routes and static client assets on a single server.
