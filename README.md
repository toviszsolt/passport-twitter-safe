[![license](https://img.shields.io/npm/l/passport-twitter-safe.svg)](https://github.com/toviszsolt/passport-twitter-safe/blob/main/LICENSE) [![npm version](https://img.shields.io/npm/v/passport-twitter-safe.svg)](https://www.npmjs.com/package/passport-twitter-safe) [![GitHub Repo stars](https://img.shields.io/github/stars/toviszsolt/passport-twitter-safe?color=DAAA3F)](https://github.com/toviszsolt/passport-twitter-safe/stargazers) [![bundle size](https://img.shields.io/bundlephobia/minzip/passport-twitter-safe)](https://bundlephobia.com/result?p=passport-twitter-safe) [![Run tests](https://github.com/toviszsolt/passport-twitter-safe/actions/workflows/main.yaml/badge.svg)](https://github.com/toviszsolt/passport-twitter-safe/actions/workflows/main.yaml) [![Sponsor](https://img.shields.io/static/v1?label=sponsor&message=❤&color=ff69b4)](https://github.com/sponsors/toviszsolt)

# passport-twitter-safe

**Zero-dependency, ultra tiny (~3KB gzipped) and SAFE reimplementation of `passport-twitter`.** Built-in OAuth 1.0a client, no external runtime dependencies, dual ESM/CJS.

---

## Why this package exists

The original [`passport-twitter`](https://github.com/jaredhanson/passport-twitter) has **8 known vulnerabilities** (2 moderate, 5 high, 1 critical) through its transitive dependency chain:

```
passport-twitter → xtraverse → xmldom
```

The [`xmldom`](https://www.npmjs.com/package/xmldom) package is effectively **unmaintained** — most of these vulnerabilities have no patch available. On top of that, the whole dependency chain relies on several abandoned or deprecated packages:

- [`oauth`](https://www.npmjs.com/package/oauth) — unmaintained, uses deprecated `node-uuid`
- [`passport-strategy`](https://www.npmjs.com/package/passport-strategy) — abandoned base class
- [`xtraverse`](https://www.npmjs.com/package/xtraverse) — pulls in `xmldom` for XML parsing that Twitter's JSON API doesn't even need

`passport-twitter-safe` is a **clean-room reimplementation** of the same API that:

- **Zero runtime dependencies** — the OAuth 1.0a client is implemented with Node.js built-in modules only (`crypto`, `http`, `https`, `url`, `querystring`)
- **Self-contained `Strategy` base class** — no external `passport-strategy` dependency
- **First-class Dual Build** — native ESM (`.mjs`) and CommonJS (`.cjs`) outputs
- **TypeScript declarations** included out of the box
- **Ultra lightweight** — ~3 KB gzipped

The public API is 100% compatible with `passport-twitter`. Replace one line in your imports and everything works the same — but your dependency tree stays clean.

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

#### ES Module (ESM / TypeScript / .mjs):

```js
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

#### CommonJS (CJS / .cjs):

```js
const TwitterStrategy = require('passport-twitter-safe');
// or: const TwitterStrategy = require('passport-twitter-safe').Strategy;

passport.use(new TwitterStrategy({ ... }, verifyCallback));
```

### Express routes

```js
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
// ESM / TypeScript / .mjs
- import TwitterStrategy from 'passport-twitter';
+ import TwitterStrategy from 'passport-twitter-safe';

// CommonJS / .cjs
- const TwitterStrategy = require('passport-twitter').Strategy;
+ const TwitterStrategy = require('passport-twitter-safe').Strategy;
// (Direct require works too: const TwitterStrategy = require('passport-twitter-safe'))
```

## Guidelines

See [Code of Conduct](./CODE_OF_CONDUCT.md), [Contributing](./CONTRIBUTING.md), and [Security Policy](./SECURITY.md).

## License

MIT License © 2026 [Zsolt Tövis](https://github.com/toviszsolt)

---

If you find this project useful, please consider sponsoring me by: [Donate&nbsp;via&nbsp;GitHub](https://github.com/sponsors/toviszsolt) / [Donate&nbsp;via&nbsp;PayPal](https://www.paypal.com/paypalme/toviszsolt) / [Give&nbsp;the&nbsp;repo&nbsp;a&nbsp;Star](https://github.com/toviszsolt/passport-twitter-safe) / [Follow&nbsp;me&nbsp;on&nbsp;GitHub](https://github.com/toviszsolt)

Made with ❤️ for developers who love lightweight builds and zero supply-chain drama.
