import express from 'express';
import { ObjectId } from 'mongodb';
import { getDatabase } from '../config/database.js';
import { authenticate, handleError } from '../middleware/auth.js';

const router = express.Router();

// Generate unique order number
async function generateOrderNumber() {
  const db = await getDatabase();
  const orders = db.collection('orders');

  const lastOrder = await orders
    .find({})
    .sort({ createdAt: -1 })
    .limit(1)
    .toArray();

  let nextNumber = 1001;
  if (lastOrder.length > 0) {
    const lastNumber = parseInt(lastOrder[0].orderNumber.replace('MC', ''));
    nextNumber = lastNumber + 1;
  }

  return `MC${nextNumber}`;
}

// Create new order (customer)
router.post('/', async (req, res) => {
  try {
    const { customerName, customerPhone, items, totalPrice, paymentStatus, specialInstructions } = req.body;

    // Validation
    if (!customerName || !customerPhone || !items || items.length === 0 || !totalPrice) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (typeof totalPrice !== 'number' || totalPrice < 0) {
      return res.status(400).json({ error: 'Invalid total price' });
    }

    const db = await getDatabase();
    const orders = db.collection('orders');

    const orderNumber = await generateOrderNumber();

    const newOrder = {
      orderNumber,
      customerName,
      customerPhone,
      items: items.map(item => ({
        id: item.id || item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      })),
      totalPrice,
      status: 'pending',
      paymentStatus: paymentStatus || 'pending',
      specialInstructions: specialInstructions || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await orders.insertOne(newOrder);
    const createdOrder = { ...newOrder, _id: result.insertedId };

    // Emit real-time event for new order
    const io = req.app.locals.io;
    if (io) {
      io.to('admin-room').emit('newOrder', createdOrder);
      io.emit('dashboardStatsUpdate', { /* stats will be calculated separately */ });
      console.log('[v0] Emitted newOrder event');
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    handleError(error, req, res);
  }
});

// Get all orders
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const orders = db.collection('orders');

    const status = req.query.status;
    const query = status ? { status } : {};

    const allOrders = await orders
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    res.json(allOrders);
  } catch (error) {
    handleError(error, req, res);
  }
});

// Get single order
router.get('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    const db = await getDatabase();
    const orders = db.collection('orders');

    const order = await orders.findOne({ _id: new ObjectId(req.params.id) });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    handleError(error, req, res);
  }
});

// Update order (generic PATCH)
router.patch('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    const { status } = req.body;
    
    if (status) {
      const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      }
    }

    const db = await getDatabase();
    const orders = db.collection('orders');

    const updateData = {};
    if (status) updateData.status = status;
    updateData.updatedAt = new Date();

    const result = await orders.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updatedOrder = await orders.findOne({ _id: new ObjectId(req.params.id) });

    // Emit real-time update via Socket.io
    const io = req.app.locals.io;
    if (io) {
      io.to(`order-${req.params.id}`).emit('orderStatusUpdate', { orderId: req.params.id, status: updateData.status, updatedAt: updateData.updatedAt });
      io.to('admin-room').emit('orderStatusUpdate', { orderId: req.params.id, status: updateData.status, updatedAt: updateData.updatedAt });
      io.emit('dashboardStatsUpdate', { /* stats will be calculated separately */ });
      console.log('[v0] Emitted orderStatusUpdate via generic PATCH');
    }

    res.json(updatedOrder);
  } catch (error) {
    handleError(error, req, res);
  }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const db = await getDatabase();
    const orders = db.collection('orders');

    const result = await orders.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updatedOrder = await orders.findOne({ _id: new ObjectId(req.params.id) });

    // Emit real-time update via Socket.io
    const io = req.app.locals.io;
    if (io) {
      io.to(`order-${req.params.id}`).emit('order:status-updated', updatedOrder);
      io.to('admin-room').emit('order:status-updated', updatedOrder);
    }

    res.json(updatedOrder);
  } catch (error) {
    handleError(error, req, res);
  }
});

// Update order payment status (admin only)
router.patch('/:id/payment', authenticate, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    const { paymentStatus } = req.body;
    const validPaymentStatuses = ['pending', 'completed', 'failed', 'cancelled'];

    if (!paymentStatus || !validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({ 
        error: `Invalid payment status. Must be one of: ${validPaymentStatuses.join(', ')}` 
      });
    }

    const db = await getDatabase();
    const orders = db.collection('orders');

    const result = await orders.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { paymentStatus, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updatedOrder = await orders.findOne({ _id: new ObjectId(req.params.id) });

    // Emit real-time update
    const io = req.app.locals.io;
    if (io) {
      io.to(`order-${req.params.id}`).emit('order:payment-updated', updatedOrder);
      io.to('admin-room').emit('order:payment-updated', updatedOrder);
    }

    res.json(updatedOrder);
  } catch (error) {
    handleError(error, req, res);
  }
});

// Get order statistics (admin only)
router.get('/stats/dashboard', authenticate, async (req, res) => {
  try {
    const db = await getDatabase();
    const orders = db.collection('orders');

    const totalOrders = await orders.countDocuments();
    const pendingOrders = await orders.countDocuments({ status: 'pending' });
    const completedOrders = await orders.countDocuments({ status: 'completed' });

    const revenueResult = await orders
      .aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } },
      ])
      .toArray();

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    res.json({
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
    });
  } catch (error) {
    handleError(error, req, res);
  }
});

// Delete order (admin only)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    const db = await getDatabase();
    const orders = db.collection('orders');

    const result = await orders.deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Emit deletion event
    const io = req.app.locals.io;
    if (io) {
      io.to('admin-room').emit('order:deleted', { orderId: req.params.id });
    }

    res.json({ success: true, message: 'Order deleted' });
  } catch (error) {
    handleError(error, req, res);
  }
});

export default router;
