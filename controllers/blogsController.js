import cloudinary from "../config/cloudinary.js";
import blogModel from "../models/blogModel.js";

export const createBlog = async (req, res) => {
    const { title, slug, content, tags, category } = req.body;
    const { status } = req.query;

    if (status !== "draft") {
        if (!title || !slug || !content || !tags || !category) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }
    }


    try {
        const blog = new blogModel({
            title,
            slug,
            excerpt: content.substring(0, 150),
            content,
            coverImage: req.file?.path,
            tags: JSON.parse(tags),
            category,
            author: req.user._id,
            status: status || "draft"
        })
        await blog.save();

        return res.status(201).json({ success: true, message: 'Blog created successfully' });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export const getAllBlogs = async (req, res) => {
    try {
        const blogs = await blogModel.find().populate('author').sort({ createdAt: -1 });
        return res.status(200).json({ success: true, blogs });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.messages });
    }
}

export const getBlog = async (req, res) => {
    const { slug } = req.params;

    if (!slug) {
        return res.status(400).json({ success: false, message: 'Please provide a slug' });
    }

    try {
        const blog = await blogModel.findOne({ slug });

        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog not found' });
        }

        return res.status(200).json({ success: true, blog });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// Remove the Blog
export const removeBlog = async (req, res) => {
    const { slug } = req.param;
    if (!slug) {
        return res.status(400).json({ success: false, message: 'Please provide a slug' });
    }

    try {
        await blogModel.findOneAndDelete({ slug });
        return res.status(200).json({ success: true, message: 'Blog deleted successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// Edit the Blog
export const editBlog = async (req, res) => {
    const { slug } = req.params;

    if (!slug) {
        return res.status(400).json({
            success: false,
            message: "Slug is required",
        });
    }

    try {
        // 1. Find existing blog
        const blog = await blogModel.findOne({ slug });

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found",
            });
        }

        // 2. Extract fields from req.body
        const {
            title,
            category,
            content,
            author,
            status,
        } = req.body;

        // tags may come as array or string
        let tags = req.body["tags[]"] || req.body.tags || [];

        if (typeof tags === "string") {
            tags = [tags];
        }

        // 3. Handle image update
        if (req.file) {
            // delete old image if exists
            if (blog.coverImage) {
                await cloudinary.uploader.destroy(blog.coverImage);
            }

            blog.coverImage = req.file.path;
        }

        // 4. Update fields safely
        blog.title = title || blog.title;
        blog.category = category || blog.category;
        blog.content = content || blog.content;
        blog.author = author || blog.author;
        blog.status = status || blog.status;
        blog.tags = tags;
        blog.updatedAt = new Date();

        // 5. Save
        await blog.save();

        return res.json({
            success: true,
            message: "Blog updated successfully",
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
