# Deploying Live Polling System on Render

This guide will help you deploy your Live Polling System on Render, a cloud platform that offers free hosting for web applications.

## Prerequisites

1. **GitHub Account**: Your code should be in a GitHub repository
2. **Render Account**: Sign up at [render.com](https://render.com)

## Deployment Steps

### Step 1: Prepare Your Repository

1. Make sure your code is pushed to a GitHub repository
2. Ensure all dependencies are properly listed in `package.json` files
3. The `render.yaml` file is already configured for deployment

### Step 2: Deploy on Render

#### Option A: Using render.yaml (Recommended)

1. **Connect to GitHub**:
   - Go to [render.com](https://render.com) and sign in
   - Click "New +" and select "Blueprint"
   - Connect your GitHub account if not already connected
   - Select your repository

2. **Deploy Services**:
   - Render will automatically detect the `render.yaml` file
   - It will create two services:
     - **Backend**: `live-polling-backend` (Web Service)
     - **Frontend**: `live-polling-frontend` (Static Site)

3. **Configure Environment Variables**:
   - The `render.yaml` file already includes the necessary environment variables
   - Backend will be available at: `https://live-polling-backend.onrender.com`
   - Frontend will be available at: `https://live-polling-frontend.onrender.com`

#### Option B: Manual Deployment

If you prefer to deploy services manually:

##### Deploy Backend (Web Service)

1. Go to Render Dashboard → "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `live-polling-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Plan**: Free

4. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `CLIENT_URL`: `https://your-frontend-url.onrender.com`

##### Deploy Frontend (Static Site)

1. Go to Render Dashboard → "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `live-polling-frontend`
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/build`
   - **Plan**: Free

4. Add Environment Variables:
   - `REACT_APP_SERVER_URL`: `https://your-backend-url.onrender.com`

### Step 3: Update Environment Variables

After deployment, update the environment variables with the actual URLs:

1. **Backend Service**:
   - Update `CLIENT_URL` to point to your frontend URL

2. **Frontend Service**:
   - Update `REACT_APP_SERVER_URL` to point to your backend URL

### Step 4: Test Your Deployment

1. **Backend Health Check**:
   - Visit your backend URL to ensure it's running
   - You should see a message indicating the server is running

2. **Frontend Test**:
   - Visit your frontend URL
   - Test the polling functionality
   - Ensure real-time communication works

## Important Notes

### Free Tier Limitations

- **Sleep Mode**: Free services sleep after 15 minutes of inactivity
- **Build Time**: Limited build minutes per month
- **Bandwidth**: Limited bandwidth for static sites

### Environment Variables

The application uses these environment variables:

**Backend**:
- `NODE_ENV`: Set to `production`
- `PORT`: Port number (Render will set this automatically)
- `CLIENT_URL`: URL of your frontend application

**Frontend**:
- `REACT_APP_SERVER_URL`: URL of your backend API

### CORS Configuration

The backend is configured to accept requests from the frontend URL. Make sure the `CLIENT_URL` environment variable is set correctly.

### Socket.IO Configuration

The application uses Socket.IO for real-time communication. Render's free tier supports WebSocket connections, so your real-time features should work properly.

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check that all dependencies are in `package.json`
   - Ensure Node.js version compatibility

2. **Connection Issues**:
   - Verify environment variables are set correctly
   - Check that URLs are using HTTPS

3. **Real-time Features Not Working**:
   - Ensure both frontend and backend are deployed
   - Check that `REACT_APP_SERVER_URL` points to the correct backend URL

### Logs

- Check build logs in Render dashboard
- Monitor application logs for errors
- Use browser developer tools to debug frontend issues

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to your repository
2. **CORS**: The backend is configured to accept requests only from the specified frontend URL
3. **HTTPS**: Render provides SSL certificates automatically

## Scaling

When you're ready to scale:
- Upgrade to a paid plan for better performance
- Consider using a database instead of in-memory storage
- Implement proper session management

## Support

- Render Documentation: [docs.render.com](https://docs.render.com)
- Render Community: [community.render.com](https://community.render.com)

---

Your Live Polling System should now be successfully deployed on Render! 🚀 