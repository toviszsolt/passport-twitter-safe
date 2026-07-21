import * as url from 'node:url';
import merge from '../util/merge.js';
import Strategy from '../util/Strategy.js';
import { OAuthClient } from './client.js';
import { InternalOAuthError } from './errors/internaloautherror.js';
import { originalURL } from './utils.js';

export class OAuthStrategy extends Strategy {
  constructor(options, verify) {
    if (typeof options === 'function') {
      verify = options;
      options = undefined;
    }
    options = options || {};
    if (!verify) throw new TypeError('OAuthStrategy requires a verify callback');
    if (!options.requestTokenURL) throw new TypeError('OAuthStrategy requires a requestTokenURL option');
    if (!options.accessTokenURL) throw new TypeError('OAuthStrategy requires a accessTokenURL option');
    if (!options.userAuthorizationURL) throw new TypeError('OAuthStrategy requires a userAuthorizationURL option');
    if (!options.consumerKey) throw new TypeError('OAuthStrategy requires a consumerKey option');
    if (options.consumerSecret === undefined) throw new TypeError('OAuthStrategy requires a consumerSecret option');
    super();
    this.name = 'oauth';
    this._verify = verify;
    this._passReqToCallback = options.passReqToCallback ?? false;
    this._skipUserProfile = options.skipUserProfile ?? false;
    this._key = options.sessionKey || 'oauth';
    this._trustProxy = options.proxy;
    this._userAuthorizationURL = options.userAuthorizationURL;
    this._callbackURL = options.callbackURL;
    this._oauth = new OAuthClient({
      requestTokenURL: options.requestTokenURL,
      accessTokenURL: options.accessTokenURL,
      consumerKey: options.consumerKey,
      consumerSecret: options.consumerSecret,
      signatureMethod: options.signatureMethod || 'HMAC-SHA1',
      callbackURL: options.callbackURL,
      customHeaders: options.customHeaders,
    });
  }

  authenticate(req, options) {
    options = options || {};
    const self = this;

    if (req.query && req.query.oauth_token) {
      const oauthToken = req.query.oauth_token;
      const oauthTokenSecret = req.session?.[this._key]?.requestTokenSecret;
      if (!oauthTokenSecret) return self.fail({ message: 'Missing request token secret' }, 403);
      const oauthVerifier = req.query.oauth_verifier || null;

      self._oauth.getOAuthAccessToken(
        oauthToken,
        oauthTokenSecret,
        oauthVerifier,
        (err, token, tokenSecret, params) => {
          if (err) return self.error(self._createOAuthError('Failed to obtain access token', err));
          if (req.session?.[this._key]) delete req.session[this._key].requestTokenSecret;

          self._loadUserProfile(token, tokenSecret, params, (err2, profile) => {
            if (err2) return self.error(err2);

            function verified(err3, user, info) {
              if (err3) return self.error(err3);
              if (!user) return self.fail(info);
              self.success(user, info || {});
            }

            try {
              if (self._passReqToCallback) {
                if (self._verify.length === 6) self._verify(req, token, tokenSecret, params, profile, verified);
                else self._verify(req, token, tokenSecret, profile, verified);
              } else {
                if (self._verify.length === 5) self._verify(token, tokenSecret, params, profile, verified);
                else self._verify(token, tokenSecret, profile, verified);
              }
            } catch (ex) {
              self.error(ex);
            }
          });
        },
      );
    } else {
      const params = this.requestTokenParams(options);
      let callbackURL = options.callbackURL || this._callbackURL;
      if (callbackURL) {
        const parsed = url.parse(callbackURL);
        if (!parsed.protocol) callbackURL = url.resolve(originalURL(req, { proxy: this._trustProxy }), callbackURL);
      }
      params.oauth_callback = callbackURL;

      this._oauth.getOAuthRequestToken(params, (err, token, tokenSecret, params2) => {
        if (err) return self.error(self._createOAuthError('Failed to obtain request token', err));
        if (!req.session) return self.error(new Error('OAuth authentication requires session support'));
        if (!req.session[this._key]) req.session[this._key] = {};
        req.session[this._key].requestTokenSecret = tokenSecret;
        const parsed = url.parse(self._userAuthorizationURL, true);
        parsed.query.oauth_token = token;
        if (!params2.oauth_callback_confirmed && callbackURL) parsed.query.oauth_callback = callbackURL;
        merge(parsed.query, self.userAuthorizationParams(options));
        delete parsed.search;
        self.redirect(url.format(parsed));
      });
    }
  }

  userProfile(token, tokenSecret, params, done) {
    return done(null, {});
  }

  requestTokenParams(options) {
    return {};
  }

  userAuthorizationParams(options) {
    return {};
  }

  parseErrorResponse(body, status) {
    return null;
  }

  _loadUserProfile(token, tokenSecret, params, done) {
    if (typeof this._skipUserProfile === 'function') {
      return this._skipUserProfile(token, tokenSecret, (err, skip) => {
        if (err) return done(err);
        if (skip) return done(null, {});
        this.userProfile(token, tokenSecret, params, done);
      });
    }
    if (this._skipUserProfile) return done(null, {});
    this.userProfile(token, tokenSecret, params, done);
  }

  _createOAuthError(message, err) {
    let e;
    if (err.statusCode && err.data) {
      try {
        e = this.parseErrorResponse(err.data, err.statusCode);
      } catch (_) {}
    }
    if (!e) e = new InternalOAuthError(message, err);
    return e;
  }
}
