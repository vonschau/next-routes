# Sacajawea 

## Manage your multi-language routes with Next.js, easily

Based on [Next-Routes](https://github.com/fridays/next-routes) and [next-routes-with-locale](https://github.com/vonschau/next-routes-with-locale) with possibility to add routes with the same name but different for locale/pattern 

In the future I will want to implement:
+ handle error with exact status code 
+ route middleware

## How to use

Install:

```bash
npm install sacajawea --save
```

Create `routes.js` inside your project:

```javascript
const routes = require('sacajawea ')({ locale: 'en' }) // this locale is the default language

routes
.add('about', 'en', '/about')
.add('about', 'it', '/chi-siamo')
.add('news', 'en','/news/:slug', 'news-detail')
.add('news', 'it','/notizia/:slug', 'news-detail')
...
```


## Server-side

```javascript
// server.js
const next = require('next')
const routes = require('./routes')
const app = next({dev: process.env.NODE_ENV !== 'production'})
const handler = routes.getRequestHandler(app)

// With express -- RECOMMENDED
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


## Client-side

Import `Link` and `Router` from your `routes.js` file to generate URLs based on route definition:

### `Link`

```jsx
// pages/index.js
import {Link} from '../routes'

export default () => (
  <div>
    <div>Hi, Sacajawea!</div>
    <Link href='news' locale='en' params={{slug: 'do-you-need-directions'}}>
      <a>Please, show me the right way</a>
    </Link>
  </div>
)
```

##API

###`routes.add`
This function add a new route

| name  | is required  | example  | note  |
| ------------ | ------------ | ------------ | ------------ |
|  **`name`** | √  | `home`  | name of the route  |
|  **`locale`** |  √ | `it`  | locale of the route. This field must always be added, even if the language of the route is the same as the default language  |
| **`pattern`** | √  | `/en/news/:slug`  | Route pattern (see [path-to-regexp](https://github.com/pillarjs/path-to-regexp)) to know the right way to build perfect route  |
| **`data`**  | X  | ` { foo: 'bar' } `  | Custom data object  |

If you route have match parameter on URL, all data is merged info `query`. Available inside `getInitialProps ` function

```javascript
export default class News extends React.Component {
  static async getInitialProps ({query}) {
    // query.slug
  }
  render () {
    // this.props.url.query.slug
  }
}
```

> **RequestHandler automatically sets req.locale to a locale of a matched route so you can use it in your app.**


### `Router` example

```jsx
// pages/home.js
import React from 'react'
import {Router} from '../routes'

export default class Home extends React.Component {
  onClick () {
    // With route name and params -- automaritically get current locale
    Router.pushRoute('news', {slug: 'hi-world'})
    // With route name and params and explicit locale
    Router.pushRoute('news', {slug: 'hi-world'}, 'en')
  }
  render () {
    return (
      <div>
        <button onClick={this.onClick}>News</button>
      </div>
    )
  }
}
```
Arguments:

| name  | is required  | example  | note  |
| ------------ | ------------ | ------------ | ------------ |
|  **`route`** | √  | `news`  | route name  |
|  **`locale`** | √  | `it`  | route locale  |
|  **`params`** | X  | `{slug: 'hi-world'}`  | optional parameters for named routes  |


- `route` - Route name
- `locale` - Route locale
- `params` - Optional parameters for named routes

The same works with `.replaceRoute()` and `.prefetchRoute()`

It generates the URLs and calls `next/router`

---

Optionally you can provide custom `Link` and `Router` objects, for example:

```javascript
const routes = module.exports = require('next-routes')({
  Link: require('./my/link')
  Router: require('./my/router')
})
```