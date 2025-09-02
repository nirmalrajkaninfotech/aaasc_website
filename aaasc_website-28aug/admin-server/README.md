# College Admin Server

A comprehensive Node.js server with Express for handling college administration API endpoints using JSON file storage.

## Features

- **Authentication & Authorization** with JWT
- **File Uploads** with support for images and documents
- **RESTful API** endpoints for all college resources
- **Role-based Access Control** (Admin, Editor, etc.)
- **Rate Limiting** to prevent abuse
- **CORS** enabled for cross-origin requests
- **Environment-based** configuration

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```env
   PORT=5000
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   UPLOAD_DIR=./public/uploads
   ```

3. Start the server in development mode (with auto-reload):
   ```bash
   npm run dev
   ```

4. Or start in production mode:
   ```bash
   npm start
   ```

The server will run on `http://localhost:5000` by default.

## API Documentation

### Authentication

#### Login
```
POST /api/auth/login
```
Request body:
```json
{
  "username": "admin",
  "password": "password"
}
```

### Public Endpoints

#### Get Active Admission Form
```
GET /api/admission-forms/active
```

#### Submit Admission Form
```
POST /api/admission-forms/:id/submit
```

#### Get All Colleges
```
GET /api/collages
```

#### Get College by ID
```
GET /api/collages/:id
```

#### Get Header Data
```
GET /api/header3
```

### Protected Endpoints (Require Authentication)

#### Carousel Management
```
GET    /api/carousel         - Get all carousel items
POST   /api/carousel         - Add new carousel item
PUT    /api/carousel/:id     - Update carousel item
DELETE /api/carousel/:id     - Delete carousel item
```

#### Academics
```
GET    /api/academics/public - Get public academic data
GET    /api/academics        - Get all academic data (protected)
POST   /api/academics        - Add academic data
PUT    /api/academics/:id    - Update academic data
```

#### Gallery
```
GET    /api/gallery          - Get all gallery items
POST   /api/gallery          - Upload new image
DELETE /api/gallery/:id      - Delete image
```

#### Alumni
```
GET    /api/alumni           - Get all alumni
POST   /api/alumni           - Add new alumnus
GET    /api/alumni/:id       - Get alumnus by ID
PUT    /api/alumni/:id       - Update alumnus
DELETE /api/alumni/:id       - Delete alumnus
```

#### Placements
```
GET    /api/placements                - Get all placement opportunities
POST   /api/placements                - Add new placement
GET    /api/placements/:id            - Get placement by ID
POST   /api/placements/:id/apply      - Apply for placement
GET    /api/placements/:id/applications - Get applications for placement
```

#### IQAC (Internal Quality Assurance Cell)
```
GET    /api/iqac/public     - Get public IQAC data
GET    /api/iqac           - Get all IQAC data (protected)
POST   /api/iqac           - Update IQAC data
POST   /api/iqac/meetings  - Add IQAC meeting
POST   /api/iqac/aqar      - Add AQAR report
```

### Admin Endpoints (Require Admin Role)

#### Admission Forms Management
```
GET    /api/admin/admission-forms              - Get all admission forms
POST   /api/admin/admission-forms              - Create new form
GET    /api/admin/admission-forms/:id          - Get form by ID
PUT    /api/admin/admission-forms/:id          - Update form
DELETE /api/admin/admission-forms/:id          - Delete form
GET    /api/admin/admission-forms/:id/submissions - Get form submissions
```

#### College Management
```
POST   /api/admin/collages                     - Add new college
PUT    /api/admin/collages/:id                 - Update college
DELETE /api/admin/collages/:id                 - Delete college
POST   /api/admin/collages/:id/departments     - Add department
PUT    /api/admin/collages/:id/departments/:deptId - Update department
DELETE /api/admin/collages/:id/departments/:deptId - Remove department
```

#### Header Management
```
GET    /api/admin/header3     - Get full header data
POST   /api/admin/header3     - Update header data
POST   /api/admin/header3/social - Add/update social link
DELETE /api/admin/header3/social/:platform - Remove social link
POST   /api/admin/header3/menu - Add/update menu item
DELETE /api/admin/header3/menu/:id - Remove menu item
```

## File Structure

```
src/
├── config/               # Configuration files
├── controllers/          # Route controllers
├── middleware/           # Custom middleware
│   ├── auth.js           # Authentication middleware
│   └── errorHandler.js   # Error handling middleware
├── models/               # Data models
├── routes/               # API routes
│   ├── academics.js      # Academics routes
│   ├── admission-forms.js # Admission forms routes
│   ├── alumni.js         # Alumni routes
│   ├── auth.js           # Authentication routes
│   ├── carousel.js       # Carousel routes
│   ├── collages.js       # College management routes
│   ├── gallery.js        # Gallery routes
│   ├── header3.js        # Header management routes
│   ├── iqac.js           # IQAC routes
│   ├── placements.js     # Placement routes
│   └── site.js           # Site configuration routes
├── utils/                # Utility functions
│   ├── fetchUtils.js     # File and URL utilities
│   └── fileUtils.js      # File system utilities
└── server.js             # Main server file
```

## Environment Variables

| Variable      | Description                     | Default          |
|---------------|---------------------------------|------------------|
| PORT          | Server port                     | 5000             |
| JWT_SECRET    | Secret key for JWT tokens       | (required)       |
| NODE_ENV      | Environment (development/prod)  | development      |
| UPLOAD_DIR    | Directory for file uploads      | ./public/uploads |

## Error Handling

The API returns appropriate HTTP status codes and JSON error responses in the following format:

```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

## Rate Limiting

API endpoints are rate limited to prevent abuse. The default limits are:
- 100 requests per 15 minutes for authenticated users
- 60 requests per 15 minutes for anonymous users

## Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.
  "title": "Updated Title"
}
```

#### Delete item
```
DELETE /api/:resource/:id
```

## Data Storage
All data is stored in the `data` directory as JSON files. Each resource has its own file (e.g., `posts.json`, `users.json`).

## Security Note
This is a basic implementation for development purposes. For production use, please add:
- Authentication/Authorization
- Input validation
- Rate limiting
- Proper error handling
- Environment variables for configuration
