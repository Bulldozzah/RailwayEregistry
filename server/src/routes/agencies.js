import { Router } from 'express';
import pool from '../db.js';
import { executePaginatedQuery, parsePagination, success, error } from '../helpers.js';

const router = Router();

// GET /api/agencies — paginated list
router.get('/', async (req, res) => {
  try {
    const pagination = parsePagination(req.query);
    const result = await executePaginatedQuery(pool, 'businessagency', {
      ...pagination,
      searchColumns: ['name', 'title', 'acronym', 'email'],
    });
    return res.json(result);
  } catch (err) {
    console.error('GET /api/agencies error:', err);
    return error(res, 'Failed to fetch agencies', 500);
  }
});

// GET /api/agencies/:id — single agency with offices and industries
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, loc.name AS location_name
       FROM businessagency a
       LEFT JOIN businesslocation loc ON a.location_id = loc.id
       WHERE a.id = ? AND a.deleted = 0`,
      [req.params.id]
    );
    if (rows.length === 0) return error(res, 'Agency not found', 404);

    const [offices] = await pool.query(
      `SELECT o.*, loc.name AS location_name
       FROM businessagencyoffice o
       LEFT JOIN businesslocation loc ON o.location_id = loc.id
       WHERE o.agency_id = ? AND o.deleted = 0`,
      [req.params.id]
    );

    const [industries] = await pool.query(
      `SELECT bi.* FROM businessindustry bi
       INNER JOIN businessagency_industries bai ON bi.id = bai.businessindustry_id
       WHERE bai.businessagency_id = ? AND bi.deleted = 0`,
      [req.params.id]
    );

    const [[licenseCount]] = await pool.query(
      'SELECT COUNT(*) as count FROM businesslicense WHERE agency_id = ? AND deleted = 0',
      [req.params.id]
    );

    return success(res, {
      ...rows[0],
      offices,
      industries,
      license_count: licenseCount.count,
    });
  } catch (err) {
    console.error('GET /api/agencies/:id error:', err);
    return error(res, 'Failed to fetch agency', 500);
  }
});

// GET /api/agencies/slug/:slug — agency by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM businessagency WHERE slug = ? AND deleted = 0',
      [req.params.slug]
    );
    if (rows.length === 0) return error(res, 'Agency not found', 404);
    return success(res, rows[0]);
  } catch (err) {
    console.error('GET /api/agencies/slug/:slug error:', err);
    return error(res, 'Failed to fetch agency', 500);
  }
});

export default router;
