import express from 'express';
import adminAuth from '../middleware/adminAuth.js';
import { getAdminStats, getAllUsers, approveUser, deleteUser, broadcastEmail } from '../controllers/adminController.js';

const adminRouter = express.Router();

adminRouter.get('/stats', adminAuth, getAdminStats);
adminRouter.get('/users', adminAuth, getAllUsers);
adminRouter.post('/approve', adminAuth, approveUser);
adminRouter.post('/delete', adminAuth, deleteUser);
adminRouter.post('/broadcast', adminAuth, broadcastEmail);

export default adminRouter;
