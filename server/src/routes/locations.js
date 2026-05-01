import { Router } from 'express';
import pool from '../db.js';
import { executePaginatedQuery, parsePagination, success, error } from '../helpers.js';

const router = Router();

// GET /api/locations — paginated list
router.get('/', async (req, res) => {
  try {
    const pagination = parsePagination(req.query);
    const result = await executePaginatedQuery(pool, 'businesslocation', {
      ...pagination,
      searchColumns: ['name'],
      orderBy: 'name',
      orderDir: 'ASC',
    });
    return res.json(result);
  } catch (err) {
    console.error('GET /api/locations error:', err);
    return error(res, 'Failed to fetch locations', 500);
  }
});

// GET /api/locations/:id — single location with license count
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM businesslocation WHERE id = ? AND deleted = 0',
      [req.params.id]
    );
    if (rows.length === 0) return error(res, 'Location not found', 404);

    const [[licenseCount]] = await pool.query(
      'SELECT COUNT(*) as count FROM businesslicense WHERE location_id = ? AND deleted = 0',
      [req.params.id]
    );

    // Fetch child locations
    const [children] = await pool.query(
      'SELECT * FROM businesslocation WHERE parent = ? AND deleted = 0 ORDER BY name ASC',
      [req.params.id]
    );

    return success(res, {
      ...rows[0],
      license_count: licenseCount.count,
      children,
    });
  } catch (err) {
    console.error('GET /api/locations/:id error:', err);
    return error(res, 'Failed to fetch location', 500);
  }
});

// GET /api/locations/categories — location categories
router.get('/categories/all', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM businesslocation_category WHERE published = 1 ORDER BY name ASC'
    );
    return success(res, rows);
  } catch (err) {
    console.error('GET /api/locations/categories error:', err);
    return error(res, 'Failed to fetch location categories', 500);
  }
});

export default router;
