const { pool } = require('../config/database');

const TaskModel = {
  async findAll({ status, priority, limit = 20, offset = 0 } = {}) {
    const conditions = [];
    const values = [];

    if (status)   { conditions.push(`status = $${values.length + 1}`);   values.push(status); }
    if (priority) { conditions.push(`priority = $${values.length + 1}`); values.push(priority); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    values.push(limit, offset);

    const { rows } = await pool.query(
      `SELECT * FROM tasks ${where} ORDER BY created_at DESC
       LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );

    const countRes = await pool.query(
      `SELECT COUNT(*) FROM tasks ${where}`,
      values.slice(0, -2)
    );

    return { tasks: rows, total: parseInt(countRes.rows[0].count) };
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    return rows[0] || null;
  },

  async create({ title, description, status = 'pending', priority = 'medium' }) {
    const { rows } = await pool.query(
      `INSERT INTO tasks (title, description, status, priority)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [title, description, status, priority]
    );
    return rows[0];
  },

  async update(id, fields) {
    const allowed = ['title', 'description', 'status', 'priority'];
    const updates = [];
    const values  = [];

    for (const [key, val] of Object.entries(fields)) {
      if (allowed.includes(key) && val !== undefined) {
        updates.push(`${key} = $${values.length + 1}`);
        values.push(val);
      }
    }

    if (updates.length === 0) return null;

    values.push(id);
    const { rows } = await pool.query(
      `UPDATE tasks SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );
    return rows[0] || null;
  },

  async delete(id) {
    const { rows } = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    return rows[0] || null;
  },

  async stats() {
    const { rows } = await pool.query(`
      SELECT
        COUNT(*)                                          AS total,
        COUNT(*) FILTER (WHERE status = 'pending')       AS pending,
        COUNT(*) FILTER (WHERE status = 'in_progress')   AS in_progress,
        COUNT(*) FILTER (WHERE status = 'done')          AS done,
        COUNT(*) FILTER (WHERE priority = 'high')        AS high_priority
      FROM tasks
    `);
    return rows[0];
  },
};

module.exports = TaskModel;
