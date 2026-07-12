import connectDB from "../db/index.js";

const ensureVideosTable = async () => {
  const pool = await connectDB();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS videos (
      id SERIAL PRIMARY KEY,
      video_file TEXT NOT NULL,
      thumbnail TEXT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      duration INTEGER NOT NULL,
      views INTEGER DEFAULT 0,
      is_published BOOLEAN DEFAULT TRUE,
      owner_id INTEGER,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

export const Video = {
  async create(payload = {}) {
    await ensureVideosTable();

    const pool = await connectDB();
    const result = await pool.query(
      `INSERT INTO videos (video_file, thumbnail, title, description, duration, views, is_published, owner_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, video_file AS "videoFile", thumbnail, title, description, duration, views, is_published AS "isPublished", owner_id AS "owner"`,
      [
        payload.videoFile,
        payload.thumbnail,
        payload.title,
        payload.description,
        payload.duration,
        payload.views ?? 0,
        payload.isPublished ?? true,
        payload.owner ?? null,
      ]
    );

    return result.rows[0];
  },
};