const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userService = require('../services/userService');

// Register user
exports.registerController = async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;
    const result = await userService.register({ username, email, password, phone });
    return res.status(201).json(result);
  } catch (error) {
    console.error('Register error:', error);
return res.status(error.status || 500).json({ message: error.message });  }
};

// User login
exports.loginController = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const result = await userService.login({ email, username, password });
    return res.status(200).json(result);
  } catch (error) {
    console.error('Login error:', error);
    return res.status(error.status || 500).json({ message: error.message });
  }
};

// Get all users (admin)
exports.getAllUsersController = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error('Get all users error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a customer (admin)
exports.deleteUserController = async (req, res) => {
  try {
    const { id } = req.params;
    await userService.deleteUser(id);
    return res.status(200).json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

// Get logged‑in user's profile
exports.getMyProfileController = async (req, res) => {
  try {
const email = req.email;
    const user = await userService.getProfile(email);
    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

// Update profile (and optionally password)
exports.updateMyProfileController = async (req, res) => {
  try {
const email = req.email; 
    const result = await userService.updateProfile(email, req.body);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(error.status || 500).json({ success: false, message: error.message });
  }
};
