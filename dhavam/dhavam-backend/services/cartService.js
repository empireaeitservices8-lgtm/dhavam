// services/cartService.js
const db = require('./dbClient');
const { publicImageUrl } = require('./productService');

async function query(sql, params = []) {
  const [rows] = await db.execute(sql, params);
  return rows;
}

function httpError(message, status = 400) {
  const e = new Error(message);
  e.status = status;
  return e;
}

/* Add an item. Same product + size is merged into one row. */
exports.addToCart = async ({ userId, productId, size, quantity = 1 }) => {
  const qty = Number.isInteger(Number(quantity)) && Number(quantity) > 0 ? Number(quantity) : 1;

  const [product] = await query('SELECT name, imageUrl FROM Product WHERE id = ?', [productId]);
  if (!product) throw httpError('Product not found', 404);

  const [validSize] = await query(
    'SELECT id FROM ProductSize WHERE productId = ? AND size = ? LIMIT 1',
    [productId, size]
  );
  if (!validSize) throw httpError(`Size "${size}" is not available for this product.`);

  const [existing] = await query(
    'SELECT id, quantity FROM CartItem WHERE userId = ? AND productId = ? AND size = ?',
    [userId, productId, size]
  );

  if (existing) {
    await query('UPDATE CartItem SET quantity = ? WHERE id = ?', [existing.quantity + qty, existing.id]);
    return { updated: true };
  }

  await query(
    `INSERT INTO CartItem (userId, productId, productName, productImage, size, quantity)
     VALUES (?,?,?,?,?,?)`,
    [userId, productId, product.name, product.imageUrl ?? null, size, qty]
  );
  return { updated: false };
};

/* Get cart with prices */
exports.getCart = async (userId) => {
  const items = await query(
    `SELECT ci.id, ci.productId, ci.productName, ci.productImage, ci.size, ci.quantity, ps.price
     FROM CartItem ci
     JOIN ProductSize ps ON ps.productId = ci.productId AND ps.size = ci.size
     WHERE ci.userId = ?
     ORDER BY ci.id`,
    [userId]
  );
return items.map((i) => ({
  ...i,
  _id: String(i.id),
  price: Number(i.price),
  productImage: publicImageUrl(i.productImage),
}));
};

exports.removeFromCart = async (cartItemId, userId) => {
  await query('DELETE FROM CartItem WHERE id = ? AND userId = ?', [cartItemId, userId]);
};

exports.clearCart = async (userId) => {
  await query('DELETE FROM CartItem WHERE userId = ?', [userId]);
};

/* +1 / -1, only on the caller's own item */
exports.updateQuantity = async (cartItemId, userId, delta) => {
  const [item] = await query(
    'SELECT quantity FROM CartItem WHERE id = ? AND userId = ?',
    [cartItemId, userId]
  );
  if (!item) throw httpError('Cart item not found', 404);

  const newQty = Math.max(1, item.quantity + delta);
  await query('UPDATE CartItem SET quantity = ? WHERE id = ? AND userId = ?', [newQty, cartItemId, userId]);

  const [updated] = await query('SELECT * FROM CartItem WHERE id = ?', [cartItemId]);
  return updated;
};