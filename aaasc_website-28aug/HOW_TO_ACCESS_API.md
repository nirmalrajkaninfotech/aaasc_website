# How to Access API in Next.js Build

## 🚀 Quick Start

After building the Next.js server, you can access APIs in two ways:

### Method 1: Through Next.js Server (Recommended)

1. **Start the server:**
   ```bash
   npm start
   # or
   node server.js
   ```

2. **Access API endpoints:**
   ```
   http://localhost:3000/api/carousel
   http://localhost:3000/api/upload
   http://localhost:3000/api/site
   ```

---

## 📍 API Endpoints Available

### Carousel API
- **GET** `http://localhost:3000/api/carousel` - Get all carousel items
- **POST** `http://localhost:3000/api/carousel` - Create new carousel item
- **PUT** `http://localhost:3000/api/carousel` - Update carousel item
- **DELETE** `http://localhost:3000/api/carousel?id={id}` - Delete carousel item
- **OPTIONS** `http://localhost:3000/api/carousel` - CORS preflight

### Upload API
- **POST** `http://localhost:3000/api/upload` - Upload image file
- **OPTIONS** `http://localhost:3000/api/upload` - CORS preflight

### Other APIs
- `/api/site` - Site settings
- `/api/academics` - Academic programs
- `/api/alumni` - Alumni data
- `/api/placements` - Placement data
- `/api/iqac` - IQAC data
- `/api/collages` - Gallery collages
- `/api/gallery` - Gallery management
- `/api/auth/login` - Authentication

---

## 🌐 Accessing from Frontend

### From Same Domain (localhost:3000)

```javascript
// Simple fetch
fetch('/api/carousel')
  .then(res => res.json())
  .then(data => console.log(data));

// With async/await
const response = await fetch('/api/carousel');
const data = await response.json();
```

### From Different Domain (CORS)

If accessing from `https://demoaasc.xesstechlink.com/`:

```javascript
fetch('https://your-nextjs-server.com/api/carousel', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include' // If using cookies
})
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## 🔧 Upload Example

### Upload Image to Carousel

```javascript
// 1. Upload the image file
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const uploadResponse = await fetch('https://your-server.com/api/upload', {
  method: 'POST',
  body: formData
});

const { url } = await uploadResponse.json();

// 2. Create carousel item with uploaded image
const carouselResponse = await fetch('https://your-server.com/api/carousel', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    image: url,
    caption: 'My Carousel Image',
    link: 'https://example.com'
  })
});

const carouselItem = await carouselResponse.json();
console.log('Carousel item created:', carouselItem);
```

---

## 📋 Testing API Endpoints

### Using cURL

```bash
# Get carousel items
curl http://localhost:3000/api/carousel

# Create carousel item
curl -X POST http://localhost:3000/api/carousel \
  -H "Content-Type: application/json" \
  -d '{"image":"/uploads/image.jpg","caption":"Test"}'

# Upload file
curl -X POST http://localhost:3000/api/upload \
  -F "file=@/path/to/image.jpg"
```

### Using Browser

1. Start server: `npm start`
2. Open browser: `http://localhost:3000/api/carousel`
3. You'll see JSON response

### Using Postman/Insomnia

1. **Method:** GET/POST/PUT/DELETE
2. **URL:** `http://localhost:3000/api/carousel`
3. **Headers:**
   - `Content-Type: application/json` (for JSON)
   - `Origin: https://demoaasc.xesstechlink.com` (for CORS)
4. **Body:** JSON data (for POST/PUT)

---

## 🔒 CORS Configuration

The API routes are configured to allow CORS from:
- `https://demoaasc.xesstechlink.com`
- `http://localhost:3000`
- `https://apiaasc.veetusaapadu.in`
- And other configured origins

**CORS Headers Included:**
- `Access-Control-Allow-Origin`
- `Access-Control-Allow-Methods`
- `Access-Control-Allow-Headers`
- `Access-Control-Allow-Credentials`

---

## 🌍 Production Deployment

### If Deployed to Server

Replace `localhost:3000` with your production URL:

```
https://your-domain.com/api/carousel
https://your-domain.com/api/upload
```

### Environment Variables

Set in your production environment:
```bash
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

---

## 📝 API Response Format

### Success Response
```json
{
  "id": "1234567890",
  "image": "/uploads/image.jpg",
  "caption": "Carousel Image",
  "link": "https://example.com",
  "order": 1
}
```

### Error Response
```json
{
  "error": "Failed to read carousel items"
}
```

---

## ⚠️ Important Notes

1. **Server Must Be Running**: APIs only work when Next.js server is running
2. **Not Available in Static Export**: If you use `output: 'export'`, API routes won't work
3. **CORS**: Make sure your origin is in the allowed list
4. **File Uploads**: Upload API saves files to `public/uploads/` directory

---

## 🚀 Quick Test

1. **Start server:**
   ```bash
   npm start
   ```

2. **Test in browser:**
   ```
   http://localhost:3000/api/carousel
   ```

3. **Test with curl:**
   ```bash
   curl http://localhost:3000/api/carousel
   ```

---

## 📚 Full API Documentation

See individual route files in `src/app/api/` for detailed documentation:
- `src/app/api/carousel/route.ts`
- `src/app/api/upload/route.ts`
- `src/app/api/site/route.ts`
- etc.

---

**Your APIs are ready to use once the server is running!** 🎉

