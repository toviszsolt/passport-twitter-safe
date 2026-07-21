export class InternalOAuthError extends Error {
  constructor(message, err) {
    super(message);
    this.name = 'InternalOAuthError';
    this.oauthError = err;
  }
}
