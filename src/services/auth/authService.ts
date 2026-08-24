/**
 * Authentication, Password Hashing & JWT Service
 * @license Apache-2.0
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDB } from '../db/database';
import { UserAccount } from '../../types/domain';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_recruitment_platform';

export interface AuthTokens {
  user: UserAccount;
  token: string;
}

/**
 * Registers a new user with password hashing
 */
export async function registerUser(email: string, password: string, name: string): Promise<AuthTokens> {
  const database = getDB();
  const existing = database.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) {
    throw new Error('An account with this email address already exists.');
  }

  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);
  const id = `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const createdAt = new Date().toISOString();

  database.prepare(`
    INSERT INTO users (id, email, password_hash, name, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, email.toLowerCase(), password_hash, name, 'user', createdAt);

  const user: UserAccount = {
    id,
    email: email.toLowerCase(),
    name,
    role: 'user',
    createdAt
  };

  const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  return { user, token };
}

/**
 * Authenticates user credentials and returns signed JWT
 */
export async function loginUser(email: string, password: string): Promise<AuthTokens> {
  const database = getDB();
  const row = database.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase()) as any;
  if (!row) {
    throw new Error('Invalid email credentials.');
  }

  const isMatch = await bcrypt.compare(password, row.password_hash);
  if (!isMatch) {
    throw new Error('Invalid password credentials.');
  }

  const user: UserAccount = {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    createdAt: row.created_at
  };

  const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  return { user, token };
}

/**
 * Verifies JWT token string and returns decoded user payload
 */
export function verifyToken(token: string): { userId: string; email: string; role: string } {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return { userId: decoded.userId, email: decoded.email, role: decoded.role };
  } catch (err) {
    throw new Error('Invalid or expired authentication token.');
  }
}
