# StreamX

StreamX is a full-stack video-sharing platform built with **React.js, Node.js, Express.js, and MongoDB**, featuring **Google OAuth 2.0 authentication**. Users can upload, stream, like, comment, and manage videos. It includes a **hybrid recommendation system** using **FAISS and cosine similarity** for personalized suggestions. **TF-IDF-based search** enables efficient filtering. The backend integrates a **Python-based recommendation system** with **Node.js via spawn**, ensuring a smooth streaming experience.

## Features
- User authentication with **Google OAuth 2.0**
- Upload, stream, like, and comment on videos
- **Hybrid recommendation system** (content-based + collaborative filtering)
- **FAISS-based embedding search** for better recommendations
- **TF-IDF-powered search** for video discovery
- Backend integration with Python recommendation model
- Secure **JWT authentication with cookies**

## Tech Stack
- **Frontend**: React.js, Tailwind CSS
- **Backend**: Node.js, Express.js, Python
- **Database**: MongoDB
- **Authentication**: Google OAuth 2.0, JWT
- **Search & Recommendations**: FAISS, TF-IDF, Cosine Similarity

## Installation
### 1. Clone the repository
```sh
  git clone https://github.com/010Harsh010/StreamX.git
  cd StreamX
```
### 2. Install dependencies
#### Backend
```sh
  cd backend
  npm install
```
#### Frontend
```sh
  cd frontend
  npm install
```
### 3. Set up environment variables
Create a `.env` file in both **backend** and **frontend** directories.
#### Backend (.env)
```sh
MONGO_URI=your_mongodb_url
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_jwt_secret
```
#### Frontend (.env)
```sh
VITE_API_URL=http://localhost:5000
```
### 4. Run the application
#### Start Backend
```sh
  cd backend
  npm start
```
#### Start Frontend
```sh
  cd frontend
  npm run dev
```
### 5. Open in Browser
Go to `http://localhost:5173`

## API Endpoints
### Authentication
- `POST /api/auth/google` – Google OAuth login
- `POST /api/auth/logout` – Logout user

### Videos
- `POST /api/videos/upload` – Upload a new video
- `GET /api/videos/:id` – Get video details
- `POST /api/videos/:id/like` – Like a video
- `POST /api/videos/:id/comment` – Add a comment

### Recommendation System
- `GET /api/recommend/:videoId` – Get recommended videos
- `POST /api/search` – Search videos using TF-IDF

## Deployment
StreamX can be deployed using **Render, Vercel**. Ensure environment variables are configured in the respective platform.

## License
This project is **open-source** under the MIT License.

---

**Contributors:**
- [Harsh Singh](https://github.com/010Harsh010)

🚀 Happy Streaming with StreamX!

