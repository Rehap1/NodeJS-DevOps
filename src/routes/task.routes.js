const router = require('express').Router();
const { body, param } = require('express-validator');
const ctrl = require('../controllers/task.controller');

const STATUSES   = ['pending', 'in_progress', 'done'];
const PRIORITIES = ['low', 'medium', 'high'];

const validId = param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer');

const createRules = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 255 }),
  body('description').optional().trim(),
  body('status').optional().isIn(STATUSES).withMessage(`Status must be one of: ${STATUSES.join(', ')}`),
  body('priority').optional().isIn(PRIORITIES).withMessage(`Priority must be one of: ${PRIORITIES.join(', ')}`),
];

const updateRules = [
  body('title').optional().trim().notEmpty().isLength({ max: 255 }),
  body('description').optional().trim(),
  body('status').optional().isIn(STATUSES),
  body('priority').optional().isIn(PRIORITIES),
];

router.get('/',          ctrl.getAllTasks);
router.get('/stats',     ctrl.getStats);
router.get('/:id',       validId, ctrl.getTaskById);
router.post('/',         createRules, ctrl.createTask);
router.patch('/:id',     [validId, ...updateRules], ctrl.updateTask);
router.delete('/:id',    validId, ctrl.deleteTask);

module.exports = router;
