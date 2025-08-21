# AAASC College Admin Backend Server

A Node.js backend server for managing the AAASC College website content with live editing capabilities.

## 🚀 Features

- **Authentication System**: JWT-based authentication with user management
- **Content Management**: CRUD operations for all website sections
- **File Upload**: Image upload with automatic optimization and thumbnails
- **Database**: SQLite database for easy deployment
- **API Endpoints**: RESTful API for all content management
- **Security**: Rate limiting, CORS, and input validation
- **Real-time Updates**: Live content editing and preview

## 📋 Prerequisites

- Node.js 16+ 
- npm or yarn
- Git

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd admin-server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   JWT_SECRET=your-secret-key-here
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 🗄️ Database

The server automatically creates a SQLite database with the following tables:

- **users**: Admin user accounts
- **site_settings**: Website configuration
- **collages**: Gallery/collage items
- **placements**: Placement information
- **achievements**: College achievements
- **faculty**: Faculty member profiles
- **carousel**: Homepage carousel
- **academics**: Academic programs
- **uploads**: File management

## 🔐 Default Admin Account

After first run, a default admin account is created:
- **Username**: `admin`
- **Password**: `admin123`

**⚠️ Change these credentials immediately in production!**

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Create new user
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/change-password` - Change password

### Site Management
- `GET /api/site` - Get all site settings
- `PUT /api/site/:key` - Update specific setting
- `PUT /api/site` - Bulk update settings
- `POST /api/site/export` - Export to JSON
- `POST /api/site/import` - Import from JSON

### Content Management
- `GET /api/collages` - Get all collages
- `POST /api/collages` - Create new collage
- `PUT /api/collages/:id` - Update collage
- `DELETE /api/collages/:id` - Delete collage
- `POST /api/collages/reorder` - Reorder collages

### File Upload
- `POST /api/upload/single` - Upload single file
- `POST /api/upload/multiple` - Upload multiple files
- `GET /api/upload` - List uploaded files
- `DELETE /api/upload/:id` - Delete file

### Public Endpoints (No Auth Required)
- `GET /api/site/public` - Public site settings
- `GET /api/collages/public` - Public collages
- `GET /api/academics/public` - Public academics
- `GET /api/health` - Health check

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |
| `JWT_SECRET` | JWT signing secret | your-secret-key |
| `DB_PATH` | Database file path | ./database/admin.db |

### File Upload Settings

- **Max file size**: 10MB
- **Supported formats**: JPEG, PNG, GIF, WebP
- **Auto-optimization**: Yes (JPEG quality: 85%)
- **Thumbnail generation**: Yes (300x300px)

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📱 Frontend Integration

The admin panel can be integrated with your Next.js frontend:

```typescript
// Example API call
const updateSiteSetting = async (key: string, value: string) => {
  const response = await fetch(`http://localhost:5000/api/site/${key}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ value })
  });
  return response.json();
};
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: 100 requests per 15 minutes
- **Input Validation**: Request validation with express-validator
- **CORS Protection**: Configurable cross-origin settings
- **SQL Injection Protection**: Parameterized queries
- **File Upload Security**: File type and size validation

## 📊 Monitoring

- **Health Check**: `/api/health` endpoint
- **Logging**: Morgan HTTP request logging
- **Error Handling**: Comprehensive error responses
- **Database Monitoring**: SQLite query logging

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Change port in .env file
   PORT=5001
   ```

2. **Database errors**
   ```bash
   # Delete database file and restart
   rm database/admin.db
   npm start
   ```

3. **Upload directory issues**
   ```bash
   # Create uploads directory manually
   mkdir uploads
   ```

4. **CORS errors**
   ```bash
   # Update FRONTEND_URL in .env
   FRONTEND_URL=http://your-domain.com
   ```

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Updates

To update the server:

```bash
git pull origin main
npm install
npm start
```

---

**Happy Administering! 🎓**
