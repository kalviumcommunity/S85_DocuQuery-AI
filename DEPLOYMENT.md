# 🚀 DocuQuery AI Deployment Guide

This guide will help you deploy the DocuQuery AI application without Docker using modern cloud platforms.

## 📋 Prerequisites

- Node.js 18+ installed locally
- Git repository set up
- API keys for Groq and OpenAI
- Account on deployment platforms (Render, Railway, or Heroku for backend + Netlify/Vercel for frontend)

## 🏗️ Architecture Overview

- **Frontend**: React + Vite (Static Site)
- **Backend**: Node.js + Express (API Server)
- **Database**: Vector embeddings (FAISS/Pinecone)
- **AI Services**: Groq (LLM) + OpenAI (Embeddings)

## 🎯 Deployment Options

### Option 1: Render (Recommended - Full Stack)

Render can host both frontend and backend in one place.

#### Backend Deployment on Render:

1. **Create a new Web Service on Render**
   - Connect your GitHub repository
   - Set root directory to `backend`
   - Build command: `npm install`
   - Start command: `npm start`
   - Environment: Node

2. **Set Environment Variables**:
   ```
   PORT=10000
   GROQ_API_KEY=your_groq_api_key
   GROQ_MODEL=llama-3.3-70b-versatile
   OPENAI_API_KEY=your_openai_api_key
   OPENAI_EMBEDDING_MODEL=text-embedding-3-small
   ```

3. **Note the deployed backend URL** (e.g., `https://docuquery-backend.onrender.com`)

#### Frontend Deployment on Render:

1. **Create a new Static Site on Render**
   - Connect your GitHub repository
   - Set root directory to `frontend`
   - Build command: `npm install && npm run build`
   - Publish directory: `dist`

2. **Set Environment Variables**:
   ```
   VITE_BACKEND_URL=https://your-backend-url.onrender.com
   ```

### Option 2: Railway (Alternative)

#### Backend on Railway:
1. Connect GitHub repo
2. Select `backend` folder
3. Railway auto-detects Node.js
4. Add environment variables
5. Deploy

#### Frontend on Netlify:
1. Connect GitHub repo
2. Build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
3. Environment variables: `VITE_BACKEND_URL`

### Option 3: Heroku + Netlify

#### Backend on Heroku:
```bash
# In backend directory
heroku create docuquery-api
heroku config:set GROQ_API_KEY=your_key
heroku config:set OPENAI_API_KEY=your_key
heroku config:set GROQ_MODEL=llama-3.3-70b-versatile
heroku config:set OPENAI_EMBEDDING_MODEL=text-embedding-3-small
git subtree push --prefix backend heroku main
```

#### Frontend on Netlify:
- Use the existing `netlify.toml` configuration
- Set `VITE_BACKEND_URL` to your Heroku app URL

## 🔧 Local Testing Before Deployment

### Backend:
```bash
cd backend
npm install
npm start
# Should run on http://localhost:5000
```

### Frontend:
```bash
cd frontend
npm install
npm run dev
# Should run on http://localhost:5173
```

## 🔐 Security Checklist

- ✅ API keys are in environment variables, not hardcoded
- ✅ `.env` files are in `.gitignore`
- ✅ CORS is properly configured
- ✅ Rate limiting implemented (if needed)

## 🌐 Environment Variables Summary

### Backend (.env):
```
PORT=5000
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.3-70b-versatile
OPENAI_API_KEY=sk-proj-...
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

### Frontend (.env):
```
VITE_BACKEND_URL=http://localhost:5000  # Development
VITE_BACKEND_URL=https://your-api.onrender.com  # Production
```

## 🚨 Common Issues & Solutions

### 1. CORS Errors
- Ensure backend CORS is configured for your frontend domain
- Check that `VITE_BACKEND_URL` points to the correct backend URL

### 2. API Key Issues
- Verify all environment variables are set correctly
- Check that the Groq model name is supported

### 3. Build Failures
- Ensure Node.js version compatibility (18+)
- Check that all dependencies are in `package.json`

### 4. File Upload Issues
- Verify backend has proper file handling middleware
- Check file size limits on hosting platform

## 📊 Monitoring & Logs

- **Render**: Built-in logs and metrics
- **Railway**: Real-time logs in dashboard
- **Heroku**: `heroku logs --tail`
- **Netlify**: Function logs and build logs

## 🔄 CI/CD Setup

Most platforms offer automatic deployments on git push. Enable this for seamless updates.

## 📞 Support

If you encounter issues:
1. Check platform-specific documentation
2. Verify environment variables
3. Test locally first
4. Check logs for specific error messages

---

**Happy Deploying! 🎉**
