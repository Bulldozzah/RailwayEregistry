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

// --- Static routes before /:id ---

// GET /api/regulations/dashboard — dashboard view with counts + list
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.query.user_id || 1;
    const view = req.query.view || 'all'; // all, open, complete, internal, unpublished, closing

    // Get user agency IDs
    const [userAgencies] = await pool.query(
      'SELECT agency_id FROM businessagency_members WHERE user_id = ?',
      [userId]
    );
    const agencyIds = userAgencies.map((u) => u.agency_id);
    if (agencyIds.length === 0) return success(res, { counts: {}, items: [] });

    // Build WHERE clause based on view
    let where = `WHERE r.deleted = 0 AND r.agency_id IN (${agencyIds.map(() => '?').join(',')})`;
    const params = [...agencyIds];

    if (view === 'open') {
      where += ' AND r.consultation_stage = 1 AND r.published = 1 AND (r.closing_date IS NULL OR r.closing_date >= CURDATE())';
    } else if (view === 'complete') {
      where += ' AND (r.consultation_stage IN (2, 3) OR (r.closing_date IS NOT NULL AND r.closing_date < CURDATE()))';
    } else if (view === 'internal') {
      where += ' AND r.published = 0';
    } else if (view === 'unpublished') {
      where += ' AND r.deleted = 1';
      // Override deleted filter
      where = where.replace('r.deleted = 0 AND ', '');
    }

    const [rows] = await pool.query(
      `SELECT r.*, a.name AS agency_name,
        (SELECT COUNT(*) FROM comments c WHERE c.regulation_id = r.id AND c.deleted = 0 AND c.publish = 1) AS comment_count
       FROM regulations r
       LEFT JOIN businessagency a ON r.agency_id = a.id
       ${where}
       ORDER BY r.id DESC`,
      params
    );

    // For closing-soon view, filter by days remaining
    let items = rows;
    if (view === 'closing') {
      // Get closing days threshold from settings (default 7)
      const [[setting]] = await pool.query("SELECT value FROM settings WHERE name = 'closing_days' LIMIT 1");
      const closingDays = setting ? parseInt(setting.value) : 7;
      const now = new Date();
      items = rows.filter((r) => {
        if (!r.closing_date || r.consultation_stage !== 1) return false;
        const close = new Date(r.closing_date);
        const diff = Math.ceil((close.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diff > 0 && diff <= closingDays;
      });
    }

    // Count totals per view
    const countQueries = [
      pool.query(`SELECT COUNT(*) as c FROM regulations r WHERE r.deleted = 0 AND r.agency_id IN (${agencyIds.map(() => '?').join(',')})`, agencyIds),
      pool.query(`SELECT COUNT(*) as c FROM regulations r WHERE r.deleted = 0 AND r.agency_id IN (${agencyIds.map(() => '?').join(',')}) AND r.consultation_stage = 1 AND r.published = 1 AND (r.closing_date IS NULL OR r.closing_date >= CURDATE())`, agencyIds),
      pool.query(`SELECT COUNT(*) as c FROM regulations r WHERE r.deleted = 0 AND r.agency_id IN (${agencyIds.map(() => '?').join(',')}) AND (r.consultation_stage IN (2,3) OR (r.closing_date IS NOT NULL AND r.closing_date < CURDATE()))`, agencyIds),
      pool.query(`SELECT COUNT(*) as c FROM regulations r WHERE r.deleted = 0 AND r.agency_id IN (${agencyIds.map(() => '?').join(',')}) AND r.published = 0`, agencyIds),
      pool.query(`SELECT COUNT(*) as c FROM regulations r WHERE r.deleted = 1 AND r.agency_id IN (${agencyIds.map(() => '?').join(',')})`, agencyIds),
    ];
    const [allR, openR, completeR, internalR, unpublishedR] = await Promise.all(countQueries);

    return success(res, {
      counts: {
        all: allR[0][0].c,
        open: openR[0][0].c,
        complete: completeR[0][0].c,
        internal: internalR[0][0].c,
        unpublished: unpublishedR[0][0].c,
      },
      items,
    });
  } catch (err) {
    console.error('GET /api/regulations/dashboard error:', err);
    return error(res, 'Failed to fetch dashboard', 500);
  }
});

// POST /api/regulations/batch — batch publish/unpublish
router.post('/batch', async (req, res) => {
  try {
    const { ids, action } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return error(res, 'Please select at least one consultation', 400);
    }
    if (action === 'publish') {
      await pool.query('UPDATE regulations SET published = 1, deleted = 0 WHERE id IN (?)', [ids]);
      return success(res, { message: `${ids.length} consultation(s) published successfully` });
    } else if (action === 'unpublish') {
      await pool.query('UPDATE regulations SET published = 0, deleted = 1 WHERE id IN (?)', [ids]);
      return success(res, { message: `${ids.length} consultation(s) unpublished successfully` });
    } else {
      return error(res, 'Invalid batch action', 400);
    }
  } catch (err) {
    console.error('POST /api/regulations/batch error:', err);
    return error(res, 'Failed to perform batch action: ' + err.message, 500);
  }
});

// POST /api/regulations — create a new consultation
router.post('/', async (req, res) => {
  try {
    const {
      title, description, expected_outcome, agency_id, industry_id,
      regulation_type, consultation_stage, closing_date, published,
      keywords, tags, specific_instructions, supporting_materials,
      offline_consultations, is_public, is_login_required,
      review_comments, enable_attachments, file_size, file_type,
    } = req.body;

    if (!title || !title.trim()) return error(res, 'Title is required', 400);
    if (!agency_id) return error(res, 'Agency is required', 400);
    if (!industry_id) return error(res, 'Industry is required', 400);

    // Generate slug from title
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const publishDate = published ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null;

    const [result] = await pool.query(
      `INSERT INTO regulations
       (title, description, expected_outcome, agency_id, industry_id, regulation_type,
        consultation_stage, closing_date, published, publish_date, slug, keywords, tags,
        specific_instructions, supporting_materials, offline_consultations,
        is_public, is_login_required, review_comments, enable_attachments,
        file_size, file_type, deleted, created, updated)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW(), NOW())`,
      [
        title.trim(), description || null, expected_outcome || null, agency_id, industry_id,
        regulation_type || 1, consultation_stage || 1, closing_date || null,
        published ? 1 : 0, publishDate, slug, keywords || null, tags || null,
        specific_instructions || null, supporting_materials || null, offline_consultations || null,
        is_public !== undefined ? (is_public ? 1 : 0) : 1,
        is_login_required !== undefined ? (is_login_required ? 1 : 0) : 0,
        review_comments !== undefined ? (review_comments ? 1 : 0) : 1,
        enable_attachments !== undefined ? (enable_attachments ? 1 : 0) : 1,
        file_size || 1, file_type || null,
      ]
    );

    return success(res, { id: result.insertId, title: title.trim(), slug }, 201);
  } catch (err) {
    console.error('POST /api/regulations error:', err);
    return error(res, 'Failed to create consultation: ' + err.message, 500);
  }
});

// PUT /api/regulations/:id — update a consultation
router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const {
      title, description, expected_outcome, agency_id, industry_id,
      regulation_type, consultation_stage, closing_date, published,
      keywords, tags, specific_instructions, supporting_materials,
      offline_consultations, is_public, is_login_required,
      review_comments, enable_attachments, file_size, file_type,
    } = req.body;

    if (!title || !title.trim()) return error(res, 'Title is required', 400);
    if (!agency_id) return error(res, 'Agency is required', 400);
    if (!industry_id) return error(res, 'Industry is required', 400);

    // Check exists
    const [rows] = await pool.query('SELECT * FROM regulations WHERE id = ?', [id]);
    if (rows.length === 0) return error(res, 'Consultation not found', 404);

    const existing = rows[0];
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    // Set publish_date if newly publishing
    let publishDate = existing.publish_date;
    if (published && !existing.published && !existing.publish_date) {
      publishDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    }

    await pool.query(
      `UPDATE regulations SET
        title = ?, description = ?, expected_outcome = ?, agency_id = ?, industry_id = ?,
        regulation_type = ?, consultation_stage = ?, closing_date = ?, published = ?,
        publish_date = ?, slug = ?, keywords = ?, tags = ?,
        specific_instructions = ?, supporting_materials = ?, offline_consultations = ?,
        is_public = ?, is_login_required = ?, review_comments = ?, enable_attachments = ?,
        file_size = ?, file_type = ?, updated = NOW()
       WHERE id = ?`,
      [
        title.trim(), description || null, expected_outcome || null, agency_id, industry_id,
        regulation_type || 1, consultation_stage || 1, closing_date || null,
        published ? 1 : 0, publishDate, slug, keywords || null, tags || null,
        specific_instructions || null, supporting_materials || null, offline_consultations || null,
        is_public !== undefined ? (is_public ? 1 : 0) : 1,
        is_login_required !== undefined ? (is_login_required ? 1 : 0) : 0,
        review_comments !== undefined ? (review_comments ? 1 : 0) : 1,
        enable_attachments !== undefined ? (enable_attachments ? 1 : 0) : 1,
        file_size || 1, file_type || null, id,
      ]
    );

    return success(res, { id: Number(id), title: title.trim(), slug });
  } catch (err) {
    console.error('PUT /api/regulations/:id error:', err);
    return error(res, 'Failed to update consultation: ' + err.message, 500);
  }
});

// DELETE /api/regulations/:id — soft delete (unpublish)
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await pool.query('SELECT * FROM regulations WHERE id = ?', [id]);
    if (rows.length === 0) return error(res, 'Consultation not found', 404);

    await pool.query('UPDATE regulations SET deleted = 1, published = 0, updated = NOW() WHERE id = ?', [id]);
    return success(res, { message: 'Consultation unpublished successfully' });
  } catch (err) {
    console.error('DELETE /api/regulations/:id error:', err);
    return error(res, 'Failed to unpublish consultation', 500);
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
