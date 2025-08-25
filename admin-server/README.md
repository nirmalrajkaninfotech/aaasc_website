# AAASC Admin API Server

This is a separate Express.js server that provides admin API endpoints for managing the AAASC website content.

## Setup

1. Install dependencies:
```bash
cd admin-server
npm install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Start the server:
```bash
npm run dev  # Development mode with auto-reload
npm start    # Production mode
```

## API Endpoints

### Academics
- `GET /api/admin/academics` - Get all academics
- `POST /api/admin/academics` - Create new academic item
- `PUT /api/admin/academics/:id` - Update academic item
- `DELETE /api/admin/academics/:id` - Delete academic item

### Alumni
- `GET /api/admin/alumni` - Get all alumni
- `POST /api/admin/alumni` - Create new alumni item
- `PUT /api/admin/alumni/:id` - Update alumni item
- `DELETE /api/admin/alumni/:id` - Delete alumni item

### Carousel
- `GET /api/admin/carousel` - Get all carousel items
- `POST /api/admin/carousel` - Create new carousel item
- `PUT /api/admin/carousel/:id` - Update carousel item
- `DELETE /api/admin/carousel/:id` - Delete carousel item

### Gallery
- `GET /api/admin/gallery` - Get all gallery items
- `POST /api/admin/gallery` - Create new gallery item

### Placements
- `GET /api/admin/placements` - Get all placements
- `POST /api/admin/placements` - Create new placement item

### File Upload
- `POST /api/admin/upload` - Upload any file
- `POST /api/admin/upload-image` - Upload image files only

### Health Check
- `GET /api/admin/health` - Server health status

## Usage from Frontend

```javascript
// Example: Fetch academics data
const response = await fetch('http://localhost:3001/api/admin/academics');
const academics = await response.json();

// Example: Create new academic item
const response = await fetch('http://localhost:3001/api/admin/academics', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'New Academic Program',
    description: 'Program description',
    // ... other fields
  })
});
```

## Deployment

For production deployment, you can:
1. Deploy to a separate server/VPS
2. Use serverless functions (Vercel, Netlify Functions)
3. Use a service like Railway, Render, or Heroku

The admin API runs independently of your static site.