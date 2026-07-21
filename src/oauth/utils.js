export function originalURL(req, options) {
  options = options || {};
  const protocol = (() => {
    if (options.proxy && req.headers['x-forwarded-proto']) return req.headers['x-forwarded-proto'].split(',')[0].trim();
    if (req.connection?.encrypted) return 'https';
    if (req.protocol) return req.protocol;
    return 'http';
  })();
  const host = (() => {
    if (options.proxy && req.headers['x-forwarded-host']) return req.headers['x-forwarded-host'].split(',')[0].trim();
    return req.headers['host'] || 'localhost';
  })();
  return protocol + '://' + host + (req.originalUrl || req.url || '/');
}
