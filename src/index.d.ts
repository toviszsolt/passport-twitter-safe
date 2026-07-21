import { IncomingMessage } from 'http';

/**
 * Options for configuring the Twitter strategy.
 *
 * @param consumerKey  - Twitter API consumer key (API Key).
 * @param consumerSecret  - Twitter API consumer secret (API Secret).
 * @param callbackURL  - URL to which Twitter redirects after authorization.
 * @param requestTokenURL  - Override the request token endpoint.
 * @param accessTokenURL  - Override the access token endpoint.
 * @param userAuthorizationURL  - Override the user authorization endpoint.
 * @param sessionKey  - Session key for storing temporary OAuth data.
 * @param userProfileURL  - Override the user profile endpoint.
 * @param skipExtendedUserProfile  - Skip fetching extended profile data.
 * @param includeEmail  - Request email address from the user.
 * @param includeStatus  - Include user's current status in the profile.
 * @param includeEntities  - Include entities data in the profile.
 * @param passReqToCallback  - Pass the HTTP request object to the verify callback.
 * @param proxy  - Use a proxy for outbound requests.
 * @param skipUserProfile  - Skip fetching the user profile entirely.
 * @param signatureMethod  - OAuth signature method (default: HMAC-SHA1).
 * @param customHeaders  - Additional headers to send with outbound requests.
 * @param forceLogin  - Force the user to re-authenticate.
 * @param screenName  - Pre-fill the Twitter login screen with a specific username.
 */
export interface TwitterStrategyOptions {
  consumerKey: string;
  consumerSecret: string;
  callbackURL: string;
  requestTokenURL?: string;
  accessTokenURL?: string;
  userAuthorizationURL?: string;
  sessionKey?: string;
  userProfileURL?: string;
  skipExtendedUserProfile?: boolean;
  includeEmail?: boolean;
  includeStatus?: boolean;
  includeEntities?: boolean;
  passReqToCallback?: boolean;
  proxy?: boolean;
  skipUserProfile?: boolean;
  signatureMethod?: string;
  customHeaders?: Record<string, string>;
  forceLogin?: boolean;
  screenName?: string;
}

/**
 * Verify callback used when `passReqToCallback` is `false`.
 *
 * @param token  - OAuth access token.
 * @param tokenSecret  - OAuth access token secret.
 * @param profile  - User profile returned by Twitter.
 * @param done  - Passes the authenticated user (or an error) to Passport.
 */
export type TwitterVerifyFunction = (
  token: string,
  tokenSecret: string,
  profile: TwitterProfile,
  done: (err: any, user?: any, info?: any) => void,
) => void;

/**
 * Verify callback used when `passReqToCallback` is `true`.
 *
 * @param req  - The incoming HTTP request.
 * @param token  - OAuth access token.
 * @param tokenSecret  - OAuth access token secret.
 * @param profile  - User profile returned by Twitter.
 * @param done  - Passes the authenticated user (or an error) to Passport.
 */
export type TwitterVerifyFunctionWithRequest = (
  req: IncomingMessage,
  token: string,
  tokenSecret: string,
  profile: TwitterProfile,
  done: (err: any, user?: any, info?: any) => void,
) => void;

/**
 * The shape of a Twitter user profile as returned by the Verify Credentials
 * endpoint.
 *
 * @param id  - Twitter numeric user ID (string).
 * @param username  - Twitter screen name (@handle).
 * @param displayName  - Display name shown on the profile.
 * @param provider  - Always `"twitter"`.
 * @param emails  - Verified email addresses (only present when `includeEmail` is set).
 * @param photos  - Profile images.
 * @param _raw  - Raw JSON response body from the Twitter API.
 * @param _json  - Parsed JSON response body.
 * @param _accessLevel  - Access level of the token used.
 */
export interface TwitterProfile {
  id: string;
  username?: string;
  displayName?: string;
  provider: string;
  emails?: Array<{ value: string }>;
  photos?: Array<{ value: string }>;
  _raw?: string;
  _json?: any;
  _accessLevel?: string;
}

/**
 * Twitter OAuth 1.0a authentication strategy for Passport.
 *
 * Authenticates requests using a Twitter application via OAuth 1.0a.
 * The strategy requires a `verify` callback which receives the access token,
 * token secret, and Twitter profile, and must call `done` with the
 * authenticated user.
 *
 * @example
 * ```ts
 * import TwitterStrategy from 'passport-twitter-safe';
 *
 * passport.use(new TwitterStrategy({
 *   consumerKey: TWITTER_API_KEY,
 *   consumerSecret: TWITTER_API_SECRET,
 *   callbackURL: 'http://localhost:3000/auth/twitter/callback',
 *   includeEmail: true,
 * }, (token, tokenSecret, profile, done) => {
 *   User.findOrCreate({ twitterId: profile.id }, done);
 * }));
 * ```
 */
declare class TwitterStrategy {
  /** Reference to the TwitterStrategy constructor itself. */
  static Strategy: typeof TwitterStrategy;

  /**
   * Create a new TwitterStrategy instance.
   *
   * @param options  Configuration options.
   * @param verify  Verify callback — either with or without the request object,
   *                depending on the value of `passReqToCallback`.
   */
  constructor(options: TwitterStrategyOptions, verify: TwitterVerifyFunction | TwitterVerifyFunctionWithRequest);

  /** The name Passport uses to identify this strategy. */
  name: 'twitter';

  /**
   * Authenticate an incoming request.
   *
   * Passport calls this method automatically. Do not invoke directly.
   *
   * @param req  The incoming HTTP request.
   * @param options  Optional authentication overrides.
   */
  authenticate(req: IncomingMessage, options?: any): void;

  /**
   * Fetch the Twitter profile associated with the given access token.
   *
   * Called internally during authentication. May be overridden for custom
   * profile fetching logic.
   *
   * @param token  OAuth access token.
   * @param tokenSecret  OAuth access token secret.
   * @param params  Additional parameters forwarded to the API call.
   * @param done  Completion callback receiving an error or the profile.
   */
  userProfile(
    token: string,
    tokenSecret: string,
    params: any,
    done: (err: any, profile?: TwitterProfile) => void,
  ): void;
}

/**
 * Default export: the TwitterStrategy class.
 *
 * @example
 * ```ts
 * import TwitterStrategy from 'passport-twitter-safe';
 * ```
 */
export default TwitterStrategy;

/**
 * Named export: also the TwitterStrategy class (reference-equal to the default).
 *
 * @example
 * ```ts
 * import { Strategy } from 'passport-twitter-safe';
 * ```
 */
export { TwitterStrategy as Strategy };
