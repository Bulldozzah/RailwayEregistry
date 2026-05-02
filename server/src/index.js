import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import pool from './db.js';
import licensesRouter from './routes/licenses.js';
import agenciesRouter from './routes/agencies.js';
import locationsRouter from './routes/locations.js';
import industriesRouter from './routes/industries.js';
import businesstypesRouter from './routes/businesstypes.js';
import activitiesRouter from './routes/activities.js';
import regulationsRouter from './routes/regulations.js';
import contentRouter from './routes/content.js';
import workflowsRouter from './routes/workflows.js';
import searchRouter from './routes/search.js';
import linkClicksRouter from './routes/linkclicks.js';
import licenseAdminRouter from './routes/license-admin.js';
import usersRouter from './routes/users.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:8080' }));
app.use(express.json());

// Routes
app.use('/api/licenses', licensesRouter);
app.use('/api/agencies', agenciesRouter);
app.use('/api/locations', locationsRouter);
app.use('/api/industries', industriesRouter);
app.use('/api/businesstypes', businesstypesRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/regulations', regulationsRouter);
app.use('/api/content', contentRouter);
app.use('/api/workflows', workflowsRouter);
app.use('/api/search', searchRouter);
app.use('/api/link-clicks', linkClicksRouter);
app.use('/api/license-admin', licenseAdminRouter);
app.use('/api/users', usersRouter);

// Serve uploaded files
app.use('/uploads', express.static(new URL('../uploads', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')));

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'disconnected', message: err.message });
  }
});

// Dashboard stats
app.get('/api/stats', async (req, res) => {
  try {
    const [[{ licenses }]] = await pool.query(
      'SELECT COUNT(*) as licenses FROM businesslicense WHERE deleted = 0'
    );
    const [[{ agencies }]] = await pool.query(
      'SELECT COUNT(*) as agencies FROM businessagency WHERE deleted = 0'
    );
    const [[{ regulations }]] = await pool.query(
      'SELECT COUNT(*) as regulations FROM regulations WHERE deleted = 0'
    );
    const [[{ open_regulations }]] = await pool.query(
      "SELECT COUNT(*) as open_regulations FROM regulations WHERE deleted = 0 AND published = 1 AND closing_date >= CURDATE()"
    );
    const [[{ locations }]] = await pool.query(
      'SELECT COUNT(*) as locations FROM businesslocation WHERE deleted = 0'
    );
    const [[{ industries }]] = await pool.query(
      'SELECT COUNT(*) as industries FROM businessindustry WHERE deleted = 0'
    );
    const [[{ business_types }]] = await pool.query(
      'SELECT COUNT(*) as business_types FROM businesstype WHERE deleted = 0'
    );
    const [[{ activities }]] = await pool.query(
      'SELECT COUNT(*) as activities FROM businessactivity WHERE deleted = 0'
    );
    const [[{ comments }]] = await pool.query(
      'SELECT COUNT(*) as comments FROM comments WHERE deleted = 0'
    );
    const [[{ pending_comments }]] = await pool.query(
      'SELECT COUNT(*) as pending_comments FROM comments WHERE deleted = 0 AND pending_review = 1'
    );
    const [[{ feedback }]] = await pool.query(
      'SELECT COUNT(*) as feedback FROM feedback WHERE replied = 0'
    );
    const [[{ news }]] = await pool.query(
      'SELECT COUNT(*) as news FROM news WHERE deleted = 0 AND published = 1'
    );

    res.json({
      success: true,
      data: {
        licenses,
        agencies,
        regulations,
        open_regulations,
        locations,
        industries,
        business_types,
        activities,
        comments,
        pending_comments,
        feedback_pending: feedback,
        news,
      },
    });
  } catch (err) {
    console.error('GET /api/stats error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

// Error handler
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`eRegistry API server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
