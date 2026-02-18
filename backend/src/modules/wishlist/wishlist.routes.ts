import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth.js';
import { WishlistController } from './wishlist.controller.js';

const router = Router();

// Get all wishlist items
router.get('/', verifyToken, WishlistController.getWishlist);

// Get wishlist count
router.get('/count', verifyToken, WishlistController.getWishlistCount);

// Check if product in wishlist
router.get('/:productId/check', verifyToken, WishlistController.isInWishlist);

// Add to wishlist
router.post('/', verifyToken, WishlistController.addToWishlist);

// Remove from wishlist
router.delete('/:id', verifyToken, WishlistController.removeFromWishlist);

// Clear wishlist
router.delete('/', verifyToken, WishlistController.clearWishlist);

export default router;
