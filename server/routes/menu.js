import express from 'express';
import { ObjectId } from 'mongodb';
import { getDatabase } from '../config/database.js';
import { authenticate, handleError } from '../middleware/auth.js';

const router = express.Router();

// Get all menu items
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const items = db.collection('menu_items');

    const category = req.query.category;
    const query = category ? { category } : {};

    const menuItems = await items.find(query).sort({ createdAt: -1 }).toArray();

    res.json(menuItems);
  } catch (error) {
    handleError(error, req, res);
  }
});

// Get single menu item
router.get('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid menu item ID' });
    }

    const db = await getDatabase();
    const items = db.collection('menu_items');

    const item = await items.findOne({ _id: new ObjectId(req.params.id) });

    if (!item) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json(item);
  } catch (error) {
    handleError(error, req, res);
  }
});

// Create menu item (admin only)
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description, price, category, image, available } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Name, price, and category are required' });
    }

    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({ error: 'Price must be a positive number' });
    }

    const db = await getDatabase();
    const items = db.collection('menu_items');

    const newItem = {
      name,
      description: description || '',
      price,
      category,
      image: image || null,
      available: available !== false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await items.insertOne(newItem);
    const createdItem = { ...newItem, _id: result.insertedId };

    const io = req.app.locals.io;
    if (io) {
      io.emit('menuAdd', createdItem);
    }

    res.status(201).json(createdItem);
  } catch (error) {
    handleError(error, req, res);
  }
});

// Update menu item (admin only)
router.patch('/:id', authenticate, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid menu item ID' });
    }

    const { name, description, price, category, image, available } = req.body;

    if (price !== undefined && (typeof price !== 'number' || price < 0)) {
      return res.status(400).json({ error: 'Price must be a positive number' });
    }

    const db = await getDatabase();
    const items = db.collection('menu_items');

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (category !== undefined) updateData.category = category;
    if (image !== undefined) updateData.image = image;
    if (available !== undefined) updateData.available = available;
    updateData.updatedAt = new Date();

    const result = await items.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    const updatedItem = await items.findOne({ _id: new ObjectId(req.params.id) });

    const io = req.app.locals.io;
    if (io) {
      io.emit('menuUpdate', { itemId: req.params.id, changes: updateData });
    }

    res.json(updatedItem);
  } catch (error) {
    handleError(error, req, res);
  }
});

// Update menu item (admin only)
router.put('/:id', authenticate, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid menu item ID' });
    }

    const { name, description, price, category, image, available } = req.body;

    if (price !== undefined && (typeof price !== 'number' || price < 0)) {
      return res.status(400).json({ error: 'Price must be a positive number' });
    }

    const db = await getDatabase();
    const items = db.collection('menu_items');

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (category !== undefined) updateData.category = category;
    if (image !== undefined) updateData.image = image;
    if (available !== undefined) updateData.available = available;
    updateData.updatedAt = new Date();

    const result = await items.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    const updatedItem = await items.findOne({ _id: new ObjectId(req.params.id) });

    const io = req.app.locals.io;
    if (io) {
      io.emit('menuUpdate', { itemId: req.params.id, changes: updateData });
    }

    res.json(updatedItem);
  } catch (error) {
    handleError(error, req, res);
  }
});

// ✅ FIXED DELETE ROUTE
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const id = req.params.id.trim();

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid menu item ID format' });
    }

    const db = await getDatabase();
    const items = db.collection('menu_items');

    const result = await items.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    const io = req.app.locals.io;
    if (io) {
      io.emit('menuDelete', { itemId: id });
    }

    res.json({ success: true });
  } catch (error) {
    handleError(error, req, res);
  }
});

// Get menu statistics
router.get('/stats/summary', authenticate, async (req, res) => {
  try {
    const db = await getDatabase();
    const items = db.collection('menu_items');

    const totalItems = await items.countDocuments();
    const availableItems = await items.countDocuments({ available: true });
    const categories = await items.distinct('category');

    res.json({
      totalItems,
      availableItems,
      categories: categories.filter(c => c),
    });
  } catch (error) {
    handleError(error, req, res);
  }
});

export default router;