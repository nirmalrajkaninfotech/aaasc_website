# AAASC College Website - Static Version

A modern, responsive college website built with Next.js and converted to static files for deployment on shared hosting platforms like cPanel.

## 🎓 About

This is the official website for AAASC (Arulmigu Arunachaleswarar Arts and Science College), featuring comprehensive information about academics, facilities, faculty, placements, and campus life. The website has been optimized as a static site for fast loading and easy deployment.

## ✨ Features

### 🏠 **Homepage**
- Dynamic hero section with carousel
- About section with statistics
- Featured achievements and placements
- Facilities overview
- Gallery highlights

### 📚 **Academic Information**
- Comprehensive program listings
- Department details
- Course descriptions and eligibility
- Academic calendar and updates

### 👥 **Faculty & Staff**
- Faculty profiles with photos
- Department-wise organization
- Qualifications and expertise
- Contact information

### 🏢 **Facilities**
- Computer labs and libraries
- Sports complex and recreational facilities
- Administrative offices
- Student support services

### 🎯 **Student Life**
- Placement records and statistics
- Achievement showcases
- Alumni association
- Campus events and activities

### 🖼️ **Gallery**
- Event photo galleries
- Campus life documentation
- Academic ceremonies
- Sports and cultural activities

## 🛠️ Technology Stack

- **Framework:** Next.js 15.4.2
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React, React Icons
- **Rich Text:** TipTap Editor
- **Drag & Drop:** DnD Kit
- **Image Handling:** Next.js Image Optimization
- **Deployment:** Static Export

## 📁 Project Structure

```
aaasc_website/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── about/             # About page
│   │   ├── academics/         # Academic programs
│   │   ├── faculty/           # Faculty information
│   │   ├── facilities/        # Campus facilities
│   │   ├── gallery/           # Photo galleries
│   │   ├── collage/[id]/      # Dynamic gallery pages
│   │   └── ...
│   ├── components/            # Reusable React components
│   ├── lib/                   # Utility functions and data
│   └── types/                 # TypeScript type definitions
├── data/                      # JSON data files
│   ├── academics.json
│   ├── alumni.json
│   ├── carousel.json
│   ├── collages.json
│   ├── iqac.json
│   ├── placements.json
│   └── site.json
├── public/                    # Static assets
│   ├── uploads/              # User uploaded images
│   ├── img/                  # Static images
│   └── .htaccess            # Server configuration
├── out/                      # Generated static files (after build)
└── api-backup/              # Backed up API routes
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd aaasc_website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📦 Building for Production

### Static Site Generation

This project is configured for static export, perfect for shared hosting:

1. **Build static site**
   ```bash
   npm run build:static
   ```
   
   Or use the automated script:
   ```bash
   ./build-static.sh
   ```

2. **Generated files**
   - Static files will be in the `out/` directory
   - Total files: ~307
   - Optimized for fast loading

3. **Test locally** (optional)
   ```bash
   npm run serve:static
   ```

## 🌐 Deployment

### cPanel Shared Hosting

1. **Upload files**
   - Upload contents of `out/` folder to `public_html/`
   - Or upload the generated zip file and extract

2. **Verify .htaccess**
   - Ensure `.htaccess` file is uploaded for proper routing
   - Handles trailing slashes and static routing

3. **Test deployment**
   - Visit your domain
   - Check navigation and image loading

### Other Static Hosts

The generated static files work on any static hosting platform:
- Netlify
- Vercel
- GitHub Pages
- AWS S3
- Any web server

## 📝 Content Management

### Updating Content

Since this is a static site, content updates require rebuilding:

1. **Edit data files** in the `data/` folder:
   - `academics.json` - Academic programs
   - `site.json` - Site settings and general content
   - `collages.json` - Gallery images and descriptions
   - `placements.json` - Placement records
   - `alumni.json` - Alumni information

2. **Rebuild and redeploy**
   ```bash
   npm run build:static
   # Upload new files to hosting
   ```

### Adding Images

1. Add images to `public/uploads/` folder
2. Reference them in JSON files as `/uploads/filename.jpg`
3. Rebuild the site

## 🎨 Customization

### Styling
- Tailwind CSS classes in components
- Global styles in `src/app/globals.css`
- Responsive design built-in

### Components
- Modular React components in `src/components/`
- TypeScript for type safety
- Reusable across pages

### Data Structure
- JSON-based content management
- Type-safe with TypeScript interfaces
- Easy to modify and extend

## 📊 Performance

### Optimizations
- ✅ Static site generation
- ✅ Image optimization
- ✅ Code splitting
- ✅ CSS optimization
- ✅ Gzip compression (via .htaccess)
- ✅ Browser caching headers

### Lighthouse Scores
- Performance: Optimized for fast loading
- SEO: Pre-rendered HTML for search engines
- Accessibility: Semantic HTML and ARIA labels

## 🔧 Development Scripts

```bash
# Development
npm run dev          # Start development server
npm run lint         # Run ESLint

# Production
npm run build        # Build for production
npm run build:static # Build static export
npm run start        # Start production server

# Utilities
npm run serve:static # Serve static files locally
./build-static.sh    # Automated build script
```

## 📱 Responsive Design

- **Mobile-first** approach
- **Breakpoints:**
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px
- **Touch-friendly** navigation and interactions

## 🔒 Security

- Static files only (no server vulnerabilities)
- Content Security Policy headers
- XSS protection via .htaccess
- No database or user input processing

## 🐛 Troubleshooting

### Common Issues

1. **Images not loading**
   - Check file paths in JSON files
   - Ensure images are in `public/uploads/`
   - Verify .htaccess is uploaded

2. **Pages not found (404)**
   - Confirm .htaccess file is present
   - Check trailing slash configuration
   - Verify all HTML files generated

3. **Styling issues**
   - Clear browser cache
   - Check CSS files in `_next/static/css/`
   - Verify Tailwind classes

### Build Errors

- **Out of disk space:** Clear npm cache and node_modules
- **API route errors:** Ensure API routes are moved to api-backup
- **TypeScript errors:** Check type definitions in src/types/

## 📄 License

This project is proprietary software for AAASC College.

## 🤝 Contributing

For internal development team:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support

For technical support or questions:
- Internal development team
- College IT department

## 🎯 Future Enhancements

### Planned Features
- [ ] Contact form integration (external service)
- [ ] Newsletter subscription
- [ ] Event calendar
- [ ] Online admission portal
- [ ] Student portal integration

### Performance Improvements
- [ ] Image lazy loading optimization
- [ ] Progressive Web App (PWA) features
- [ ] Advanced caching strategies

---

**Built with ❤️ for AAASC College**

*Last updated: August 2025*