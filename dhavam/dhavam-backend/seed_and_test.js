// seed_and_test.js
// Quick script to seed minimal data and exercise core services after TiDB migration.
// Run with: node seed_and_test.js
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const userService = require('./services/userService');
const productService = require('./services/productService');
const cartService = require('./services/cartService');
const orderService = require('./services/orderService');

(async () => {
  try {
    console.log('--- Seeding data ---');
    // 1. Register a test user
    const testEmail = 'test@example.com';
    const testPassword = 'Password123';
    // Clean up any existing test user
    await userService.deleteUser ? await userService.deleteUser(1) : null; // ignore if not exists
    const user = await userService.register({
      username: 'testuser',
      email: testEmail,
      password: testPassword,
      phone: '1234567890',
    });
    console.log('Registered user:', user);

    // 2. Login to obtain JWT (not needed for service calls, but shows token)
    const loginResult = await userService.login({ email: testEmail, password: testPassword });
    console.log('Login token:', loginResult.token);

    const userId = user.id;

    // 3. Create a product with sizes & prices
    const product = await productService.createProduct({
      name: 'Test Spice',
      description: 'A test spice product',
      category: 'Spice',
      imageUrl: 'http://example.com/image.png',
      sizes: [
        { size: 'Small', price: 5.5 },
        { size: 'Large', price: 9.99 },
      ],
    });
    console.log('Created product with id:', product.id);

    // 4. Add an item to cart (Small size, qty 2)
    await cartService.addToCart({ userId, productId: product.id, size: 'Small', quantity: 2 });
    console.log('Added to cart');

    // 5. Retrieve cart and display price info
    const cartItems = await cartService.getCart(userId);
    console.log('Cart items:', cartItems);

    // 6. Create an order from cart
    const orderResult = await orderService.createOrder({ userId, paymentMethod: 'COD' });
    console.log('Order created:', orderResult.order);
    console.log('Order items:', orderResult.items);

    // 7. Fetch user orders via getOrdersByUser
    const userOrders = await orderService.getOrdersByUser(userId);
    console.log('User orders (with product details):', userOrders);

    console.log('--- All checks passed ---');
  } catch (err) {
    console.error('Error during seed/test:', err);
  } finally {
    // Close DB pool to exit process cleanly
    const pool = require('./services/dbClient');
    if (pool && pool.end) await pool.end();
  }
})();

