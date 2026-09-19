import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Custom plugin to serve /api serverless functions during local development (npm run dev)
function apiDevPlugin() {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ? req.url.split('?')[0] : '';
        if (url === '/api/send-otp' || url === '/api/verify-otp') {
          try {
            // Buffer and parse JSON request body
            const buffers = [];
            for await (const chunk of req) {
              buffers.push(chunk);
            }
            const rawBody = Buffer.concat(buffers).toString('utf-8');
            let parsedBody = {};
            try {
              if (rawBody) parsedBody = JSON.parse(rawBody);
            } catch (_) {}

            req.body = parsedBody;

            // Vercel / Express response compatibility helpers
            res.status = (code) => {
              res.statusCode = code;
              return res;
            };
            res.json = (data) => {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
              return res;
            };

            if (url === '/api/send-otp') {
              const { default: handler } = await import('./api/send-otp.js');
              await handler(req, res);
            } else if (url === '/api/verify-otp') {
              const { default: handler } = await import('./api/verify-otp.js');
              await handler(req, res);
            }
          } catch (err) {
            console.error('[API Dev Middleware Error]:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
          }
          return;
        }
        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables (including server secrets like RESEND_API_KEY) into process.env
  const env = loadEnv(mode, process.cwd(), '');
  process.env = { ...process.env, ...env };

  return {
    plugins: [
      react(),
      tailwindcss(),
      apiDevPlugin()
    ],
  };
});

