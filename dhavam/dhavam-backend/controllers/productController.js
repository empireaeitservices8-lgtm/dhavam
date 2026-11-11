// controllers/productController.js
const productService = require('../services/productService');
const fs = require('fs/promises');
const path = require('path');

// Helper: parse sizes sent from FormData (expects JSON string or array)
function parseSizes(sizes) {
  if (Array.isArray(sizes)) {
    return sizes;
  }
  if (typeof sizes === 'string') {
    try {
      const parsed = JSON.parse(sizes);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // fallback: comma‑separated "size,price" pairs – split by commas and trim
      return sizes
        .split(',')
        .map(part => part.trim())
        .filter(Boolean);
    }
  }
  return [];
}

// ---------------------------------------------------------------------------
// Add product (admin)
// ---------------------------------------------------------------------------
exports.addProductController = async (req, res) => {
  try {
    const { name, description, group, sizes } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Product image file is required (field name: "image").' });
    }
    if (!name || !description) {
      return res.status(400).json({ message: 'Name and description are required.' });
    }

    const category = (group || 'WHOLE').toUpperCase();
    if (!['WHOLE', 'GROUND', 'COMBO'].includes(category)) {
      return res.status(400).json({ message: 'Invalid category. Use WHOLE, GROUND or COMBO.' });
    }

    const parsedSizes = parseSizes(sizes);
    if (!parsedSizes.length) {
      return res.status(400).json({ message: 'At least one size with a price is required.' });
    }
    for (const s of parsedSizes) {
      const price = Number(s && s.price);
      if (!s || typeof s !== 'object' || !s.size || !Number.isFinite(price) || price < 0) {
        return res.status(400).json({ message: 'Each size must look like {"size":"100g","price":50}.' });
      }
    }

    const product = await productService.createProduct({
      name: name.trim(),
      description: description.trim(),
      category,
      imageBuffer: req.file.buffer,
      imageType: req.file.mimetype,
      sizes: parsedSizes.map((s) => ({ size: String(s.size).trim(), price: Number(s.price) })),
    });

    return res.status(201).json(product);
  } catch (error) {
    console.error('Add product error:', error);
    return res.status(error.status || 500).json({ message: error.message || 'Unable to add product.' });
  }
};

// ---------------------------------------------------------------------------
// Get all products (public)
// ---------------------------------------------------------------------------
exports.getAllProductsController = async (req, res) => {
  try {
    const allProducts = await productService.listProducts();
    return res.status(200).json(allProducts);
  } catch (error) {
    console.error('Get products error:', error);
    return res.status(500).json({ message: 'Unable to fetch products.' });
  }
};

// ---------------------------------------------------------------------------
// View one product (public)
// ---------------------------------------------------------------------------
exports.viewProductController = async (req, res) => {
  try {
    const productDetails = await productService.getProductById(
      Number(req.params.id)
    );
    if (!productDetails) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    return res.status(200).json(productDetails);
  } catch (error) {
    console.error('View product error:', error);
    return res.status(500).json({ message: 'Unable to fetch product.' });
  }
};

// ---------------------------------------------------------------------------
// Update product (admin)
// ---------------------------------------------------------------------------
exports.updateProductController = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ message: 'Invalid product ID.' });

    const payload = {};
    if (req.body.name !== undefined) payload.name = req.body.name.trim();
    if (req.body.description !== undefined) payload.description = req.body.description.trim();
    if (req.body.group !== undefined && req.body.group) {
      payload.category = req.body.group.toUpperCase();
    }
    if (req.file) {
      payload.imageBuffer = req.file.buffer;
      payload.imageType = req.file.mimetype;
    }
    if (req.body.sizes !== undefined) payload.sizes = parseSizes(req.body.sizes);

    const product = await productService.updateProduct(id, payload);
    return res.status(200).json({ message: 'Product updated successfully.', product });
  } catch (error) {
    console.error('Update product error:', error);
    return res.status(error.status || 500).json({ message: error.message || 'Unable to update product.' });
  }
};

exports.deleteProductController = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ message: 'Invalid product ID.' });

    const product = await productService.getProductById(id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });

    await productService.deleteProduct(id); // the image is deleted with the row
    return res.status(200).json({ message: 'Product deleted successfully.', productId: id });
  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(error.status || 500).json({ message: error.message || 'Unable to delete product.' });
  }
};

exports.getProductImageController = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).end();

    const image = await productService.getProductImage(id);
    if (!image) return res.status(404).end();

    res.set({
      'Content-Type': image.type,
      'Cache-Control': 'public, max-age=60',
      'Cross-Origin-Resource-Policy': 'cross-origin',
    });
    return res.send(image.data);
  } catch (error) {
    console.error('Get product image error:', error);
    return res.status(500).end();
  }
};