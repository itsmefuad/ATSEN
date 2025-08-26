import express from 'express';
import { 
  getAllAchievements, 
  getStudentAchievements, 
  getRoomStandings,
  getStudentProgress,
  seedAchievements
} from '../controllers/achievementController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/all', getAllAchievements);

// Protected routes
router.get('/student/:studentId/room/:roomId', authMiddleware, getStudentAchievements);
router.get('/room/:roomId/standings', authMiddleware, getRoomStandings);
router.get('/my-progress', authMiddleware, getStudentProgress);

// Admin routes
router.post('/seed', seedAchievements); // TODO: Add admin middleware

export default router;
