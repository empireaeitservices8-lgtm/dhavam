// controllers/cartController.js
// All routes expect a numeric user ID set by jwtMiddleware (req.payload).

const cartService = require('../services/cartService');

const fail = (res, error, label) => {
  console.error(label, error);
  return res.status(error.status || 500).json({ message: error.message });
};

/** Add product to cart (same product + size is merged) */
exports.addToCartController = async (req, res) => {
  try {
    const { productId, size, quantity } = req.body;
    if (!productId || !size) {
      return res.status(400).json({ message: 'productId and size are required.' });
    }

    const result = await cartService.addToCart({
      userId: Number(req.payload),
      productId: Number(productId),
      size,
      quantity: quantity ?? 1,
    });

    return res
      .status(result.updated ? 200 : 201)
      .json({ message: result.updated ? 'Cart quantity updated' : 'Item added to cart' });
  } catch (error) {
    return fail(res, error, 'Add to cart error:');
  }
};

/** Get cart items for the logged-in user */
exports.getCartController = async (req, res) => {
  try {
    const items = await cartService.getCart(Number(req.payload));
    return res.status(200).json(items);
  } catch (error) {
    return fail(res, error, 'Get cart error:');
  }
};

/** Increment quantity */
exports.incrementQuantityController = async (req, res) => {
  try {
    const updated = await cartService.updateQuantity(
      Number(req.params.cartId),
      Number(req.payload),
      +1
    );
    return res.status(200).json(updated);
  } catch (error) {
    return fail(res, error, 'Increment quantity error:');
  }
};

/** Decrement quantity */
exports.decrementQuantityController = async (req, res) => {
  try {
    const updated = await cartService.updateQuantity(
      Number(req.params.cartId),
      Number(req.payload),
      -1
    );
    return res.status(200).json(updated);
  } catch (error) {
    return fail(res, error, 'Decrement quantity error:');
  }
};

/** Remove one cart item */
exports.removeCartItemController = async (req, res) => {
  try {
    await cartService.removeFromCart(Number(req.params.cartId), Number(req.payload));
    return res.status(200).json({ message: 'Cart item removed.' });
  } catch (error) {
    return fail(res, error, 'Remove cart item error:');
  }
};

/** Remove all cart items for the logged-in user */
exports.removeAllCartItemsController = async (req, res) => {
  try {
    await cartService.clearCart(Number(req.payload));
    return res.status(200).json({ message: 'All cart items removed.' });
  } catch (error) {
    return fail(res, error, 'Remove all cart items error:');
  }
};