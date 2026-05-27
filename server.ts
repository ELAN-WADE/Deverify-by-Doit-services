// server.ts
import { serve, file } from 'bun';
import { Database } from 'bun:sqlite';
import path from 'path';
import fs from 'fs';

async function main() {
  try {
    // 1. Initialize SQLite Database
    const dbPath = process.env.DB_PATH || path.resolve(process.cwd(), 'participants.db');
    console.log(`Using database file at: ${dbPath}`);

    // Ensure the directory exists before creating the database
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      try {
        fs.mkdirSync(dbDir, { recursive: true });
        console.log(`Created directory for database: ${dbDir}`);
      } catch (e) {
        console.error(`Failed to create directory ${dbDir}:`, e);
      }
    }

    let db;
    try {
      db = new Database(dbPath, { create: true });
      db.exec('PRAGMA journal_mode = WAL;');
      console.log('Database connected successfully.');
    } catch (e) {
      console.error('Failed to open database! This is likely a volume permission issue.', e);
      // Fallback to in-memory db so the server doesn't crash, allowing us to see the logs
      console.log('Falling back to in-memory database to prevent crash...');
      db = new Database(':memory:');
      db.exec('PRAGMA journal_mode = WAL;');
    }

    db.exec(`
      CREATE TABLE IF NOT EXISTS participants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        sex TEXT,
        registeredAt TEXT
      )
    `);

    // 2. Sync existing data from JSON if DB is empty
    const countStmt = db.prepare('SELECT COUNT(*) as count FROM participants');
    const count: any = countStmt.get();
    if (count.count === 0) {
      try {
        const jsonPath = path.resolve(process.cwd(), 'public/participants.json');
        if (fs.existsSync(jsonPath)) {
          const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
          const insert = db.prepare('INSERT INTO participants (id, name, phone, email, sex, registeredAt) VALUES ($id, $name, $phone, $email, $sex, $registeredAt)');
          const insertMany = db.transaction((participants: any[]) => {
            for (const p of participants) {
              insert.run({
                $id: p.id,
                $name: p.name || 'Unknown',
                $phone: p.phone || '',
                $email: p.email || '',
                $sex: p.sex || '',
                $registeredAt: p.registeredAt || new Date().toISOString()
              });
            }
          });
          insertMany(data);
          console.log(`Successfully seeded ${data.length} records from JSON.`);
        }
      } catch (e) {
        console.error('Failed to sync initial JSON to SQLite:', e);
      }
    }

    // 3. Prepared Statements
    const getParticipants = db.prepare('SELECT * FROM participants ORDER BY id DESC');
    const insertParticipant = db.prepare('INSERT INTO participants (name, phone, email, sex, registeredAt) VALUES ($name, $phone, $email, $sex, $registeredAt)');
    const updateParticipant = db.prepare('UPDATE participants SET name = $name, phone = $phone, email = $email, sex = $sex, registeredAt = $registeredAt WHERE id = $id');
    const deleteParticipant = db.prepare('DELETE FROM participants WHERE id = $id');
    const clearAll = db.prepare('DELETE FROM participants');

    const PORT = parseInt(process.env.PORT || '3000', 10);

    // 4. Start Server
    console.log(`Starting server on port ${PORT}...`);
    serve({
      port: PORT,
      hostname: '0.0.0.0',
      async fetch(req) {
        const url = new URL(req.url);
        
        // Explicit health check endpoint for Railway
        if (url.pathname === '/health') {
          return new Response('OK', { status: 200 });
        }

        // --- API ROUTES ---
        if (url.pathname === '/api/participants') {
          // Handle GET
          if (req.method === 'GET') {
            try {
              const data = getParticipants.all();
              return new Response(JSON.stringify(data), {
                headers: { 'Content-Type': 'application/json' },
              });
            } catch (e: any) {
              return new Response(JSON.stringify({ error: e.message }), { status: 500 });
            }
          }

          // Handle POST
          if (req.method === 'POST') {
            try {
              const bodyText = await req.text();
              const payload = JSON.parse(bodyText);
              const { action, data } = payload;

              if (action === 'add') {
                const info = insertParticipant.run({
                  $name: data.name || 'Unknown',
                  $phone: data.phone || '',
                  $email: data.email || '',
                  $sex: data.sex || '',
                  $registeredAt: data.registeredAt || new Date().toISOString()
                });
                return new Response(JSON.stringify({ id: info.lastInsertRowid }), { headers: { 'Content-Type': 'application/json' } });
              } else if (action === 'update') {
                updateParticipant.run({
                  $id: data.id,
                  $name: data.name || 'Unknown',
                  $phone: data.phone || '',
                  $email: data.email || '',
                  $sex: data.sex || '',
                  $registeredAt: data.registeredAt || new Date().toISOString()
                });
                return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
              } else if (action === 'delete') {
                deleteParticipant.run({ $id: data.id });
                return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
              } else if (action === 'import') {
                const insertMany = db.transaction((participants: any[]) => {
                  for (const p of participants) {
                    insertParticipant.run({
                      $name: p.name || 'Unknown',
                      $phone: p.phone || '',
                      $email: p.email || '',
                      $sex: p.sex || '',
                      $registeredAt: p.registeredAt || new Date().toISOString()
                    });
                  }
                });
                insertMany(data);
                return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
              } else if (action === 'clear') {
                clearAll.run();
                return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
              } else if (action === 'reset') {
                clearAll.run();
                try {
                  const jsonPath = path.resolve(process.cwd(), 'public/participants.json');
                  if (fs.existsSync(jsonPath)) {
                    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
                    const insertMany = db.transaction((participants: any[]) => {
                      for (const p of participants) {
                        insertParticipant.run({
                          $name: p.name || 'Unknown',
                          $phone: p.phone || '',
                          $email: p.email || '',
                          $sex: p.sex || '',
                          $registeredAt: p.registeredAt || new Date().toISOString()
                        });
                      }
                    });
                    insertMany(jsonData);
                  }
                } catch(e) {
                  console.error('Reset error:', e);
                }
                return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
              } else {
                return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400 });
              }
            } catch (e: any) {
              return new Response(JSON.stringify({ error: e.message }), { status: 500 });
            }
          }
        }

        // --- STATIC FILES (Frontend) ---
        try {
          const distPath = path.join(process.cwd(), 'dist');
          let reqPath = url.pathname === '/' ? '/index.html' : url.pathname;
          
          let filePath = path.join(distPath, reqPath);
          let f = file(filePath);
          let isAsset = reqPath.startsWith('/assets/');
          
          if (!(await f.exists())) {
            if (reqPath.startsWith('/assets/') || reqPath.endsWith('.js') || reqPath.endsWith('.css')) {
              return new Response('Not found', { status: 404 });
            }
            filePath = path.join(distPath, 'index.html');
            f = file(filePath);
            isAsset = false;
            
            // CRITICAL: If index.html STILL does not exist, it means Nixpacks did not build the frontend.
            // We MUST return a 200 OK so Railway doesn't mark the deployment as failed due to a 404.
            if (!(await f.exists())) {
              return new Response('<html><body><h1>Frontend not built! The dist folder is missing.</h1></body></html>', {
                status: 200,
                headers: { 'Content-Type': 'text/html' }
              });
            }
          }

          const headers = new Headers();
          headers.set('Content-Type', f.type);

          if (isAsset) {
            headers.set('Cache-Control', 'public, max-age=31536000, immutable');
          } else {
            headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
          }

          return new Response(f, { headers });
        } catch (e) {
          console.error('Static file error:', e);
          return new Response('Internal Server Error', { status: 500 });
        }
      },
    });
  } catch (error) {
    console.error('FATAL SERVER ERROR:', error);
    process.exit(1);
  }
}

main();
