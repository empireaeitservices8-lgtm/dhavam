const express = require('express')
const userController = require('../controllers/userController')
const productController = require('../controllers/productController')
const cartController = require('../controllers/cartController')
const orderController = require('../controllers/orderController')
const adminMiddleware = require('../middlewares/adminMiddleware')
const jwtMiddleware = require('../middlewares/jwtMiddleware')
const multerMiddleware = require('../middlewares/multerMiddleware')

const router = new express.Router()

// -------unauthorised (public)-------------------------
// register
router.post('/register', userController.registerController)
// login
router.post('/login', userController.loginController)

// get all products
router.get('/products', productController.getAllProductsController)

// view single product (public)
router.get('/product/:id', productController.viewProductController)

// product image (public)
router.get('/products/:id/image', productController.getProductImageController)


// -------------------admin----------------------------------------
// add product
router.post('/product/add', adminMiddleware, multerMiddleware.single('image'), productController.addProductController)

// update product
router.put('/product/:id', adminMiddleware, multerMiddleware.single('image'), productController.updateProductController)

// delete product
router.delete('/product/:id', adminMiddleware, productController.deleteProductController)

// get all users
router.get('/admin/users', adminMiddleware, userController.getAllUsersController)

// delete user
router.delete('/admin/users/:id', adminMiddleware, userController.deleteUserController)

// get all orders
router.get('/admin/orders', adminMiddleware, orderController.getAllOrdersController)

// view order
router.get('/order/:id', adminMiddleware, orderController.viewOrderController)

// update status of order
router.put('/order/status/:id', adminMiddleware, orderController.updateOrderStatusController)


// -------------------------user------------------------------------
// add plant/spice to cart
router.post('/cart/add', jwtMiddleware, cartController.addToCartController)

// get cart items
router.get('/cart', jwtMiddleware, cartController.getCartController)

// increment quantity
router.put('/cart/increment/:cartId', jwtMiddleware, cartController.incrementQuantityController)

// decrement quantity
router.put('/cart/decrement/:cartId', jwtMiddleware, cartController.decrementQuantityController)

// remove cart item
router.delete('/cart/remove/:cartId', jwtMiddleware, cartController.removeCartItemController)

// remove all cart items
router.delete('/cart/remove', jwtMiddleware, cartController.removeAllCartItemsController)

// add order
router.post('/order/add', jwtMiddleware, orderController.addOrderController)

// Get logged-in user's orders
router.get('/myOrders', jwtMiddleware, orderController.getMyOrdersController)

// Cancel own order
router.put('/myOrders/cancel/:id', jwtMiddleware, orderController.cancelMyOrderController)

// View logged-in user's profile
router.get('/profile', jwtMiddleware, userController.getMyProfileController)

// Update logged-in user's profile
router.put('/profile', jwtMiddleware, userController.updateMyProfileController)


const checks = {
  user: [
    'registerController',
    'loginController',
    'getAllUsersController',
    'deleteUserController',
    'getMyProfileController',
    'updateMyProfileController'
  ],
  product: [
    'getAllProductsController',
    'addProductController',
    'updateProductController',
    'viewProductController',
    'deleteProductController'
  ],
  cart: [
    'addToCartController',
    'getCartController',
    'incrementQuantityController',
    'decrementQuantityController',
    'removeCartItemController',
    'removeAllCartItemsController'
  ],
  order: [
    'getAllOrdersController',
    'viewOrderController',
    'updateOrderStatusController',
    'addOrderController',
    'getMyOrdersController',
    'cancelMyOrderController'
  ]
};

const controllers = {
  user: userController,
  product: productController,
  cart: cartController,
  order: orderController
};

for (const [group, names] of Object.entries(checks)) {
  for (const name of names) {
    if (typeof controllers[group][name] !== 'function') {
      console.error(`MISSING CONTROLLER: ${group}.${name}`);
    }
  }
}

module.exports = router
