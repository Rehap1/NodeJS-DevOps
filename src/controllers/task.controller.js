const { validationResult } = require('express-validator');
const TaskModel = require('../models/task.model');

const handleError = (res, err, status = 500) => {
  console.error(err);
  res.status(status).json({ error: err.message || 'Internal server error' });
};

exports.getAllTasks = async (req, res) => {
  try {
    const { status, priority, limit, offset } = req.query;
    const result = await TaskModel.findAll({
      status,
      priority,
      limit:  limit  ? parseInt(limit)  : 20,
      offset: offset ? parseInt(offset) : 0,
    });
    res.json({ data: result.tasks, meta: { total: result.total } });
  } catch (err) { handleError(res, err); }
};

exports.getTaskById = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  try {
    const task = await TaskModel.findById(parseInt(req.params.id));
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ data: task });
  } catch (err) { handleError(res, err); }
};

exports.createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  try {
    const task = await TaskModel.create(req.body);
    res.status(201).json({ data: task });
  } catch (err) { handleError(res, err); }
};

exports.updateTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  try {
    const task = await TaskModel.update(parseInt(req.params.id), req.body);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ data: task });
  } catch (err) { handleError(res, err); }
};

exports.deleteTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  try {
    const task = await TaskModel.delete(parseInt(req.params.id));
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted', data: task });
  } catch (err) { handleError(res, err); }
};

exports.getStats = async (req, res) => {
  try {
    const stats = await TaskModel.stats();
    res.json({ data: stats });
  } catch (err) { handleError(res, err); }
};
