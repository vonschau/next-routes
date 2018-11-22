# Dynamic Routes with localization for Next.js

Based on [Next-Routes](https://github.com/fridays/next-routes) with these changes:

- No support for unnamed routes
- Route can be added only by name, locale and pattern (and optionally page) or options object
- `Link` and `Router` generate URLs only by route definition (name + params)
- Routes can have data object (if you generate routes dynamically you can pass custom data there)

## How to use

Install:

```bash
yarn add @join-com/next-routes-with-locale
```

Create `routes.js` inside your project:

```typescript
import nextRoutes from 'next-routes-with-locale'

const routes = nextRoutes({ locale: 'en' })

routes
.add('about', 'en', '/about')
.add('blog', 'en', '/blog/:slug')
.add('blog', 'en', '/blog/:slug', {myCustom: 'data'})
.add('user', 'en', '/user/:id', 'profile', {myCustom: 'data'})
.add({name: 'beta', locale: 'en', pattern: '/v3', page: 'v3'})
.add('about', 'cs', '/o-projektu')
.add('blog', 'cs', '/blog/:slug')
.add('user', 'cs', '/uzivatel/:id', 'profile')
.add({name: 'beta', locale: 'cs', pattern: '/v3', page: 'v3'})
```

This file is used both on the server and the client.

API:

- `routes.add(name, locale, pattern = /name, page = name, data)`
- `routes.add(object)`

Arguments:

- `name` - Route name
- `locale` - Locale of the route
- `pattern` - Route pattern (like express, see [path-to-regexp](https://github.com/pillarjs/path-to-regexp))
- `page` - Page inside `./pages` to be rendered; can be ommited
- `data` - Custom data object

The page component receives the matched URL parameters merged into `query`

```typescript
export default class Blog extends React.Component {
  static async getInitialProps ({query}) {
    // query.slug
  }
  render () {
    // this.props.url.query.slug
  }
}
```

## On the server

```typescript
// server.js
const next = require('next')
const routes = require('./routes')
const app = next({dev: process.env.NODE_ENV !== 'production'})
const handler = routes.getRequestHandler(app)

// With express
const express = require('express')
app.prepare().then(() => {
  express().use(handler).listen(3000)
})

// Without express
const {createServer} = require('http')
app.prepare().then(() => {
  createServer(handler).listen(3000)
})
```

> RequestHandler automatically sets req.locale to locale of matched route so you can use it in your app.

Optionally you can pass a custom handler, for example:

```javascript
const handler = routes.getRequestHandler(app, ({req, res, route, query}) => {
  app.render(req, res, route.page, query)
})
```

Make sure to use `server.js` in your `package.json` scripts:

```json
"scripts": {
  "dev": "node server.js",
  "build": "next build",
  "start": "NODE_ENV=production node server.js"
}
```

## On the client

Import `Link` and `Router` from your `routes.js` file to generate URLs based on route definition:

### `Link` example

```tsx
// pages/index.js
import {Link} from '../routes'

export default () => (
  <div>
    <div>Welcome to Next.js!</div>
    <Link href='blog' params={{slug: 'hello-world'}}>
      <a>Hello world</a>
    </Link>
    or
    <Link href='blog' locale='cs' params={{slug: 'ahoj-svete'}}>
      <a>Hello world</a>
    </Link>
  </div>
)
```

API:

- `<Link href='name'>...</Link>`
- `<Link href='name' locale='locale'>...</Link>`
- `<Link href='name' params={params}> ... </Link>`
- `<Link href='name' locale='locale' params={params}> ... </Link>`

Props:

- `route` - Route name or URL to match (alias: `to`)
- `params` - Optional parameters for named routes

It generates the URLs for `href` and `as` and renders `next/link`. Other props like `prefetch` will work as well.

### `Router` example

```tsx
// pages/blog.js
import React from 'react'
import {Router} from '../routes'

export default class Blog extends React.Component {
  handleClick () {
    // With route name and params
    Router.pushRoute('blog', {slug: 'hello-world'})
    // With route name and params and explicit locale
    Router.pushRoute('blog', {slug: 'hello-world'}, 'en')
  }
  render () {
    return (
      <div>
        <div>{this.props.url.query.slug}</div>
        <button onClick={this.handleClick}>Home</button>
      </div>
    )
  }
}
```

API:

- `Router.pushRoute(route, params)` - automatically get current locale
- `Router.pushRoute(route, params, locale)`
- `Router.pushRoute(route, params, locale, options)`

Arguments:

- `route` - Route name
- `locale` - Route locale
- `params` - Optional parameters for named routes
- `options` - Passed to Next.js

The same works with `.replaceRoute()` and `.prefetchRoute()`

It generates the URLs and calls `next/router`

---

##### Related links

- [zeit/next.js](https://github.com/zeit/next.js) - Framework for server-rendered React applications
- [path-to-regexp](https://github.com/pillarjs/path-to-regexp) - Express-style path to regexp
