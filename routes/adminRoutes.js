import express from 'express'
import Category from '../models/categoryModel.js';
import Package from '../models/packageModel.js';
import Skill from '../models/skillModel.js';
import CandidateCategory from '../models/candidateCategoryModel.js';
import CompanyCategory from '../models/companyCategoryModel.js';
import slugify from 'slugify'
import userAuth from '../middlewares/userAuth.js';

const adminAuth = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  next();
};

const adminRouter = express.Router()

adminRouter.post("/categories", userAuth, adminAuth, async (req, res) => {
  const { name, icon = "Tag", slug } = req.body;

  try {
    const category = new Category({ name, icon, subcategories: [], slug: slug || slugify(name, { lower: true }) });
    await category.save();
    res.status(201).json({ success: true, message: "Category added successfully", category });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

adminRouter.post("/categories/:id/subcategories", userAuth, adminAuth, async (req, res) => {
  const { id } = req.params;
  const { subcategory } = req.body;

  try {
    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ error: "Category not found" });

    category.subcategories.push(subcategory);
    await category.save();
    res.json({ success: true, message: "Subcategory added successfully", category });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

adminRouter.get("/categories", async (req, res) => {
  const categories = await Category.find();
  res.json({ success: true, categories });
});

adminRouter.post("/categories/:id/subcategories/remove", userAuth, adminAuth, async (req, res) => {
  const { id } = req.params;
  const { subcategory } = req.body;

  try {
    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ error: "Category not found" });

    category.subcategories = category.subcategories.filter(sub => sub !== subcategory);
    await category.save();
    res.json({ success: true, message: "Subcategory removed successfully", category });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete entire category
adminRouter.delete("/categories/:id", userAuth, adminAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    await Category.findByIdAndDelete(id);
    res.json({
      success: true,
      message: `Category "${category.name}" deleted successfully`
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

adminRouter.patch("/categories/:id", userAuth, adminAuth, async (req, res) => {
  console.log("PATCH");
  const { id } = req.params;
  const updates = {};

  console.log(req.body);

  if (typeof req.body.name === "string" && req.body.name.trim()) {
    updates.name = req.body.name.trim();
  }

  if (typeof req.body.icon === "string" && req.body.icon.trim()) {
    updates.icon = req.body.icon.trim();
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No updates provided" });
  }

  try {
    const category = await Category.findByIdAndUpdate(id, updates, { new: true });
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json({ success: true, message: "Category updated successfully", category });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Bulk import categories from Excel data
adminRouter.post("/categories/bulk-import", userAuth, adminAuth, async (req, res) => {
  console.log("BULK");
  const { categories } = req.body;

  try {
    const results = {
      created: 0,
      updated: 0,
      errors: []
    };

    for (const categoryData of categories) {
      try {
        const { name, subcategories = [], icon = "Tag", slug } = categoryData;

        if (!name || !name.trim()) {
          results.errors.push(`Category name is required for entry: ${JSON.stringify(categoryData)}`);
          continue;
        }

        // Check if category already exists
        let existingCategory = await Category.findOne({ name: name.trim() });

        if (existingCategory) {
          // Update existing category by adding new subcategories
          const newSubcategories = subcategories.filter(sub =>
            sub && sub.trim() && !existingCategory.subcategories.includes(sub.trim())
          );

          if (newSubcategories.length > 0) {
            existingCategory.subcategories.push(...newSubcategories.map(sub => sub.trim()));
            await existingCategory.save();
            results.updated++;
          }
        } else {
          // Create new category
          const newCategory = new Category({
            name: name.trim(),
            icon: icon || "Tag",
            subcategories: subcategories.filter(sub => sub && sub.trim()).map(sub => sub.trim()),
            slug: slug || slugify(name, { lower: true })
          });
          await newCategory.save();
          results.created++;
        }
      } catch (err) {
        results.errors.push(`Error processing category "${categoryData.name}": ${err.message}`);
      }
    }

    res.json({
      success: true,
      message: `Import completed. Created: ${results.created}, Updated: ${results.updated}, Errors: ${results.errors.length}`,
      results
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: "Bulk import failed",
      details: err.message
    });
  }
});

// ============================
// Skills Management Routes
// ============================

// Create new skill
adminRouter.post("/skills", userAuth, adminAuth, async (req, res) => {
  const { name } = req.body;

  try {
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Skill name is required" });
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const skill = new Skill({ name: name.trim(), slug });
    await skill.save();
    res.status(201).json({ success: true, skill });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: "Skill already exists" });
    }
    res.status(400).json({ success: false, message: err.message });
  }
});

// Get all skills
adminRouter.get("/skills", async (req, res) => {
  try {
    const skills = await Skill.find().sort({ name: 1 });
    res.json({ success: true, skills });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Bulk import skills
adminRouter.post("/skills/bulk-import", userAuth, adminAuth, async (req, res) => {
  const { skills } = req.body;

  try {
    const results = {
      created: 0,
      skipped: 0,
      errors: []
    };

    for (const skillData of skills) {
      try {
        const { name, slug } = skillData;

        if (!name || !name.trim()) {
          results.errors.push(`Skill name is required for entry: ${JSON.stringify(skillData)}`);
          continue;
        }

        // Check if skill already exists
        const existingSkill = await Skill.findOne({ name: name.trim() });

        if (existingSkill) {
          results.skipped++;
          continue;
        }

        const newSkill = new Skill({
          name: name.trim(),
          slug: slug || slugify(name, { lower: true })
        });

        await newSkill.save();
        results.created++;
      } catch (err) {
        results.errors.push(`Error processing skill "${skillData.name}": ${err.message}`);
      }
    }

    res.json({
      success: true,
      message: `Import completed. Created: ${results.created}, Skipped: ${results.skipped}, Errors: ${results.errors.length}`,
      results
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: "Bulk import failed",
      details: err.message
    });
  }
});

// Delete a skill
adminRouter.delete("/skills/:id", userAuth, adminAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const skill = await Skill.findById(id);
    if (!skill) {
      return res.status(404).json({ success: false, message: "Skill not found" });
    }
    await Skill.findByIdAndDelete(id);
    res.json({ success: true, message: `Skill "${skill.name}" deleted successfully` });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ============================
// Candidate Category Management Routes
// ============================

// Create new candidate category
adminRouter.post("/candidate-categories", userAuth, adminAuth, async (req, res) => {
  const { name } = req.body;

  try {
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const category = new CandidateCategory({ name: name.trim(), slug });
    await category.save();
    res.status(201).json({ success: true, category });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: "Category already exists" });
    }
    res.status(400).json({ success: false, message: err.message });
  }
});

// Get all candidate categories
adminRouter.get("/candidate-categories", async (req, res) => {
  try {
    const categories = await CandidateCategory.find().sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete a candidate category
adminRouter.delete("/candidate-categories/:id", userAuth, adminAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const category = await CandidateCategory.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    await CandidateCategory.findByIdAndDelete(id);
    res.json({ success: true, message: `Category \"${category.name}\" deleted successfully` });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ============================
// Company Category Management Routes
// ============================

// Create new company category
adminRouter.post("/company-categories", userAuth, adminAuth, async (req, res) => {
  const { name } = req.body;

  try {
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const category = new CompanyCategory({ name: name.trim(), slug });
    await category.save();
    res.status(201).json({ success: true, category });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: "Category already exists" });
    }
    res.status(400).json({ success: false, message: err.message });
  }
});

// Get all company categories
adminRouter.get("/company-categories", async (req, res) => {
  try {
    const categories = await CompanyCategory.find().sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete a company category
adminRouter.delete("/company-categories/:id", userAuth, adminAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const category = await CompanyCategory.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    await CompanyCategory.findByIdAndDelete(id);
    res.json({ success: true, message: `Category "${category.name}" deleted successfully` });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Bulk import company categories
adminRouter.post("/company-categories/bulk-import", userAuth, adminAuth, async (req, res) => {
  const { categories } = req.body;

  try {
    const results = {
      created: 0,
      skipped: 0,
      errors: []
    };

    for (const catData of categories) {
      try {
        const { name, slug } = catData;

        if (!name || !name.trim()) {
          results.errors.push(`Category name is required for entry: ${JSON.stringify(catData)}`);
          continue;
        }

        // Check if category already exists
        const existingCategory = await CompanyCategory.findOne({ name: name.trim() });

        if (existingCategory) {
          results.skipped++;
          continue;
        }

        const newCategory = new CompanyCategory({
          name: name.trim(),
          slug: slug || slugify(name, { lower: true })
        });

        await newCategory.save();
        results.created++;
      } catch (err) {
        results.errors.push(`Error processing category "${catData.name}": ${err.message}`);
      }
    }

    res.json({
      success: true,
      message: `Import completed. Created: ${results.created}, Skipped: ${results.skipped}, Errors: ${results.errors.length}`,
      results
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: "Bulk import failed",
      details: err.message
    });
  }
});

// Bulk import candidate categories
adminRouter.post("/candidate-categories/bulk-import", userAuth, adminAuth, async (req, res) => {
  const { categories } = req.body;

  try {
    const results = {
      created: 0,
      skipped: 0,
      errors: []
    };

    for (const catData of categories) {
      try {
        const { name, slug } = catData;

        if (!name || !name.trim()) {
          results.errors.push(`Category name is required for entry: ${JSON.stringify(catData)}`);
          continue;
        }

        // Check if category already exists
        const existingCategory = await CandidateCategory.findOne({ name: name.trim() });

        if (existingCategory) {
          results.skipped++;
          continue;
        }

        const newCategory = new CandidateCategory({
          name: name.trim(),
          slug: slug || slugify(name, { lower: true })
        });

        await newCategory.save();
        results.created++;
      } catch (err) {
        results.errors.push(`Error processing category "${catData.name}": ${err.message}`);
      }
    }

    res.json({
      success: true,
      message: `Import completed. Created: ${results.created}, Skipped: ${results.skipped}, Errors: ${results.errors.length}`,
      results
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: "Bulk import failed",
      details: err.message
    });
  }
});

// ============================
// Package Management Routes
// ============================

// Get all packages
adminRouter.get("/packages", async (req, res) => {
  try {
    const packages = await Package.find().sort({ displayOrder: 1, createdAt: -1 });
    res.json({ success: true, packages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create new package
adminRouter.post("/packages", userAuth, adminAuth, async (req, res) => {
  const {
    name, price, currency, duration, durationUnit, jobPostings, featuredJobs,
    candidateAccess, candidatesFollow, inviteCandidates, sendMessages,
    printProfiles, reviewComment, viewCandidateInfo, support, packageType,
    features, displayOrder
  } = req.body;

  try {
    // Validate required fields
    if (name == null || duration == null || jobPostings == null) {
      return res.status(400).json({
        success: false,
        error: "Name, duration, and job postings are required"
      });
    }

    // Auto-set price to 0 for Free packages
    const finalPrice = packageType === "Free" ? 0 : (price || 0);

    const newPackage = new Package({
      name: name.trim(),
      price: finalPrice,
      currency: currency || "USD",
      duration,
      durationUnit: durationUnit || "month",
      jobPostings,
      featuredJobs: featuredJobs || 0,
      candidateAccess: candidateAccess || false,
      candidatesFollow: candidatesFollow || 0,
      inviteCandidates: inviteCandidates || false,
      sendMessages: sendMessages || false,
      printProfiles: printProfiles || false,
      reviewComment: reviewComment || false,
      viewCandidateInfo: viewCandidateInfo || false,
      support: support || "Limited",
      packageType: packageType || "Standard",
      features: features || [],
      displayOrder: displayOrder || 0
    });

    await newPackage.save();
    res.status(201).json({
      success: true,
      message: "Package created successfully",
      package: newPackage
    });
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({
        success: false,
        error: "A package with this name already exists"
      });
    } else {
      res.status(400).json({ success: false, error: err.message });
    }
  }
});

// Update package
adminRouter.patch("/packages/:id", userAuth, adminAuth, async (req, res) => {
  const { id } = req.params;
  const updates = {};

  // Only include fields that are provided
  const allowedUpdates = [
    'name', 'price', 'currency', 'duration', 'durationUnit', 'jobPostings', 'featuredJobs',
    'candidateAccess', 'candidatesFollow', 'inviteCandidates', 'sendMessages',
    'printProfiles', 'reviewComment', 'viewCandidateInfo', 'support', 'packageType',
    'features', 'displayOrder'
  ];

  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  // Auto-set price to 0 if packageType is being changed to Free
  if (updates.packageType === "Free") {
    updates.price = 0;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      error: "No updates provided"
    });
  }

  try {
    const updatedPackage = await Package.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    if (!updatedPackage) {
      return res.status(404).json({
        success: false,
        error: "Package not found"
      });
    }

    res.json({
      success: true,
      message: "Package updated successfully",
      package: updatedPackage
    });
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({
        success: false,
        error: "A package with this name already exists"
      });
    } else {
      res.status(400).json({ success: false, error: err.message });
    }
  }
});

// Delete package
adminRouter.delete("/packages/:id", userAuth, adminAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const pkg = await Package.findById(id);

    if (!pkg) {
      return res.status(404).json({
        success: false,
        error: "Package not found"
      });
    }

    await Package.findByIdAndDelete(id);

    res.json({
      success: true,
      message: `Package "${pkg.name}" deleted successfully`
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Toggle package active status
adminRouter.patch("/packages/:id/toggle-status", userAuth, adminAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const pkg = await Package.findById(id);

    if (!pkg) {
      return res.status(404).json({
        success: false,
        error: "Package not found"
      });
    }

    pkg.isActive = !pkg.isActive;
    await pkg.save();

    res.json({
      success: true,
      message: `Package ${pkg.isActive ? 'activated' : 'deactivated'} successfully`,
      package: pkg
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default adminRouter;
