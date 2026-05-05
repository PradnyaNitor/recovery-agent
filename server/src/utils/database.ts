import sqlite3 from 'sqlite3';
import { promisify } from 'util';

export interface Database {
  get: (sql: string, params?: any[]) => Promise<any>;
  all: (sql: string, params?: any[]) => Promise<any[]>;
  run: (sql: string, params?: any[]) => Promise<{ lastID: number; changes: number }>;
  close: () => Promise<void>;
}

let db: sqlite3.Database | null = null;

export function getDatabase(): Database {
  if (!db) {
    throw new Error('Database not initialized');
  }

  const dbAsync = {
    get: promisify(db.get.bind(db)),
    all: promisify(db.all.bind(db)),
    run: promisify(db.run.bind(db)),
    close: promisify(db.close.bind(db))
  };

  return dbAsync;
}

export async function initializeDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(process.env.DATABASE_URL || './database.sqlite', (err) => {
      if (err) {
        reject(err);
        return;
      }

      // Create tables
      const tables = [
        `CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          name TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,

        `CREATE TABLE IF NOT EXISTS cases (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          issue_type TEXT NOT NULL,
          selected_transaction TEXT,
          status TEXT DEFAULT 'draft',
          case_id TEXT UNIQUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )`,

        `CREATE TABLE IF NOT EXISTS evidence (
          id TEXT PRIMARY KEY,
          case_id TEXT NOT NULL,
          filename TEXT NOT NULL,
          original_name TEXT NOT NULL,
          mime_type TEXT NOT NULL,
          size INTEGER NOT NULL,
          path TEXT NOT NULL,
          status TEXT DEFAULT 'uploaded',
          verified BOOLEAN DEFAULT FALSE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (case_id) REFERENCES cases (id)
        )`,

        `CREATE TABLE IF NOT EXISTS diagnoses (
          id TEXT PRIMARY KEY,
          case_id TEXT NOT NULL,
          issue_type TEXT NOT NULL,
          title TEXT NOT NULL,
          badge TEXT NOT NULL,
          likelihood INTEGER NOT NULL,
          likelihood_note TEXT NOT NULL,
          classification_reason TEXT NOT NULL,
          explanation TEXT NOT NULL,
          concern TEXT NOT NULL,
          decision_note TEXT NOT NULL,
          next_actions TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (case_id) REFERENCES cases (id)
        )`,

        `CREATE TABLE IF NOT EXISTS tracker_stages (
          id TEXT PRIMARY KEY,
          case_id TEXT NOT NULL,
          stage_index INTEGER NOT NULL,
          stage_name TEXT NOT NULL,
          completed BOOLEAN DEFAULT FALSE,
          completed_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (case_id) REFERENCES cases (id)
        )`,

        `CREATE TABLE IF NOT EXISTS reports (
          id TEXT PRIMARY KEY,
          case_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          report_type TEXT NOT NULL,
          report_data TEXT NOT NULL,
          file_format TEXT DEFAULT 'json',
          is_downloaded BOOLEAN DEFAULT FALSE,
          downloaded_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (case_id) REFERENCES cases (id),
          FOREIGN KEY (user_id) REFERENCES users (id)
        )`
      ];

      let completed = 0;
      tables.forEach(sql => {
        db!.run(sql, (err) => {
          if (err) {
            reject(err);
            return;
          }
          completed++;
          if (completed === tables.length) {
            resolve();
          }
        });
      });
    });
  });
}