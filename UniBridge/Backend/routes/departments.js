import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  createDepartment,
  getDepartments,
  getAllDepartments,
  updateDepartment,
  deleteDepartment,
  getDepartmentStats
} from '../controllers/departmentController.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(authorize('employer', 'admin'), getDepartments)
  .post(authorize('employer', 'admin'), createDepartment);

router.get('/all', getAllDepartments);

router.get('/stats', authorize('employer', 'admin'), getDepartmentStats);

router
  .route('/:id')
  .put(authorize('employer', 'admin'), updateDepartment)
  .delete(authorize('employer', 'admin'), deleteDepartment);

export default router;
