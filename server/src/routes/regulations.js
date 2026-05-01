import { Router } from 'express';
import pool from '../db.js';
import { executePaginatedQuery, parsePagination, success, error } from '../helpers.js';

const router = Router();

// GET /api/regulations — paginated list
router.get('/', async (req, res) => {
  try {
    const pagination = parsePagination(req.query);
    const filters = {};
    if (req.query.agency_id) filters.agency_id = req.query.agency_id;
    if (req.query.industry_id) filters.industry_id = req.query.industry_id;
    if (req.query.published !== undefined) filters.published = req.query.published;
    if (req.query.consultation_stage) filters.consultation_stage = req.query.consultation_stage;

    const result = await executePaginatedQuery(pool, 'regulations', {
      ...pagination,
      searchColumns: ['title', 'description', 'keywords', 'tags'],
      filters,
    });

    // Attach agency name and comment count
    for (const reg of result.data) {
      const [[agency]] = await pool.query(
        'SELECT name FROM businessagency WHERE id = ?',
        [reg.agency_id]
      );
      reg.agency_name = agency ? agency.name : null;

      const [[{ count }]] = await pool.query(
        'SELECT COUNT(*) as count FROM comments WHERE regulation_id = ? AND deleted = 0',
        [reg.id]
      );
      reg.comment_count = count;
    }

    return res.json(result);
  } catch (err) {
    console.error('GET /api/regulations error:', err);
    return error(res, 'Failed to fetch regulations', 500);
  }
});

// GET /api/regulations/:id — single regulation with comments
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, a.name AS agency_name, bi.name AS industry_name
       FROM regulations r
       LEFT JOIN businessagency a ON r.agency_id = a.id
       LEFT JOIN businessindustry bi ON r.industry_id = bi.id
       WHERE r.id = ? AND r.deleted = 0`,
      [req.params.id]
    );
    if (rows.length === 0) return error(res, 'Regulation not found', 404);

    const [attachments] = await pool.query(
      'SELECT * FROM regulations_attachment WHERE regulation_id = ?',
      [req.params.id]
    );

    const [comments] = await pool.query(
      `SELECT c.*, 
              CASE WHEN c.is_admin = 1 THEN 'Admin' ELSE NULL END AS user_role
       FROM comments c
       WHERE c.regulation_id = ? AND c.deleted = 0 AND c.publish = 1
       ORDER BY c.created_at DESC`,
      [req.params.id]
    );

    const [positions] = await pool.query(
      'SELECT * FROM position WHERE regulation_id = ?',
      [req.params.id]
    );

    const [fieldData] = await pool.query(
      `SELECT rfd.*, rf.fieldlabel, rf.fieldtype
       FROM regulationfielddata rfd
       INNER JOIN regulationfields rf ON rfd.field_id = rf.id
       WHERE rfd.regulation_id = ?`,
      [req.params.id]
    );

    return success(res, {
      ...rows[0],
      attachments,
      comments,
      positions,
      field_data: fieldData,
    });
  } catch (err) {
    console.error('GET /api/regulations/:id error:', err);
    return error(res, 'Failed to fetch regulation', 500);
  }
});

// POST /api/regulations/:id/comments — submit a comment
router.post('/:id/comments', async (req, res) => {
  try {
    const { comment, user, parent, position, documents } = req.body;
    if (!comment) return error(res, 'Comment is required');

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const [result] = await pool.query(
      `INSERT INTO comments 
       (comment, regulation_id, created_at, updated_at, user, parent, position, documents, 
        status, publish, hidden, deleted, pending_review, upvote_count, is_admin, check_abusive)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 1, 0, 0, 1, 0, 0, 0)`,
      [comment, req.params.id, now, now, user || 0, parent || null, position || 1, documents || null]
    );

    return success(res, { id: result.insertId }, 201);
  } catch (err) {
    console.error('POST /api/regulations/:id/comments error:', err);
    return error(res, 'Failed to submit comment', 500);
  }
});

export default router;
