# passport-twitter-safe

**Zero-dependency and SAFE reimplementation of `passport-twitter`.** Built-in OAuth 1.0a client, no external runtime dependencies, dual ESM/CJS.

---

## Why this package exists

The original [`passport-twitter`](https://github.com/jaredhanson/passport-twitter) depends on the [`oauth`](https://www.npmjs.com/package/oauth) package — a widely used but **unmaintained** library with several known issues:

- Uses the deprecated `node-uuid` internally
- Relies on the abandoned `passport-strategy` base class
- Pulls in transitive dependencies that trigger security scanners (even if not exploitable)
- No native ESM support, no tree-shakeable bundle

`passport-twitter-safe` is a **clean-room reimplementation** of the same API that:

- **Zero runtime dependencies** — the OAuth 1.0a client is implemented with Node.js built-in modules only (`crypto`, `http`, `https`, `url`, `querystring`)
- **Self-contained `Strategy` base class** — no external `passport-strategy` dependency
- **Dual format** — ESM (`dist/passport.js`) and CJS (`dist/passport.cjs`)
- **TypeScript declarations** included
- **~16 KB** bundle, fully auditable source

The public API is identical to `passport-twitter`. Replace one line in your imports and everything works the same — but your dependency tree stays clean.

---

## Sponsoring

If you find this project useful, please consider sponsoring me by:

[Donate&nbsp;via&nbsp;GitHub](https://github.com/sponsors/toviszsolt) | [Donate&nbsp;via&nbsp;PayPal](https://www.paypal.com/paypalme/toviszsolt) | [Give&nbsp;the&nbsp;repo&nbsp;a&nbsp;Star](https://github.com/toviszsolt/passport-twitter-safe) | [Follow&nbsp;me&nbsp;on&nbsp;GitHub](https://github.com/toviszsolt)

---

## Install

```sh
npm install passport-twitter-safe
```

```sh
yarn add passport-twitter-safe
```

---

## Usage

### Configure strategy

```ts
import TwitterStrategy from 'passport-twitter-safe';

passport.use(
  new TwitterStrategy(
    {
      consumerKey: process.env.TWITTER_API_KEY,
      consumerSecret: process.env.TWITTER_API_SECRET,
      callbackURL: 'http://localhost:3000/auth/twitter/callback',
      includeEmail: true,
    },
    (token, tokenSecret, profile, done) => {
      User.findOrCreate({ twitterId: profile.id }, done);
    },
  ),
);
```

### Express routes

```ts
app.get('/auth/twitter', passport.authenticate('twitter'));

app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }), (req, res) =>
  res.redirect('/'),
);
```

---

## API

### `TwitterStrategy(options, verify)`

| Option              | Type      | Default | Description               |
| ------------------- | --------- | ------- | ------------------------- |
| `consumerKey`       | `string`  | —       | Twitter API Key           |
| `consumerSecret`    | `string`  | —       | Twitter API Secret        |
| `callbackURL`       | `string`  | —       | OAuth callback URL        |
| `includeEmail`      | `boolean` | `false` | Request email address     |
| `forceLogin`        | `boolean` | `false` | Force re-authentication   |
| `screenName`        | `string`  | —       | Pre-fill login screen     |
| `skipUserProfile`   | `boolean` | `false` | Skip profile fetch        |
| `userProfileURL`    | `string`  | —       | Override profile endpoint |
| `customHeaders`     | `object`  | `{}`    | Extra request headers     |
| `passReqToCallback` | `boolean` | `false` | Pass `req` to verify      |
| _(and more)_        |           |         | See the TypeScript types  |

### `TwitterProfile`

```ts
{
  id: string;
  username?: string;
  displayName?: string;
  provider: 'twitter';
  emails?: Array<{ value: string }>;
  photos?: Array<{ value: string }>;
  _raw?: string;
  _json?: any;
  _accessLevel?: string;
}
```

---

## Migrating from `passport-twitter`

```diff
- import TwitterStrategy from 'passport-twitter';
+ import TwitterStrategy from 'passport-twitter-safe';

// — or —
- const TwitterStrategy = require('passport-twitter').Strategy;
+ const TwitterStrategy = require('passport-twitter-safe').Strategy;

// Everything else stays the same.
```

## Guidelines

See [Code of Conduct](./CODE_OF_CONDUCT.md), [Contributing](./CONTRIBUTING.md), and [Security Policy](./SECURITY.md).

## License

MIT License © 2026 [Zsolt Tövis](https://github.com/toviszsolt)

---

If you find this project useful, please consider sponsoring me by: [Donate&nbsp;via&nbsp;GitHub](https://github.com/sponsors/toviszsolt) / [Donate&nbsp;via&nbsp;PayPal](https://www.paypal.com/paypalme/toviszsolt) / [Give&nbsp;the&nbsp;repo&nbsp;a&nbsp;Star](https://github.com/toviszsolt/passport-twitter-safe) / [Follow&nbsp;me&nbsp;on&nbsp;GitHub](https://github.com/toviszsolt)

Made with ❤️ for developers who love lightweight builds and zero supply-chain drama.
