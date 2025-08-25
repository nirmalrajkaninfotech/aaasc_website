const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'https://demoaaasc.veetusaapadu.in'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../public/uploads');
        fs.ensureDirSync(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Data file paths
const DATA_DIR = path.join(__dirname, '../data');
const ACADEMICS_FILE = path.join(DATA_DIR, 'academics.json');
const ALUMNI_FILE = path.join(DATA_DIR, 'alumni.json');
const CAROUSEL_FILE = path.join(DATA_DIR, 'carousel.json');
const GALLERY_FILE = path.join(DATA_DIR, 'gallery.json');
const PLACEMENTS_FILE = path.join(DATA_DIR, 'placements.json');

// Ensure data directory exists
fs.ensureDirSync(DATA_DIR);

// Helper function to read JSON file
const readJsonFile = async (filePath) => {
    try {
        if (await fs.pathExists(filePath)) {
            return await fs.readJson(filePath);
        }
        return [];
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return [];
    }
};

// Helper function to write JSON file
const writeJsonFile = async (filePath, data) => {
    try {
        await fs.writeJson(filePath, data, { spaces: 2 });
        return true;
    } catch (error) {
        console.error(`Error writing ${filePath}:`, error);
        return false;
    }
};// A
CADEMICS ROUTES
app.get('/api/admin/academics', async (req, res) => {
    try {
        const academics = await readJsonFile(ACADEMICS_FILE);
        res.json(academics);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch academics data' });
    }
});

app.post('/api/admin/academics', async (req, res) => {
    try {
        const academics = await readJsonFile(ACADEMICS_FILE);
        const newItem = {
            id: Date.now().toString(),
            ...req.body,
            createdAt: new Date().toISOString()
        };
        academics.push(newItem);

        if (await writeJsonFile(ACADEMICS_FILE, academics)) {
            res.status(201).json(newItem);
        } else {
            res.status(500).json({ error: 'Failed to save academics data' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to create academics item' });
    }
});

app.put('/api/admin/academics/:id', async (req, res) => {
    try {
        const academics = await readJsonFile(ACADEMICS_FILE);
        const index = academics.findIndex(item => item.id === req.params.id);

        if (index === -1) {
            return res.status(404).json({ error: 'Academic item not found' });
        }

        academics[index] = { ...academics[index], ...req.body, updatedAt: new Date().toISOString() };

        if (await writeJsonFile(ACADEMICS_FILE, academics)) {
            res.json(academics[index]);
        } else {
            res.status(500).json({ error: 'Failed to update academics data' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update academics item' });
    }
});

app.delete('/api/admin/academics/:id', async (req, res) => {
    try {
        const academics = await readJsonFile(ACADEMICS_FILE);
        const filteredAcademics = academics.filter(item => item.id !== req.params.id);

        if (academics.length === filteredAcademics.length) {
            return res.status(404).json({ error: 'Academic item not found' });
        }

        if (await writeJsonFile(ACADEMICS_FILE, filteredAcademics)) {
            res.json({ message: 'Academic item deleted successfully' });
        } else {
            res.status(500).json({ error: 'Failed to delete academics item' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete academics item' });
    }
});

// ALUMNI ROUTES
app.get('/api/admin/alumni', async (req, res) => {
    try {
        const alumni = await readJsonFile(ALUMNI_FILE);
        res.json(alumni);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch alumni data' });
    }
});

app.post('/api/admin/alumni', async (req, res) => {
    try {
        const alumni = await readJsonFile(ALUMNI_FILE);
        const newItem = {
            id: Date.now().toString(),
            ...req.body,
            createdAt: new Date().toISOString()
        };
        alumni.push(newItem);

        if (await writeJsonFile(ALUMNI_FILE, alumni)) {
            res.status(201).json(newItem);
        } else {
            res.status(500).json({ error: 'Failed to save alumni data' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to create alumni item' });
    }
});

app.put('/api/admin/alumni/:id', async (req, res) => {
    try {
        const alumni = await readJsonFile(ALUMNI_FILE);
        const index = alumni.findIndex(item => item.id === req.params.id);

        if (index === -1) {
            return res.status(404).json({ error: 'Alumni item not found' });
        }

        alumni[index] = { ...alumni[index], ...req.body, updatedAt: new Date().toISOString() };

        if (await writeJsonFile(ALUMNI_FILE, alumni)) {
            res.json(alumni[index]);
        } else {
            res.status(500).json({ error: 'Failed to update alumni data' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update alumni item' });
    }
});

app.delete('/api/admin/alumni/:id', async (req, res) => {
    try {
        const alumni = await readJsonFile(ALUMNI_FILE);
        const filteredAlumni = alumni.filter(item => item.id !== req.params.id);

        if (alumni.length === filteredAlumni.length) {
            return res.status(404).json({ error: 'Alumni item not found' });
        }

        if (await writeJsonFile(ALUMNI_FILE, filteredAlumni)) {
            res.json({ message: 'Alumni item deleted successfully' });
        } else {
            res.status(500).json({ error: 'Failed to delete alumni item' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete alumni item' });
    }
});//
 CAROUSEL ROUTES
app.get('/api/admin/carousel', async (req, res) => {
    try {
        const carousel = await readJsonFile(CAROUSEL_FILE);
        res.json(carousel);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch carousel data' });
    }
});

app.post('/api/admin/carousel', async (req, res) => {
    try {
        const carousel = await readJsonFile(CAROUSEL_FILE);
        const newItem = {
            id: Date.now().toString(),
            ...req.body,
            createdAt: new Date().toISOString()
        };
        carousel.push(newItem);

        if (await writeJsonFile(CAROUSEL_FILE, carousel)) {
            res.status(201).json(newItem);
        } else {
            res.status(500).json({ error: 'Failed to save carousel data' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to create carousel item' });
    }
});

app.put('/api/admin/carousel/:id', async (req, res) => {
    try {
        const carousel = await readJsonFile(CAROUSEL_FILE);
        const index = carousel.findIndex(item => item.id === req.params.id);

        if (index === -1) {
            return res.status(404).json({ error: 'Carousel item not found' });
        }

        carousel[index] = { ...carousel[index], ...req.body, updatedAt: new Date().toISOString() };

        if (await writeJsonFile(CAROUSEL_FILE, carousel)) {
            res.json(carousel[index]);
        } else {
            res.status(500).json({ error: 'Failed to update carousel data' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update carousel item' });
    }
});

app.delete('/api/admin/carousel/:id', async (req, res) => {
    try {
        const carousel = await readJsonFile(CAROUSEL_FILE);
        const filteredCarousel = carousel.filter(item => item.id !== req.params.id);

        if (carousel.length === filteredCarousel.length) {
            return res.status(404).json({ error: 'Carousel item not found' });
        }

        if (await writeJsonFile(CAROUSEL_FILE, filteredCarousel)) {
            res.json({ message: 'Carousel item deleted successfully' });
        } else {
            res.status(500).json({ error: 'Failed to delete carousel item' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete carousel item' });
    }
});

// FILE UPLOAD ROUTE
app.post('/api/admin/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileUrl = `/uploads/${req.file.filename}`;
        res.json({
            success: true,
            filename: req.file.filename,
            originalName: req.file.originalname,
            url: fileUrl,
            size: req.file.size
        });
    } catch (error) {
        res.status(500).json({ error: 'File upload failed' });
    }
});

// IMAGE UPLOAD ROUTE (specific for images)
app.post('/api/admin/upload-image', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }

        // Check if file is an image
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({ error: 'Only image files are allowed' });
        }

        const imageUrl = `/uploads/${req.file.filename}`;
        res.json({
            success: true,
            filename: req.file.filename,
            originalName: req.file.originalname,
            url: imageUrl,
            size: req.file.size
        });
    } catch (error) {
        res.status(500).json({ error: 'Image upload failed' });
    }
});

// GALLERY ROUTES
app.get('/api/admin/gallery', async (req, res) => {
    try {
        const gallery = await readJsonFile(GALLERY_FILE);
        res.json(gallery);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch gallery data' });
    }
});

app.post('/api/admin/gallery', async (req, res) => {
    try {
        const gallery = await readJsonFile(GALLERY_FILE);
        const newItem = {
            id: Date.now().toString(),
            ...req.body,
            createdAt: new Date().toISOString()
        };
        gallery.push(newItem);

        if (await writeJsonFile(GALLERY_FILE, gallery)) {
            res.status(201).json(newItem);
        } else {
            res.status(500).json({ error: 'Failed to save gallery data' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to create gallery item' });
    }
});

// PLACEMENTS ROUTES
app.get('/api/admin/placements', async (req, res) => {
    try {
        const placements = await readJsonFile(PLACEMENTS_FILE);
        res.json(placements);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch placements data' });
    }
});

app.post('/api/admin/placements', async (req, res) => {
    try {
        const placements = await readJsonFile(PLACEMENTS_FILE);
        const newItem = {
            id: Date.now().toString(),
            ...req.body,
            createdAt: new Date().toISOString()
        };
        placements.push(newItem);

        if (await writeJsonFile(PLACEMENTS_FILE, placements)) {
            res.status(201).json(newItem);
        } else {
            res.status(500).json({ error: 'Failed to save placements data' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to create placements item' });
    }
});

// Health check endpoint
app.get('/api/admin/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`Admin API server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/admin/health`);
});