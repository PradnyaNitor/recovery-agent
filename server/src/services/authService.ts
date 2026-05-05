import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../utils/database.js';
import { User, CreateUserData, LoginData } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateToken(user: User): string {
  return jwt.sign(
  { userId: user.id, email: user.email },
  process.env.JWT_SECRET as string,
  {
    expiresIn: '1h'
  }
);  
  }

  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  static async createUser(data: CreateUserData): Promise<User> {
    const db = getDatabase();

    // Check if user already exists
    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [data.email.toLowerCase()]);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await this.hashPassword(data.password);
    const userData = {
      id: data.email.toLowerCase(), // Using email as ID for simplicity
      email: data.email.toLowerCase(),
      password_hash: hashedPassword,
      name: data.name
    };

    await db.run(
      'INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)',
      [userData.id, userData.email, userData.password_hash, userData.name]
    );

    return {
      ...userData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  static async authenticateUser(data: LoginData): Promise<{ user: User; token: string }> {
    const db = getDatabase();

    const user = await db.get('SELECT * FROM users WHERE email = ?', [data.email.toLowerCase()]);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await this.verifyPassword(data.password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user);

    return { user, token };
  }

  static async getUserById(id: string): Promise<User | null> {
    const db = getDatabase();
    return db.get('SELECT * FROM users WHERE id = ?', [id]);
  }
}