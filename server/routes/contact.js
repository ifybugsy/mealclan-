import express from 'express';
import { ObjectId } from 'mongodb';
import { getDatabase } from '../config/database.js';
import { handleError } from '../middleware/auth.js';

const router = express.Router();

// Submit contact form
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Name, email, subject, and message are required' });
    }

    const db = await getDatabase();
    const contactCollection = db.collection('contacts');
    const newContact = {
      name,
      email,
      phone: phone || '',
      subject,
      message,
      status: 'unread',
      createdAt: new Date(),
    };

    const result = await contactCollection.insertOne(newContact);
    const createdContact = { _id: result.insertedId, ...newContact };
    res.status(201).json(createdContact);
  } catch (error) {
    handleError(error, req, res);
  }
});

// Get all contacts
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const contactCollection = db.collection('contacts');
    const contacts = await contactCollection.find({}).sort({ createdAt: -1 }).toArray();
    res.json(contacts);
  } catch (error) {
    handleError(error, req, res);
  }
});

// Get single contact
router.get('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid contact ID' });
    }

    const db = await getDatabase();
    const contactCollection = db.collection('contacts');
    const contact = await contactCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json(contact);
  } catch (error) {
    handleError(error, req, res);
  }
});

// Mark contact as read
router.put('/:id/read', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid contact ID' });
    }

    const db = await getDatabase();
    const contactCollection = db.collection('contacts');
    const result = await contactCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: 'read', readAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const updatedContact = await contactCollection.findOne({ _id: new ObjectId(req.params.id) });
    res.json(updatedContact);
  } catch (error) {
    handleError(error, req, res);
  }
});

export default router;
