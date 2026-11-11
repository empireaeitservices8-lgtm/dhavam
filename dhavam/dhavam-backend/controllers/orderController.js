// controllers/orderController.js
const orderService = require('../services/orderService');

const fail = (res, error, label) => {
  console.error(label, error);
  return res.status(error.status || 500).json({ message: error.message });
};

/** Create a new order (checkout) */
exports.addOrderController = async (req, res) => {
  try {
    const { username, phone, address, paymentMethod, items } = req.body;

    if (!username?.trim() || !address?.trim()) {
      return res.status(400).json({ message: 'Name and address are required.' });
    }
    if (!/^\d{10}$/.test(String(phone ?? '').trim())) {
      return res.status(400).json({ message: 'Enter a valid 10-digit phone number.' });
    }

    const order = await orderService.createOrder({
      userId: Number(req.payload),
      username: username.trim(),
      phone: String(phone).trim(),
      address: address.trim(),
      paymentMethod,
      items,
    });
    return res.status(201).json(order);
  } catch (error) {
    return fail(res, error, 'Create order error:');
  }
};

/** Admin: list all orders */
exports.getAllOrdersController = async (req, res) => {
  try {
    return res.status(200).json(await orderService.listOrders());
  } catch (error) {
    return fail(res, error, 'List orders error:');
  }
};

/** Admin: view single order */
exports.viewOrderController = async (req, res) => {
  try {
    const order = await orderService.getOrderById(Number(req.params.id));
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    return res.status(200).json(order);
  } catch (error) {
    return fail(res, error, 'View order error:');
  }
};

/** Admin: update order status */
exports.updateOrderStatusController = async (req, res) => {
  try {
    const updated = await orderService.updateOrderStatus(
      Number(req.params.id),
      req.body.status
    );
    return res.status(200).json(updated);
  } catch (error) {
    return fail(res, error, 'Update order status error:');
  }
};

/** Customer: own orders */
exports.getMyOrdersController = async (req, res) => {
  try {
    return res.status(200).json(await orderService.getUserOrders(Number(req.payload)));
  } catch (error) {
    return fail(res, error, 'Get my orders error:');
  }
};

/** Customer: cancel own order (only while PENDING) */
exports.cancelMyOrderController = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const order = await orderService.getOrderById(id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    if (order.userId !== req.payload) {
      return res.status(403).json({ message: 'Not authorized.' });
    }
    if (order.status !== 'PENDING') {
      return res.status(400).json({ message: 'Only placed orders can be cancelled.' });
    }
    const cancelled = await orderService.updateOrderStatus(id, 'CANCELLED');
    return res.status(200).json({ order: cancelled });
  } catch (error) {
    return fail(res, error, 'Cancel order error:');
  }
};