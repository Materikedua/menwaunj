export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(503).json({ code: 'REGISTRY_NOT_CONFIGURED', error: 'Registri terkelola belum dikonfigurasi.' });
}
