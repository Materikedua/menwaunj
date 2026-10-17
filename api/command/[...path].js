// Fail closed: the local SQLite service cannot use ephemeral serverless disks.
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(503).json({
    code: 'COMMAND_BACKEND_NOT_CONFIGURED',
    error: 'Command Center belum diaktifkan pada lingkungan ini. Hubungi pengelola untuk konfigurasi layanan.',
  });
}
