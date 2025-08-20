# JSON-Powered Collage Website

A fully customizable collage website built with Next.js 13+, TypeScript, and TailwindCSS. This WordPress-like theme uses JSON files instead of a database for storing all content, making it lightweight and easy to deploy.

## Features

- **🖼️ Collage Management**: Create, edit, and delete photo collages
- **⚙️ Fully Customizable**: Edit header, footer, navigation, and site settings
- **📱 Responsive Design**: Modern, mobile-first design with TailwindCSS
- **🗂️ JSON-Powered**: No database required - all data stored in JSON files
- **🔧 Admin Panel**: Complete admin dashboard for managing content
- **🚀 Production Ready**: Built with Next.js App Router and TypeScript

## Project Structure

```
├── data/
│   ├── collages.json      # Stores all collages
│   └── site.json          # Site-wide settings
├── public/
│   └── uploads/           # Image uploads directory
├── src/
│   ├── app/
│   │   ├── admin/         # Admin dashboard
│   │   ├── collage/[id]/  # Collage detail pages
│   │   ├── api/           # API routes
│   │   └── about/         # About page
│   ├── components/        # Reusable components
│   └── types/             # TypeScript definitions
```

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

4. **Access the admin panel:**
   Go to [http://localhost:3000/admin](http://localhost:3000/admin) to manage content

## Data Structure

### Collages (`data/collages.json`)
```json
[
  {
    "id": 1,
    "title": "Vacation Memories",
    "images": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg"
    ]
  }
]
```

### Site Settings (`data/site.json`)
```json
{
  "siteTitle": "My Collage Website",
  "logo": "/logo.png",
  "navLinks": [
    { "label": "Home", "href": "/" },
    { "label": "About", "href": "/about" }
  ],
  "footer": {
    "text": "© 2025 My Website",
    "socialLinks": [
      { "label": "Twitter", "href": "https://twitter.com/profile" }
    ]
  }
}
```

## API Endpoints

- `GET/POST/PUT/DELETE /api/collages` - Manage collages
- `GET/PUT /api/site` - Manage site settings

## Admin Features

### Collage Management
- Create new collages with multiple images
- Edit existing collages (title and images)
- Delete collages
- Real-time preview

### Site Customization
- Edit site title and logo
- Manage navigation links
- Customize footer text and social links
- All changes saved to JSON files

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Other Platforms
The app works on any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- Self-hosted with Docker

## Customization

### Adding New Pages
Create new pages in `src/app/` following Next.js App Router conventions.

### Styling
Modify TailwindCSS classes in components or add custom styles to `src/app/globals.css`.

### Image Handling
- Images can be URLs or uploaded to `/public/uploads/`
- Next.js Image component handles optimization automatically
- Remote images are supported via `next.config.ts`

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Data Storage**: JSON files
- **Image Optimization**: Next.js Image component
- **Deployment**: Vercel-ready

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.