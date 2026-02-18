import { Request, Response } from 'express';
import { prisma } from '../../database/prisma.js';

export class WishlistController {
  /**
   * Get user's wishlist
   */
  static async getWishlist(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const wishlist = await prisma.wishlist.findMany({
        where: { userId },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
              category: {
                select: { name: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const formatted = wishlist.map((item) => ({
        id: item.id,
        productId: item.product.id,
        productName: item.product.name,
        price: item.product.price,
        image: item.product.images[0] || '/placeholder.jpg',
        category: item.product.category?.name || 'Sin categoría',
        addedAt: item.createdAt,
      }));

      res.json(formatted);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Error fetching wishlist',
      });
    }
  }

  /**
   * Add product to wishlist
   */
  static async addToWishlist(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { productId } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!productId) {
        return res.status(400).json({ error: 'Product ID required' });
      }

      // Check if already in wishlist
      const existing = await prisma.wishlist.findUnique({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      });

      if (existing) {
        return res.status(400).json({ error: 'Product already in wishlist' });
      }

      // Verify product exists
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Add to wishlist
      const wishlistItem = await prisma.wishlist.create({
        data: {
          userId,
          productId,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
              category: {
                select: { name: true },
              },
            },
          },
        },
      });

      res.status(201).json({
        id: wishlistItem.id,
        productId: wishlistItem.product.id,
        productName: wishlistItem.product.name,
        price: wishlistItem.product.price,
        image: wishlistItem.product.images[0] || '/placeholder.jpg',
        category: wishlistItem.product.category?.name || 'Sin categoría',
        addedAt: wishlistItem.createdAt,
      });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Error adding to wishlist',
      });
    }
  }

  /**
   * Remove from wishlist
   */
  static async removeFromWishlist(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Verify ownership
      const wishlistItem = await prisma.wishlist.findUnique({
        where: { id },
      });

      if (!wishlistItem) {
        return res.status(404).json({ error: 'Wishlist item not found' });
      }

      if (wishlistItem.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      await prisma.wishlist.delete({
        where: { id },
      });

      res.json({ message: 'Removed from wishlist' });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Error removing from wishlist',
      });
    }
  }

  /**
   * Check if product is in wishlist
   */
  static async isInWishlist(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { productId } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const inWishlist = await prisma.wishlist.findUnique({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      });

      res.json({ inWishlist: !!inWishlist });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Error checking wishlist',
      });
    }
  }

  /**
   * Clear entire wishlist
   */
  static async clearWishlist(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await prisma.wishlist.deleteMany({
        where: { userId },
      });

      res.json({ message: 'Wishlist cleared' });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Error clearing wishlist',
      });
    }
  }

  /**
   * Get wishlist count
   */
  static async getWishlistCount(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const count = await prisma.wishlist.count({
        where: { userId },
      });

      res.json({ count });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Error getting wishlist count',
      });
    }
  }
}
