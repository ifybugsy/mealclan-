import express from 'express';
import { ObjectId } from 'mongodb';
import { getDatabase } from '../config/database.js';
import { authenticate, handleError } from '../middleware/auth.js';

const router = express.Router();

// Get all gallery items
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const galleryCollection = db.collection('gallery');
    const items = await galleryCollection.find({}).sort({ createdAt: -1 }).toArray();
    res.json(items);
  } catch (error) {
    handleError(error, req, res);
  }
});

// Get single gallery item
router.get('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid gallery item ID' });
    }

    const db = await getDatabase();
    const galleryCollection = db.collection('gallery');
    const item = await galleryCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!item) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }
    res.json(item);
  } catch (error) {
    handleError(error, req, res);
  }
});

// Create gallery item (admin only)
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, description, mediaUrl, mediaType, eventDate } = req.body;

    if (!title || !mediaUrl || !mediaType) {
      return res.status(400).json({ error: 'Title, mediaUrl, and mediaType are required' });
    }

    const db = await getDatabase();
    const galleryCollection = db.collection('gallery');
    const newItem = {
      title,
      description: description || '',
      mediaUrl,
      mediaType, // 'image' or 'video'
      eventDate: eventDate || new Date().toISOString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await galleryCollection.insertOne(newItem);
    const createdItem = { _id: result.insertedId, ...newItem };
    
    res.status(201).json(createdItem);
  } catch (error) {
    handleError(error, req, res);
  }
});

// Update gallery item (admin only)
router.put('/:id', authenticate, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid gallery item ID' });
    }

    const { title, description, mediaUrl, mediaType, eventDate } = req.body;
    const db = await getDatabase();
    const galleryCollection = db.collection('gallery');

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (mediaUrl !== undefined) updateData.mediaUrl = mediaUrl;
    if (mediaType !== undefined) updateData.mediaType = mediaType;
    if (eventDate !== undefined) updateData.eventDate = eventDate;
    updateData.updatedAt = new Date();

    const result = await galleryCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }

    const updatedItem = await galleryCollection.findOne({ _id: new ObjectId(req.params.id) });
    res.json(updatedItem);
  } catch (error) {
    handleError(error, req, res);
  }
});

// Delete gallery item (admin only)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid gallery item ID' });
    }

    const db = await getDatabase();
    const galleryCollection = db.collection('gallery');
    const result = await galleryCollection.deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }

    res.json({ success: true, message: 'Gallery item deleted successfully' });
  } catch (error) {
    handleError(error, req, res);
  }
});

export default router;
