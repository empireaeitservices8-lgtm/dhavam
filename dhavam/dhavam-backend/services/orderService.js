// services/orderService.js
const db = require('./dbClient');
const { publicImageUrl } = require('./productService');

const STATUS_LABEL = {
  PENDING: 'Placed',
  CONFIRMED: 'Confirmed',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

function httpError(message, status = 400) {
  const e = new Error(message);
  e.status = status;
  return e;
}

async function run(sql, params = [], conn = db) {
  const [rows] = await conn.execute(sql, params);
  return rows;
}

function toDbStatus(input) {
  const s = String(input || '').trim().toUpperCase();
  if (s === 'PLACED') return 'PENDING';
  return STATUS_LABEL[s] ? s : null;
}

const ORDER_SELECT =
  'SELECT o.*, u.email AS userMail, u.username AS accountName ' +
  'FROM `Order` o JOIN User u ON u.id = o.userId';

/* Attach items and the field names the frontend expects */
async function withItems(orders) {
  if (!orders.length) return [];
  const ids = orders.map((o) => o.id);
  const marks = ids.map(() => '?').join(',');

  const items = await run(
    `SELECT oi.id, oi.orderId, oi.productId, oi.size, oi.price, oi.quantity,
            p.name AS productName, p.imageUrl AS productImage
     FROM OrderItem oi
     LEFT JOIN Product p ON p.id = oi.productId
     WHERE oi.orderId IN (${marks})`,
    ids
  );

  const byOrder = new Map();
  for (const i of items) {
    if (!byOrder.has(i.orderId)) byOrder.set(i.orderId, []);
    byOrder.get(i.orderId).push({
      ...i,
      price: Number(i.price),
      productName: i.productName || 'Removed product',
productImage: publicImageUrl(i.productImage),    });
  }

  return orders.map((o) => ({
    ...o,
    _id: String(o.id),
    totalAmount: Number(o.totalAmount),
    orderStatus: STATUS_LABEL[o.status] || o.status, // "Placed", "Shipped", ...
    username: o.customerName || o.accountName || '',
    phone: o.phone || '',
    address: o.address || '',
    items: byOrder.get(o.id) || [],
  }));
}

/* Create an order. Uses items from the request, or the DB cart if none sent.
   Prices always come from the database, never from the client. */
exports.createOrder = async ({ userId, username, phone, address, paymentMethod, items }) => {
  const method = /online/i.test(paymentMethod || '') ? 'ONLINE' : 'COD';
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    let lines = [];
    let fromCart = false;

    if (Array.isArray(items) && items.length) {
      for (const it of items) {
        const productId = Number(it.productId);
        const quantity = Number(it.quantity ?? 1);
        const size = String(it.size || '').trim();

        if (!Number.isInteger(productId) || !size || !Number.isInteger(quantity) || quantity < 1) {
          throw httpError('Each item needs a valid product, size and quantity.');
        }
        const [ps] = await run(
          'SELECT price FROM ProductSize WHERE productId = ? AND size = ? LIMIT 1',
          [productId, size],
          conn
        );
        if (!ps) throw httpError(`Size "${size}" is not available for product ${productId}.`);
        lines.push({ productId, size, quantity, price: Number(ps.price) });
      }
    } else {
      fromCart = true;
      const cart = await run(
        `SELECT ci.productId, ci.size, ci.quantity, ps.price
         FROM CartItem ci
         JOIN ProductSize ps ON ps.productId = ci.productId AND ps.size = ci.size
         WHERE ci.userId = ?`,
        [userId],
        conn
      );
      lines = cart.map((c) => ({ ...c, price: Number(c.price) }));
    }

    if (!lines.length) throw httpError('Cart is empty.');

    const total = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);

    const res = await run(
      'INSERT INTO `Order` (userId, customerName, phone, address, totalAmount, paymentMethod) VALUES (?,?,?,?,?,?)',
      [userId, username ?? null, phone ?? null, address ?? null, total, method],
      conn
    );
    const orderId = res.insertId;

    for (const l of lines) {
      await run(
        'INSERT INTO OrderItem (orderId, productId, size, price, quantity) VALUES (?,?,?,?,?)',
        [orderId, l.productId, l.size, l.price, l.quantity],
        conn
      );
    }

    // When items came from the request the frontend clears the cart itself
    if (fromCart) await run('DELETE FROM CartItem WHERE userId = ?', [userId], conn);

    await conn.commit();
    return await exports.getOrderById(orderId);
  } catch (err) {
    await conn.rollback().catch(() => {});
    throw err;
  } finally {
    conn.release();
  }
};

exports.getOrderById = async (id) => {
  const rows = await run(`${ORDER_SELECT} WHERE o.id = ?`, [id]);
  if (!rows.length) return null;
  return (await withItems(rows))[0];
};

exports.getOrdersByUser = async (userId) => {
  const rows = await run(`${ORDER_SELECT} WHERE o.userId = ? ORDER BY o.createdAt DESC`, [userId]);
  return withItems(rows);
};
exports.getUserOrders = exports.getOrdersByUser;

exports.listOrders = async () => {
  const rows = await run(`${ORDER_SELECT} ORDER BY o.createdAt DESC`);
  return withItems(rows);
};

exports.updateOrderStatus = async (id, status) => {
  const dbStatus = toDbStatus(status);
  if (!dbStatus) throw httpError('Invalid status.');

  const order = await exports.getOrderById(id);
  if (!order) throw httpError('Order not found.', 404);
  if (order.status === 'CANCELLED' || order.status === 'DELIVERED') {
    throw httpError(`A ${order.orderStatus.toLowerCase()} order cannot be changed.`);
  }

  await run('UPDATE `Order` SET status = ? WHERE id = ?', [dbStatus, id]);
  return exports.getOrderById(id);
};