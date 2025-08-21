# 🚀 Frontend API Integration Guide

## ✅ **What's Been Updated**

Your Next.js frontend has been completely updated to use the **live admin server API** instead of static JSON files!

### **🔄 Changes Made:**

1. **New API Service** (`src/lib/api.ts`) - Connects to your admin server
2. **Updated Pages** - All pages now fetch data from live API
3. **Admin Components** - Login and dashboard for content management
4. **Environment Configuration** - Easy setup for API connection

---

## 🛠️ **Setup Instructions**

### **Step 1: Start Your Admin Server**
```bash
cd admin-server
npm install
./start.sh
```

### **Step 2: Configure Frontend Environment**
```bash
# Copy environment file
cp env.local.example .env.local

# Edit .env.local with your settings
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### **Step 3: Start Your Frontend**
```bash
# In a new terminal
npm run dev
```

---

## 🔗 **API Endpoints Available**

### **Public Endpoints (No Auth Required)**
- `GET /api/site/public` - Site settings
- `GET /api/collages/public` - Gallery collages
- `GET /api/academics/public` - Academic programs
- `GET /api/placements/public` - Placement info
- `GET /api/achievements/public` - College achievements
- `GET /api/iqac/public` - IQAC data
- `GET /api/alumni/public` - Alumni information
- `GET /api/carousel/public` - Homepage carousel

### **Admin Endpoints (Require Authentication)**
- `POST /api/auth/login` - Admin login
- `GET /api/auth/profile` - User profile
- `PUT /api/site` - Update site settings
- `POST /api/collages` - Create new collage
- `PUT /api/collages/:id` - Update collage
- `DELETE /api/collages/:id` - Delete collage
- `POST /api/upload/single` - Upload file
- `POST /api/upload/multiple` - Upload multiple files

---

## 🎯 **How to Use the Live API**

### **In Your Components:**
```typescript
import { api } from '@/lib/api';

// Fetch site settings
const getSiteData = async () => {
  const response = await api.site();
  if (response.error) {
    console.error('API Error:', response.error);
    return null;
  }
  return response.data;
};

// Fetch collages with filters
const getCollages = async (category?: string) => {
  const response = await api.collages(category);
  return response.data || [];
};
```

### **Admin Operations:**
```typescript
// Login
const loginResponse = await api.login('admin', 'admin123');
if (loginResponse.data) {
  const { token, user } = loginResponse.data;
  // Store token and redirect to dashboard
}

// Update site settings
const updateResponse = await api.updateSite(token, {
  site_title: 'New College Name',
  hero_title: 'Welcome to Our College'
});
```

---

## 🔐 **Admin Access**

### **Login Credentials:**
- **Username**: `admin`
- **Password**: `admin123`

### **Access Points:**
- **Simple Admin**: `/admin-simple` (Clean, simple interface)
- **Full Admin**: `/admin` (Advanced features)

---

## 📱 **Updated Pages**

### **✅ Already Updated:**
- **Homepage** (`/`) - Uses live site settings and collages
- **Gallery** (`/gallery`) - Live collage data
- **Categories** (`/categories`) - Dynamic category listing
- **Collage Detail** (`/collage/[id]`) - Individual collage view

### **🔄 How They Work Now:**
1. **Server-Side Rendering** - Data fetched at build time
2. **Live Updates** - Content changes immediately reflect
3. **Fallback Handling** - Graceful error handling if API fails
4. **Performance** - Optimized data fetching

---

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **API Connection Failed**
   ```bash
   # Check if admin server is running
   curl http://localhost:5000/api/health
   
   # Verify environment variables
   cat .env.local
   ```

2. **CORS Errors**
   ```bash
   # Update admin server CORS settings
   # Edit admin-server/server.js
   origin: ['http://localhost:3000', 'http://yourdomain.com']
   ```

3. **Database Issues**
   ```bash
   # Reset admin server database
   cd admin-server
   rm database/admin.db
   npm start
   ```

### **Debug Mode:**
```typescript
// Enable API debugging
const response = await api.site();
console.log('API Response:', response);

if (response.error) {
  console.error('API Error:', response.error);
}
```

---

## 🔄 **Migration from Static JSON**

### **Before (Static):**
```typescript
// Old way - static JSON files
const res = await fetch('/api/site');
const data = await res.json();
```

### **After (Live API):**
```typescript
// New way - live admin server
import { api } from '@/lib/api';
const response = await api.site();
const data = response.data;
```

---

## 📊 **Performance Benefits**

✅ **Real-time Updates** - Content changes immediately  
✅ **No Rebuilds** - Update content without rebuilding site  
✅ **Better SEO** - Fresh, dynamic content  
✅ **User Management** - Multiple admin accounts  
✅ **File Management** - Image uploads and optimization  
✅ **Backup & Export** - Data backup and restoration  

---

## 🎉 **You're All Set!**

Your website now has:
- **Live content editing** through admin panel
- **Real-time updates** without rebuilding
- **Professional admin interface**
- **Secure authentication system**
- **Image management capabilities**

### **Next Steps:**
1. **Test the admin panel** at `/admin-simple`
2. **Update some content** to see live changes
3. **Upload images** to your gallery
4. **Customize the admin interface** as needed

---

## 🆘 **Need Help?**

- Check the admin server logs for errors
- Verify environment variables are set correctly
- Test API endpoints with `curl` or Postman
- Review the admin server README for detailed setup

**Happy Live Editing! 🎓✨**
