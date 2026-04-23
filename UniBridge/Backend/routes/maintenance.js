import express from 'express';
import {
  createMaintenance,
  getAllMaintenance,
  getActiveMaintenance,
  getUpcomingMaintenance,
  activateMaintenanceMode,
  deactivateMaintenanceMode,
  cancelMaintenance,
  sendMaintenanceEmails,
  getMaintenanceStats,
  checkMaintenanceMode,
} from '../controllers/maintenanceController.js';
import { protect, authorize } from '../middleware/auth.js';
import { requireAdminForMaintenance } from '../middleware/maintenance.js';

const router = express.Router();

// Public routes
router.get('/check', checkMaintenanceMode);
router.get('/active', getActiveMaintenance);
router.get('/upcoming', getUpcomingMaintenance);

// Protected routes (Admin only)
router.use(protect);
router.use(authorize('admin'));

router.post('/', requireAdminForMaintenance, createMaintenance);
router.get('/', requireAdminForMaintenance, getAllMaintenance);
router.get('/stats', requireAdminForMaintenance, getMaintenanceStats);
router.put('/:id/activate', requireAdminForMaintenance, activateMaintenanceMode);
router.put('/:id/deactivate', requireAdminForMaintenance, deactivateMaintenanceMode);
router.put('/:id/cancel', requireAdminForMaintenance, cancelMaintenance);
router.post('/:id/send-emails', requireAdminForMaintenance, sendMaintenanceEmails);

export default router;
