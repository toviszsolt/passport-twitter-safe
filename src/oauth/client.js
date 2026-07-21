import crypto from 'crypto';
import http from 'http';
import https from 'https';
import * as url from 'node:url';
import querystring from 'querystring';

const NONCE_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function getTimestamp() {
  return Math.floor(Date.now() / 1000);
}

function getNonce(size) {
  let result = '';
  for (let i = 0; i < size; i++) {
    result += NONCE_CHARS[Math.floor(Math.random() * NONCE_CHARS.length)];
  }
  return result;
}

function encodeData(str) {
  if (!str) return '';
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A');
}

function normalizeUrl(requestUrl) {
  const parsed = url.parse(requestUrl);
  let port = '';
  if (parsed.port) {
    if (
      (parsed.protocol === 'http:' && parsed.port !== '80') ||
      (parsed.protocol === 'https:' && parsed.port !== '443')
    ) {
      port = ':' + parsed.port;
    }
  }
  return parsed.protocol + '//' + parsed.hostname + port + (parsed.pathname || '/');
}

function normalizeParams(params) {
  const sorted = Object.keys(params).sort();
  return sorted.map((k) => encodeData(k) + '=' + encodeData(params[k])).join('&');
}

function hmacSha1(key, str) {
  return crypto.createHmac('sha1', key).update(str).digest('base64');
}

export class OAuthClient {
  constructor(options) {
    this._requestUrl = options.requestTokenURL;
    this._accessUrl = options.accessTokenURL;
    this._consumerKey = options.consumerKey;
    this._consumerSecret = encodeData(options.consumerSecret);
    this._version = options.version || '1.0';
    this._signatureMethod = options.signatureMethod || 'HMAC-SHA1';
    this._nonceSize = options.nonceSize || 32;
    this._callbackURL = options.callbackURL || null;
    this._customHeaders = options.customHeaders || {};
  }

  _prepareParams(token, tokenSecret, method, requestUrl, extraParams) {
    const oauthParams = {
      oauth_timestamp: String(getTimestamp()),
      oauth_nonce: getNonce(this._nonceSize),
      oauth_version: this._version,
      oauth_signature_method: this._signatureMethod,
      oauth_consumer_key: this._consumerKey,
    };
    if (token) oauthParams.oauth_token = token;

    const allParams = { ...oauthParams, ...extraParams };

    const parsed = url.parse(requestUrl);
    if (parsed.query) {
      const qs = querystring.parse(parsed.query);
      for (const k in qs) allParams[k] = qs[k];
    }

    const paramStr = normalizeParams(allParams);
    const signatureBase = [method.toUpperCase(), encodeData(normalizeUrl(requestUrl)), encodeData(paramStr)].join('&');
    const key = this._consumerSecret + '&' + (tokenSecret ? encodeData(tokenSecret) : '');
    const signature = hmacSha1(key, signatureBase);

    const ordered = Object.keys(allParams).sort();
    const authHeader =
      'OAuth ' +
      ordered
        .filter((k) => k.startsWith('oauth_'))
        .map((k) => encodeData(k) + '="' + encodeData(allParams[k]) + '"')
        .join(',') +
      ',oauth_signature="' +
      encodeData(signature) +
      '"';

    return authHeader;
  }

  _request(method, requestUrl, token, tokenSecret, extraParams, postBody, cb) {
    const authHeader = this._prepareParams(token, tokenSecret, method, requestUrl, extraParams || {});
    const parsed = url.parse(requestUrl);
    const isHttps = parsed.protocol === 'https:';
    const port = parsed.port || (isHttps ? 443 : 80);
    const path = parsed.pathname + (parsed.query ? '?' + parsed.query : '');

    const headers = {
      ...this._customHeaders,
      Host: parsed.host,
      Authorization: authHeader,
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    if (postBody) {
      headers['Content-Length'] = Buffer.byteLength(postBody);
    } else {
      headers['Content-Length'] = 0;
    }

    const transport = isHttps ? https : http;
    const options = {
      hostname: parsed.hostname,
      port: port,
      path: path,
      method: method,
      headers: headers,
    };

    const req = transport.request(options, (res) => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode <= 299) {
          cb(null, data, res);
        } else if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location) {
          this._request(method, res.headers.location, token, tokenSecret, extraParams, postBody, cb);
        } else {
          cb({ statusCode: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (err) => cb(err));
    if (postBody) req.write(postBody);
    req.end();
  }

  getOAuthRequestToken(extraParams, cb) {
    if (typeof extraParams === 'function') {
      cb = extraParams;
      extraParams = {};
    }
    if (this._callbackURL) extraParams.oauth_callback = this._callbackURL;
    this._request('POST', this._requestUrl, null, null, extraParams, null, (err, data) => {
      if (err) return cb(err);
      const results = querystring.parse(data);
      const token = results.oauth_token;
      const tokenSecret = results.oauth_token_secret;
      delete results.oauth_token;
      delete results.oauth_token_secret;
      cb(null, token, tokenSecret, results);
    });
  }

  getOAuthAccessToken(token, tokenSecret, verifier, cb) {
    const extraParams = verifier ? { oauth_verifier: verifier } : {};
    this._request('POST', this._accessUrl, token, tokenSecret, extraParams, null, (err, data) => {
      if (err) return cb(err);
      const results = querystring.parse(data);
      const accessToken = results.oauth_token;
      const accessTokenSecret = results.oauth_token_secret;
      delete results.oauth_token;
      delete results.oauth_token_secret;
      cb(null, accessToken, accessTokenSecret, results);
    });
  }

  get(url, token, tokenSecret, cb) {
    this._request('GET', url, token, tokenSecret, {}, null, cb);
  }
}
