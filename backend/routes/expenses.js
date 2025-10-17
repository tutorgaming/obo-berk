const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Expense = require('../models/Expense');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg, .jpeg and .pdf format allowed!'));
    }
  }
});

// Get expenses by project
router.get('/project/:projectId', async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { projectId: req.params.projectId };

    if (type) {
      filter.type = type;
    }

    const expenses = await Expense.find(filter)
      .sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get expense by ID
router.get('/:id', async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('projectId', 'name');

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new expense with file upload
router.post('/', upload.single('receipt'), async (req, res) => {
  try {
    const { name, shop_name, detail, projectId, type, amount, date, notes } = req.body;

    const expenseData = {
      name,
      shop_name,
      detail,
      projectId,
      type,
      amount: parseFloat(amount),
      date: date || new Date(),
      notes
    };

    // Add receipt file information if uploaded
    if (req.file) {
      expenseData.receiptFile = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size
      };
    }

    const expense = new Expense(expenseData);
    await expense.save();

    res.status(201).json(expense);
  } catch (error) {
    // Delete uploaded file if expense creation fails
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    res.status(400).json({ error: error.message });
  }
});

// Update expense
router.put('/:id', upload.single('receipt'), async (req, res) => {
  try {
    const { name, shop_name, detail, type, amount, date, notes } = req.body;

    const updateData = {
      name,
      shop_name,
      detail,
      type,
      amount: parseFloat(amount),
      date,
      notes
    };

    // If new file is uploaded, add it to update data
    if (req.file) {
      // Get old expense to delete old receipt file
      const oldExpense = await Expense.findById(req.params.id);
      if (oldExpense && oldExpense.receiptFile && oldExpense.receiptFile.path) {
        fs.unlink(oldExpense.receiptFile.path, (err) => {
          if (err) console.error('Error deleting old file:', err);
        });
      }

      updateData.receiptFile = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size
      };
    }

    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(expense);
  } catch (error) {
    // Delete uploaded file if update fails
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    res.status(400).json({ error: error.message });
  }
});

// Delete expense
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Delete receipt file if exists
    if (expense.receiptFile && expense.receiptFile.path) {
      fs.unlink(expense.receiptFile.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }

    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
