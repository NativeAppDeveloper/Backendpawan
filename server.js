// blog-server.js
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const cloudinary = require('./cloud');
const fs = require('fs');

const Blog = require('./models/Blog');

const app = express();

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB connected');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    }
};
connectDB();



// const storage = new CloudinaryStorage({
//     cloudinary,
//     params: {
//         folder: 'blog_uploads',
//         allowed_formats: ['jpg', 'png', 'jpeg'],
//     },
// });

// const upload = multer({ storage });

// Setup Multer for file uploads (local disk, or use your Cloudinary storage if needed)
const upload = multer({ dest: 'uploads/' }); // keep this for temp storage

// Middleware
app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST'],
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 📌 Create blog post
app.post('/api/blogs', upload.array('images', 3), async (req, res) => {
    try {
        const { title, subtitle, description } = req.body;

        if (!title || !subtitle || !description) {
            return res.status(400).json({ error: 'Title, subtitle, and description are required.' });
        }

        const imagePaths = [];

        for (const file of req.files) {
            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(file.path, {
                folder: 'blogs'
            });
            imagePaths.push(result.secure_url);

            // Remove local file after upload
            fs.unlinkSync(file.path);
        }

        const blog = new Blog({
            title,
            subtitle,
            description,
            images: imagePaths,
        });

        await blog.save();
        res.status(201).json(blog);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
// 📌 Get all blogs
app.get('/api/blogs', async (req, res) => {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
});

// 📌 Get blog by title
app.get('/api/blogs/:title', async (req, res) => {
    const blog = await Blog.findOne({ title: req.params.title });
    if (!blog) return res.status(404).json({ error: 'Not found' });
    res.json(blog);
});

// Root Test
app.get('/', (req, res) => {
    res.send('🚀 Blog API is running');
});

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});