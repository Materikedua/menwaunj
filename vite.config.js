import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

function apiPlugin() {
  return {
    name: 'api-routes',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0];
        if (url === '/api/chat' || url === '/api/search') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              req.body = body ? JSON.parse(body) : {};
            } catch {
              req.body = {};
            }
            try {
              const mod = await server.ssrLoadModule(url === '/api/chat' ? './api/chat.js' : './api/search.js');
              const handler = mod.default || mod;
              res.status = (code) => { res.statusCode = code; return res; };
              res.json = (data) => {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
                return res;
              };
              await handler(req, res);
            } catch (err) {
              next(err);
            }
          });
          return;
        }
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [tailwindcss(), react(), apiPlugin()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
  },
});
