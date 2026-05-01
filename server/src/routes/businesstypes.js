import { Router } from 'express';
import pool from '../db.js';
import { executePaginatedQuery, parsePagination, success, error } from '../helpers.js';

const router = Router();

// GET /api/businesstypes — paginated list
router.get('/', async (req, res) => {
  try {
    const pagination = parsePagination(req.query);
    const filters = {};
    if (req.query.show_in_browse) filters.show_in_browse = req.query.show_in_browse;

    const result = await executePaginatedQuery(pool, 'businesstype', {
      ...pagination,
      searchColumns: ['name', 'description'],
      filters,
      orderBy: 'name',
      orderDir: 'ASC',
    });

    for (const bt of result.data) {
      const [[{ count }]] = await pool.query(
        `SELECT COUNT(DISTINCT bl.id) as count
         FROM businesslicense bl
         INNER JOIN licenses_activities la ON bl.id = la.businesslicense_id
         INNER JOIN businesstypes_activities bta ON la.businessactivity_id = bta.businessactivity_id
         WHERE bta.businesstype_id = ? AND bl.deleted = 0`,
        [bt.id]
      );
      bt.license_count = count;
    }

    return res.json(result);
  } catch (err) {
    console.error('GET /api/businesstypes error:', err);
    return error(res, 'Failed to fetch business types', 500);
  }
});

// GET /api/businesstypes/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM businesstype WHERE id = ? AND deleted = 0',
      [req.params.id]
    );
    if (rows.length === 0) return error(res, 'Business type not found', 404);

    const [activities] = await pool.query(
      `SELECT ba.* FROM businessactivity ba
       INNER JOIN businesstypes_activities bta ON ba.id = bta.businessactivity_id
       WHERE bta.businesstype_id = ? AND ba.deleted = 0`,
      [req.params.id]
    );

    const [industries] = await pool.query(
      `SELECT bi.* FROM businessindustry bi
       INNER JOIN businesstypes_industries bti ON bi.id = bti.businessindustry_id
       WHERE bti.businesstype_id = ? AND bi.deleted = 0`,
      [req.params.id]
    );

    return success(res, { ...rows[0], activities, industries });
  } catch (err) {
    console.error('GET /api/businesstypes/:id error:', err);
    return error(res, 'Failed to fetch business type', 500);
  }
});

export default router;
