import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import connectDB from "../db/index.js";

const ensureUsersTable = async () => {
  const pool = await connectDB();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      username VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

const normalizeUser = (row) => {
  if (!row) return null;

  return {
    _id: row.id,
    username: row.full_name?.toLowerCase().replace(/\s+/g, "") || null,
    email: row.email,
    fullName: row.full_name,
    password: row.password,
    refreshToken: null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,

    async isPasswordCorrect(password) {
      return bcrypt.compare(password, this.password);
    },

    generateAccessToken() {
      return jwt.sign(
        {
          _id: this._id,
          username: this.username,
          email: this.email,
          fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION || "1h" }
      );
    },

    generateRefreshToken() {
      return jwt.sign(
        { _id: this._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || "2h" }
      );
    },
  };
};

const applyProjection = (user, projection) => {
  if (!user || !projection) return user;

  const excludedFields = new Set(
    projection
      .split(/\s+/)
      .filter(Boolean)
      .map((field) => field.replace(/^-/, ""))
  );

  for (const field of excludedFields) {
    delete user[field];
  }

  return user;
};

export const User = {
  async create(payload = {}) {
    await ensureUsersTable();

    const pool = await connectDB();
    const username = (payload.username ?? payload.userName ?? "")
      .toString()
      .trim()
      .toLowerCase();
    const email = (payload.email ?? "").toString().trim().toLowerCase();
    const fullName = (payload.fullName ?? payload.full_name ?? "")
      .toString()
      .trim();
    const password = payload.password;

    if (!email || !fullName || !password) {
      throw new Error("Email, fullName, and password are required");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (full_name, email, password, username)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name AS "fullName", email, password, created_at AS "createdAt", updated_at AS "updatedAt"`,
      [fullName, email, hashedPassword, username]
    );

    return normalizeUser(result.rows[0]);
  },

  async findOne(query = {}) {
    await ensureUsersTable();

    const pool = await connectDB();

    if (query.$or) {
      const conditions = query.$or
        .map((condition) => {
          if (condition.username) return `full_name ILIKE $1`;
          if (condition.email) return `email = $2`;
          return null;
        })
        .filter(Boolean);

      if (conditions.length) {
        const values = query.$or.flatMap((condition) => {
          if (condition.username) return [`%${condition.username.toLowerCase()}%`];
          if (condition.email) return [condition.email.toLowerCase()];
          return [];
        });

        const result = await pool.query(
          `SELECT id, full_name AS "fullName", email, password, created_at AS "createdAt", updated_at AS "updatedAt"
           FROM users
           WHERE ${conditions.join(" OR ")}
           LIMIT 1`,
          values
        );

        return normalizeUser(result.rows[0]);
      }
    }

    if (query.username) {
      const result = await pool.query(
        `SELECT id, full_name AS "fullName", email, password, created_at AS "createdAt", updated_at AS "updatedAt"
         FROM users
         WHERE full_name ILIKE $1
         LIMIT 1`,
        [`%${query.username.toLowerCase()}%`]
      );
      return normalizeUser(result.rows[0]);
    }

    if (query.email) {
      const result = await pool.query(
        `SELECT id, full_name AS "fullName", email, password, created_at AS "createdAt", updated_at AS "updatedAt"
         FROM users
         WHERE email = $1
         LIMIT 1`,
        [query.email.toLowerCase()]
      );
      return normalizeUser(result.rows[0]);
    }

    return null;
  },

  findById(id) {
    return {
      async select(projection) {
        await ensureUsersTable();

        const pool = await connectDB();
        const result = await pool.query(
          `SELECT id, full_name AS "fullName", email, password, created_at AS "createdAt", updated_at AS "updatedAt"
           FROM users
           WHERE id = $1
           LIMIT 1`,
          [id]
        );

        const user = normalizeUser(result.rows[0]);
        return applyProjection(user, projection);
      },
    };
  },
};
