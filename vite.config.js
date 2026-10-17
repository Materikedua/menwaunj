import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { isPrivateRequestUrl, privateDatabaseFiles } from './server/command/private-paths.mjs';

const commandDatabasePath = path.resolve(process.env.COMMAND_DATABASE_PATH || '.command-os/command.sqlite');

// Local persistent backend only. Production needs a durable managed database.
const commandDevelopment = () => ({
  name: 'menwa-command-local',
  async configureServer(server) {
    const { createCommandService } = await import('./server/command/service.mjs');
    const command = createCommandService({
      databasePath: commandDatabasePath,
    });
    server.middlewares.use((req, res, next) => {
      // Vite serves project files: keep local identities, sessions and history private.
      if (isPrivateRequestUrl(req.url, server.config.root, commandDatabasePath)) {
        res.statusCode = 403; res.end('Forbidden'); return;
      }
      Promise.resolve(command.handler(req, res, next)).catch((error) => {
        console.error('Command service request failed:', error.name);
        if (!res.headersSent) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Layanan belum dapat menyelesaikan permintaan.' }));
        } else res.end();
      });
    });
    server.httpServer?.once('close', () => command.close());
  },
});

export default defineConfig({
  cacheDir: '.vite-cache',
  plugins: [tailwindcss(), react(), commandDevelopment()],
  server: {
    host: '127.0.0.1',
    fs: { deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**', '**/.command-os/**', '**/*.sqlite*', '**/*.db*', '**/server/**', ...privateDatabaseFiles(commandDatabasePath)] },
  },
});
