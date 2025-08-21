# 🚀 Quick Start Guide - AAASC Admin Server

## ⚡ Get Running in 5 Minutes

### 1. Install Dependencies
```bash
cd admin-server
npm install
```

### 2. Create Environment File
```bash
cp env.example .env
# Edit .env with your settings (optional for local development)
```

### 3. Start the Server
```bash
# Option A: Use the startup script (recommended)
./start.sh

# Option B: Manual start
npm start
```

### 4. Access Your Admin Panel
- **Server**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health
- **API Endpoints**: http://localhost:5000/api

### 5. Login Credentials
- **Username**: `admin`
- **Password**: `admin123`

---

## 🔧 What You Get

✅ **Live Content Editing** - Update website content in real-time  
✅ **Image Management** - Upload, optimize, and manage images  
✅ **User Management** - Add/remove admin users  
✅ **Database** - SQLite database (no external setup needed)  
✅ **API** - RESTful API for frontend integration  
✅ **Security** - JWT authentication, rate limiting, validation  

---

## 📱 Test Your Setup

```bash
# Test API endpoints
node test-api.js

# Or test manually
curl http://localhost:5000/api/health
```

---

## 🔗 Connect to Your Frontend

Update your Next.js frontend to use the live API:

```typescript
// Example: Fetch live site settings
const getSiteSettings = async () => {
  const response = await fetch('http://localhost:5000/api/site/public');
  return response.json();
};

// Example: Update content (requires auth)
const updateContent = async (data) => {
  const response = await fetch('http://localhost:5000/api/collages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return response.json();
};
```

---

## 🎯 Next Steps

1. **Customize Content** - Update site settings, add collages
2. **Upload Images** - Add photos to your gallery
3. **Integrate Frontend** - Connect your Next.js app to the API
4. **Deploy** - Move to production server

---

## 🆘 Need Help?

- Check the full README.md
- Run `./start.sh` for automatic setup
- Test with `node test-api.js`
- Check server logs for errors

---

**🎉 You're all set! Your admin server is running and ready for live editing!**
