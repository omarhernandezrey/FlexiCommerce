import { Router } from 'express';
import { RecommendationController } from './recommendations.controller.js';

const router = Router();

// Public routes
router.get('/trending', RecommendationController.getTrending);
router.get('/similar/:productId', RecommendationController.getSimilar);
router.get('/carousels', RecommendationController.getCarousels);

// Protected routes
router.get('/personalized', RecommendationController.getPersonalized);

export default router;
