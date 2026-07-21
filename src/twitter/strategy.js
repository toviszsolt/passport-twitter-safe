import * as url from 'node:url';
import { OAuthStrategy } from '../oauth/strategy.js';
import { APIError } from './errors/apierror.js';
import { parseProfile } from './profile.js';

export class TwitterStrategy extends OAuthStrategy {
  constructor(options, verify) {
    options = options || {};
    options.requestTokenURL = options.requestTokenURL || 'https://api.twitter.com/oauth/request_token';
    options.accessTokenURL = options.accessTokenURL || 'https://api.twitter.com/oauth/access_token';
    options.userAuthorizationURL = options.userAuthorizationURL || 'https://api.twitter.com/oauth/authenticate';
    options.sessionKey = options.sessionKey || 'oauth:twitter';
    super(options, verify);
    this.name = 'twitter';
    this._userProfileURL = options.userProfileURL || 'https://api.twitter.com/1.1/account/verify_credentials.json';
    this._skipExtendedUserProfile = options.skipExtendedUserProfile ?? false;
    this._includeEmail = options.includeEmail ?? false;
    this._includeStatus = options.includeStatus ?? true;
    this._includeEntities = options.includeEntities ?? true;
  }

  authenticate(req, options) {
    if (req.query && req.query.denied) return this.fail();
    super.authenticate(req, options);
  }

  userProfile(token, tokenSecret, params, done) {
    if (!this._skipExtendedUserProfile) {
      const parsed = url.parse(this._userProfileURL);
      parsed.query = parsed.query || {};
      if (parsed.pathname.endsWith('/users/show.json')) parsed.query.user_id = params.user_id;
      if (this._includeEmail) parsed.query.include_email = true;
      if (!this._includeStatus) parsed.query.skip_status = true;
      if (!this._includeEntities) parsed.query.include_entities = false;
      this._oauth.get(url.format(parsed), token, tokenSecret, (err, body, res) => {
        if (err) {
          let json;
          if (err.data) {
            try {
              json = JSON.parse(err.data);
            } catch (_) {}
          }
          if (json && json.errors && json.errors.length)
            return done(new APIError(json.errors[0].message, json.errors[0].code));
          return done(this._createOAuthError('Failed to fetch user profile', err));
        }
        let json;
        try {
          json = JSON.parse(body);
        } catch (_) {
          return done(new Error('Failed to parse user profile'));
        }
        const profile = parseProfile(json);
        profile.provider = 'twitter';
        profile._raw = body;
        profile._json = json;
        profile._accessLevel = res?.headers?.['x-access-level'] || undefined;
        return done(null, profile);
      });
    } else {
      return done(null, { provider: 'twitter', id: params.user_id, username: params.screen_name });
    }
  }

  userAuthorizationParams(options) {
    const params = {};
    if (options.forceLogin) params.force_login = options.forceLogin;
    if (options.screenName) params.screen_name = options.screenName;
    return params;
  }

  parseErrorResponse(body, status) {
    try {
      const json = JSON.parse(body);
      if (Array.isArray(json.errors) && json.errors.length > 0) return new Error(json.errors[0].message);
    } catch (_) {}
    return null;
  }
}
