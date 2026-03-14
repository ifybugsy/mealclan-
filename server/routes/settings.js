import express from 'express';
import { ObjectId } from 'mongodb';
import { getDatabase } from '../config/database.js';
import { authenticate, handleError } from '../middleware/auth.js';

const router = express.Router();

// Get all settings
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const settings = db.collection('settings');

    const allSettings = await settings.find({}).toArray();
    
    // Convert array to object for easier access
    const settingsObj = {};
    allSettings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });

    res.json(settingsObj);
  } catch (error) {
    handleError(error, req, res);
  }
});

// Get specific setting
router.get('/:key', async (req, res) => {
  try {
    const db = await getDatabase();
    const settings = db.collection('settings');

    const setting = await settings.findOne({ key: req.params.key });

    if (!setting) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    res.json({ [setting.key]: setting.value });
  } catch (error) {
    handleError(error, req, res);
  }
});

// Update or create setting (admin only)
router.post('/:key', authenticate, async (req, res) => {
  try {
    const { value } = req.body;

    if (value === undefined) {
      return res.status(400).json({ error: 'Value is required' });
    }

    const db = await getDatabase();
    const settings = db.collection('settings');

    const result = await settings.updateOne(
      { key: req.params.key },
      { 
        $set: { 
          key: req.params.key,
          value,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    const updatedSetting = await settings.findOne({ key: req.params.key });

    // Emit real-time update
    const io = req.app.locals.io;
    if (io) {
      io.to('admin-room').emit('settings:updated', { key: req.params.key, value });
    }

    res.json({ [updatedSetting.key]: updatedSetting.value });
  } catch (error) {
    handleError(error, req, res);
  }
});

// Bulk update settings
router.put('/', async (req, res) => {
  try {
    const settings = req.body;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Settings object is required' });
    }

    const db = await getDatabase();
    const settingsCollection = db.collection('settings');

    // Update all settings
    const updates = Object.entries(settings).map(([key, value]) => ({
      updateOne: {
        filter: { key },
        update: {
          $set: {
            key,
            value,
            updatedAt: new Date(),
          },
        },
        upsert: true,
      },
    }));

    if (updates.length > 0) {
      await settingsCollection.bulkWrite(updates);
    }

    const allSettings = await settingsCollection.find({}).toArray();
    const settingsObj = {};
    allSettings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });

    // Emit real-time update
    const io = req.app.locals.io;
    if (io) {
      io.to('admin-room').emit('settings:bulk-updated', settingsObj);
    }

    res.json(settingsObj);
  } catch (error) {
    handleError(error, req, res);
  }
});

// Get restaurant info
router.get('/restaurant/info', async (req, res) => {
  try {
    const db = await getDatabase();
    const settings = db.collection('settings');

    const restaurantSettings = await settings
      .find({ key: { $in: ['restaurantName', 'restaurantPhone', 'restaurantAddress', 'restaurantEmail'] } })
      .toArray();

    const info = {};
    restaurantSettings.forEach(setting => {
      info[setting.key] = setting.value;
    });

    res.json(info);
  } catch (error) {
    handleError(error, req, res);
  }
});

// Update restaurant info (admin only)
router.put('/restaurant/info', authenticate, async (req, res) => {
  try {
    const { restaurantName, restaurantPhone, restaurantAddress, restaurantEmail } = req.body;

    const db = await getDatabase();
    const settings = db.collection('settings');

    const updates = [];
    
    if (restaurantName !== undefined) {
      updates.push({
        updateOne: {
          filter: { key: 'restaurantName' },
          update: { $set: { key: 'restaurantName', value: restaurantName, updatedAt: new Date() } },
          upsert: true,
        },
      });
    }
    
    if (restaurantPhone !== undefined) {
      updates.push({
        updateOne: {
          filter: { key: 'restaurantPhone' },
          update: { $set: { key: 'restaurantPhone', value: restaurantPhone, updatedAt: new Date() } },
          upsert: true,
        },
      });
    }
    
    if (restaurantAddress !== undefined) {
      updates.push({
        updateOne: {
          filter: { key: 'restaurantAddress' },
          update: { $set: { key: 'restaurantAddress', value: restaurantAddress, updatedAt: new Date() } },
          upsert: true,
        },
      });
    }
    
    if (restaurantEmail !== undefined) {
      updates.push({
        updateOne: {
          filter: { key: 'restaurantEmail' },
          update: { $set: { key: 'restaurantEmail', value: restaurantEmail, updatedAt: new Date() } },
          upsert: true,
        },
      });
    }

    if (updates.length > 0) {
      await settings.bulkWrite(updates);
    }

    const updatedInfo = await settings
      .find({ key: { $in: ['restaurantName', 'restaurantPhone', 'restaurantAddress', 'restaurantEmail'] } })
      .toArray();

    const info = {};
    updatedInfo.forEach(setting => {
      info[setting.key] = setting.value;
    });

    // Emit real-time update
    const io = req.app.locals.io;
    if (io) {
      io.to('admin-room').emit('settings:restaurant-updated', info);
    }

    res.json(info);
  } catch (error) {
    handleError(error, req, res);
  }
});

export default router;
