const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    description: { type: String, required: true },
    images: [String],
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);
