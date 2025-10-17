const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

// Get all projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('userId', 'name email')
      .populate('supervisorId', 'name email')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get projects by user
router.get('/user/:userId', async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.params.userId })
      .populate('userId', 'name email')
      .populate('supervisorId', 'name email')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get project by ID
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('userId', 'name email department')
      .populate('supervisorId', 'name email department');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new project
router.post('/', async (req, res) => {
  try {
    const { name, description, userId, budget, status, supervisorId } = req.body;

    const project = new Project({
      name,
      description,
      userId,
      supervisorId,
      budget,
      status: status || 'active'
    });

    await project.save();
    await project.populate('userId', 'name email');
    await project.populate('supervisorId', 'name email');

    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update project
router.put('/:id', async (req, res) => {
  try {
    const { name, description, budget, status, supervisorId } = req.body;

    const updateData = { name, description, budget, status };

    // Handle supervisorId - allow null/undefined to clear it
    if (supervisorId !== undefined) {
      updateData.supervisorId = supervisorId || null;
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('userId', 'name email')
      .populate('supervisorId', 'name email');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete project
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
