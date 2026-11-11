// services/productService.js
const db = require('./dbClient');

const API_URL = (
  process.env.PUBLIC_API_URL ||
  process.env.RENDER_EXTERNAL_URL ||
  `http://localhost:${process.env.PORT || 5000}`
).replace(/\/+$/, '');

function httpError(message, status = 400) {
  const e = new Error(message);
  e.status = status;
  return e;
}

// Full URLs stay as they are, "/products/5/image" becomes a full URL,
// and old filename-only values fall back to /uploads
function publicImageUrl(value) {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('/')) return `${API_URL}${value}`;
  return `${API_URL}/uploads/${encodeURIComponent(value)}`;
}
exports.publicImageUrl = publicImageUrl;

async function query(sql, params = []) {
  const [rows] = await db.execute(sql, params);
  return rows;
}

// Never SELECT the image bytes in normal queries
const PRODUCT_COLUMNS = 'id, name, description, category, imageUrl';

function formatProduct(p, sizes) {
  const url = publicImageUrl(p.imageUrl);
  return {
    ...p,
    _id: String(p.id),
    group: String(p.category || '').toLowerCase(),
    imageUrl: url,
    image: url,
    sizes: sizes.map((s) => ({ id: s.id, size: s.size, price: Number(s.price) })),
  };
}

/** Create a product. imageBuffer/imageType come from the uploaded file. */
exports.createProduct = async ({ name, description, category, imageBuffer, imageType, sizes = [] }) => {
  const result = await query(
    'INSERT INTO Product (name, description, category, imageData, imageType) VALUES (?,?,?,?,?)',
    [name, description ?? null, category, imageBuffer ?? null, imageType ?? null]
  );
  const productId = result.insertId;

  if (imageBuffer) {
    await query('UPDATE Product SET imageUrl = ? WHERE id = ?', [
      `/products/${productId}/image`,
      productId,
    ]);
  }

  for (const s of sizes) {
    await query('INSERT INTO ProductSize (productId, size, price) VALUES (?,?,?)', [
      productId,
      s.size,
      s.price,
    ]);
  }

  return await exports.getProductById(productId);
};

exports.getProductById = async (id) => {
  const [product] = await query(`SELECT ${PRODUCT_COLUMNS} FROM Product WHERE id = ?`, [id]);
  if (!product) return null;
  const sizes = await query('SELECT id, size, price FROM ProductSize WHERE productId = ?', [id]);
  return formatProduct(product, sizes);
};

exports.listProducts = async () => {
  const products = await query(`SELECT ${PRODUCT_COLUMNS} FROM Product ORDER BY id DESC`);
  const result = [];
  for (const p of products) {
    const sizes = await query('SELECT id, size, price FROM ProductSize WHERE productId = ?', [p.id]);
    result.push(formatProduct(p, sizes));
  }
  return result;
};

/** Raw image bytes for the image route */
exports.getProductImage = async (id) => {
  const [row] = await query('SELECT imageData, imageType FROM Product WHERE id = ?', [id]);
  if (!row || !row.imageData) return null;
  return { data: row.imageData, type: row.imageType || 'image/jpeg' };
};

exports.updateProduct = async (id, data) => {
  const { name, description, category, imageBuffer, imageType, sizes } = data;
  const set = [];
  const params = [];

  if (name !== undefined) { set.push('name = ?'); params.push(name); }
  if (description !== undefined) { set.push('description = ?'); params.push(description); }
  if (category !== undefined) { set.push('category = ?'); params.push(category); }
  if (imageBuffer) {
    set.push('imageData = ?', 'imageType = ?', 'imageUrl = ?');
    params.push(imageBuffer, imageType || 'image/jpeg', `/products/${id}/image`);
  }

  if (set.length > 0) {
    await query(`UPDATE Product SET ${set.join(', ')} WHERE id = ?`, [...params, id]);
  }

  if (Array.isArray(sizes)) {
    const clean = sizes.map((s) => {
      if (!s || !s.size || s.price === undefined || s.price === null || s.price === '') {
        throw httpError('Each size must have a size name and price.');
      }
      const price = Number(s.price);
      if (!Number.isFinite(price) || price < 0) {
        throw httpError(`Invalid price for size ${s.size}.`);
      }
      return { size: String(s.size).trim(), price };
    });

    await query('DELETE FROM ProductSize WHERE productId = ?', [id]);
    for (const s of clean) {
      await query('INSERT INTO ProductSize (productId, size, price) VALUES (?,?,?)', [id, s.size, s.price]);
    }
  }

  return await exports.getProductById(id);
};

exports.deleteProduct = async (id) => {
  const used = await query('SELECT id FROM OrderItem WHERE productId = ? LIMIT 1', [id]);
  if (used.length) throw httpError('Product has past orders and cannot be deleted.');

  await query('DELETE FROM CartItem WHERE productId = ?', [id]);
  await query('DELETE FROM ProductSize WHERE productId = ?', [id]);
  await query('DELETE FROM Product WHERE id = ?', [id]);
};