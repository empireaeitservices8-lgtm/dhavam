// services/userService.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./dbClient');

/* Helper – returns rows (or empty array) */
async function query(sql, params = []) {
  const [rows] = await db.execute(sql, params);
  return rows;
}
function httpErr(message, status) {
  const e = new Error(message);
  e.status = status;
  return e;
}
/* Register a new user */
/* Register */
exports.register = async ({ username, email, password, phone }) => {
  if (!email?.trim() || !password) throw httpErr('Email and password are required', 400);
  const normalizedEmail = email.trim().toLowerCase();

  const exists = await query('SELECT id FROM User WHERE email = ?', [normalizedEmail]);
  if (exists.length) throw httpErr('User already exists', 409);

  const hashed = await bcrypt.hash(password, 10);

  const result = await query(
    `INSERT INTO User (username, email, password, phone, role) VALUES (?,?,?,?, 'user')`,
    [username?.trim() ?? null, normalizedEmail, hashed, phone?.trim() ?? null]
  );

  const [user] = await query(
    'SELECT id, email, username, phone, role FROM User WHERE id = ?',
    [result.insertId]
  );

  const token = jwt.sign(
    { email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  return { user, token };
};

/* Login: accepts email or username */
exports.login = async ({ email, username, password }) => {
  const identifier = (email || username || '').trim();
  if (!identifier || !password) {
    const err = new Error('Username or email and password are required');
    err.status = 400;
    throw err;
  }

  const [user] = await query(
    'SELECT * FROM User WHERE LOWER(email) = LOWER(?) OR LOWER(username) = LOWER(?) LIMIT 1',
    [identifier, identifier]
  );

  if (!user) {
    const err = new Error('Invalid username or email');
    err.status = 401;
    throw err;
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    const err = new Error('Incorrect password');
    err.status = 401;
    throw err;
  }

  const token = jwt.sign(
    { email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
  const { password: _, ...userInfo } = user;
  return { user: userInfo, token };
};

/* Get all non‑admin users */
exports.getAllUsers = async () => {
  return await query("SELECT id, email, username, phone, role FROM User WHERE role = 'user'");
};

/* Delete a user (admin only) */
exports.deleteUser = async (id) => {
  const userId = Number(id);
  const [row] = await query('SELECT role FROM User WHERE id = ?', [userId]);
  if (!row) throw httpErr('User not found', 404);
  if (row.role === 'admin') throw httpErr('Cannot delete admin account', 403);

  const orders = await query('SELECT id FROM `Order` WHERE userId = ? LIMIT 1', [userId]);
  if (orders.length) {
    throw httpErr('This customer has order history and cannot be deleted.', 409);
  }

  await query('DELETE FROM CartItem WHERE userId = ?', [userId]);
  await query('DELETE FROM User WHERE id = ?', [userId]);
};


/* Get profile of logged‑in user */
exports.getProfile = async (email) => {
  const [user] = await query(
    'SELECT id, email, username, phone, role FROM User WHERE email = ?',
    [email.trim().toLowerCase()]
  );
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return user;
};

/* Update profile (email, name, phone, optional password) and return a fresh token */
exports.updateProfile = async (email, updates) => {
  const { username, phone, email: newEmailRaw, currentPassword, newPassword } = updates;
  const oldEmail = email.trim().toLowerCase();

  const [user] = await query('SELECT * FROM User WHERE email = ?', [oldEmail]);
  if (!user) throw httpErr('User not found', 404);

  const set = [];
  const params = [];
  let finalEmail = oldEmail;

  if (username) { set.push('username = ?'); params.push(username.trim()); }
  if (phone) { set.push('phone = ?'); params.push(phone.trim()); }

  const newEmail = newEmailRaw?.trim().toLowerCase();
  if (newEmail && newEmail !== oldEmail) {
    const taken = await query('SELECT id FROM User WHERE email = ?', [newEmail]);
    if (taken.length) throw httpErr('That email is already in use', 409);
    set.push('email = ?');
    params.push(newEmail);
    finalEmail = newEmail;
  }

  if (newPassword) {
    if (!currentPassword) throw httpErr('Current password required to set a new password', 400);
    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) throw httpErr('Current password is incorrect', 400);
    set.push('password = ?');
    params.push(await bcrypt.hash(newPassword, 10));
  }

  if (set.length) {
    await query(`UPDATE User SET ${set.join(', ')} WHERE email = ?`, [...params, oldEmail]);
  }

  const [updated] = await query(
    'SELECT id, email, username, phone, role FROM User WHERE email = ?',
    [finalEmail]
  );

  // The token holds the email, so issue a new one in case it changed
  const token = jwt.sign(
    { email: updated.email, role: updated.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
  return { user: updated, token };
};