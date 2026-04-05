const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createDepartment,
  getDepartments,
  getAllDepartments,
  updateDepartment,
  deleteDepartment,
  getDepartmentStats
} = require('../controllers/departmentController');

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

module.exports = router;
