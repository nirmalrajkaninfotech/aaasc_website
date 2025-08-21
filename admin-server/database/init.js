const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'admin.db');
const db = new sqlite3.Database(dbPath);

function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          email TEXT UNIQUE,
          role TEXT DEFAULT 'admin',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create site_settings table
      db.run(`
        CREATE TABLE IF NOT EXISTS site_settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          key TEXT UNIQUE NOT NULL,
          value TEXT,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create collages table
      db.run(`
        CREATE TABLE IF NOT EXISTS collages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          category TEXT NOT NULL,
          images TEXT,
          featured BOOLEAN DEFAULT 0,
          tags TEXT,
          date TEXT,
          published BOOLEAN DEFAULT 1,
          order_index INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create placements table
      db.run(`
        CREATE TABLE IF NOT EXISTS placements (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          content TEXT,
          images TEXT,
          alignment TEXT DEFAULT 'left',
          order_index INTEGER DEFAULT 0,
          published BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create achievements table
      db.run(`
        CREATE TABLE IF NOT EXISTS achievements (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          content TEXT,
          images TEXT,
          alignment TEXT DEFAULT 'left',
          order_index INTEGER DEFAULT 0,
          published BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create faculty table
      db.run(`
        CREATE TABLE IF NOT EXISTS faculty (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          slug TEXT UNIQUE NOT NULL,
          title TEXT NOT NULL,
          subtitle TEXT,
          designation TEXT,
          email TEXT,
          phone TEXT,
          content TEXT,
          image TEXT,
          images TEXT,
          order_index INTEGER DEFAULT 0,
          published BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create carousel table
      db.run(`
        CREATE TABLE IF NOT EXISTS carousel (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          image TEXT NOT NULL,
          title TEXT,
          description TEXT,
          caption TEXT,
          link TEXT,
          order_index INTEGER DEFAULT 0,
          published BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create academics table
      db.run(`
        CREATE TABLE IF NOT EXISTS academics (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          section TEXT,
          description TEXT,
          content TEXT,
          duration TEXT,
          eligibility TEXT,
          syllabus TEXT,
          career_prospects TEXT,
          image TEXT,
          order_index INTEGER DEFAULT 0,
          published BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create uploads table for tracking uploaded files
      db.run(`
        CREATE TABLE IF NOT EXISTS uploads (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          filename TEXT NOT NULL,
          original_name TEXT NOT NULL,
          mime_type TEXT,
          size INTEGER,
          path TEXT NOT NULL,
          uploaded_by INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (uploaded_by) REFERENCES users (id)
        )
      `);

      // Insert default admin user if not exists
      db.get("SELECT id FROM users WHERE username = 'admin'", (err, row) => {
        if (!row) {
          const defaultPassword = 'admin123'; // Change this in production!
          bcrypt.hash(defaultPassword, 10, (err, hash) => {
            if (err) {
              console.error('Error hashing password:', err);
              return;
            }
            
            db.run(`
              INSERT INTO users (username, password, email, role) 
              VALUES (?, ?, ?, ?)
            `, ['admin', hash, 'admin@aaasc.edu', 'admin'], (err) => {
              if (err) {
                console.error('Error creating default admin user:', err);
              } else {
                console.log('✅ Default admin user created (username: admin, password: admin123)');
              }
            });
          });
        }
      });

      // Insert default site settings
      const defaultSettings = [
        ['site_title', 'AAASC College'],
        ['logo', '/logo.png'],
        ['hero_title', 'Welcome to AAASC College'],
        ['hero_subtitle', 'Excellence in Education'],
        ['contact_address', '123 College Street, City, State'],
        ['contact_phone', '+1 234 567 8900'],
        ['contact_email', 'info@aaasc.edu'],
        ['footer_text', '© 2025 AAASC College. All rights reserved.']
      ];

      defaultSettings.forEach(([key, value]) => {
        db.run(`
          INSERT OR IGNORE INTO site_settings (key, value) 
          VALUES (?, ?)
        `, [key, value]);
      });

      console.log('✅ Database tables created successfully');
      resolve();
    });
  });
}

function closeDatabase() {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

module.exports = {
  db,
  initializeDatabase,
  closeDatabase
};
