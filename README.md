# Sacajawea 

[![Build Status](https://travis-ci.org/Palmabit-IT/Sacajawea.svg?branch=master)](https://travis-ci.org/Palmabit-IT/Sacajawea) [![GitHub version](https://badge.fury.io/gh/palmabit-IT%2FSacajawea.svg)](https://badge.fury.io/gh/palmabit-IT%2FSacajawea)
![npm](https://img.shields.io/npm/dm/localeval.svg) [![Coverage Status](https://coveralls.io/repos/github/Palmabit-IT/Sacajawea/badge.svg?branch=master)](https://coveralls.io/github/Palmabit-IT/Sacajawea?branch=master)

## Manage your multi-language routes with Next.js, easily

Based on [Next-Routes](https://github.com/fridays/next-routes) and [next-routes-with-locale](https://github.com/vonschau/next-routes-with-locale) the main changes is:
* Ability to add routes by forcing the presence of the initial language of the route
* Improved route management
* improved coverage and tests


In the future I will want to implement:
+ handle error with exact status code 
+ route middleware
+ static seo files (robots.txt, google verification file, etc)

## How to use

### Install

```bash
npm install @palmabit/sacajawea --save
```

### Create `routes.js` inside your project:

```javascript
const routes = require('@palmabit/sacajawea ')({ locale: 'en', forceLocale: true, siteCanonicalUrl: ‘https://www.example.com' })
```
when: 

 * **locale** is the default language
 * **forceLocale** force all route to have locale on initial path
 * **siteUrl** URL site 
 
 
```javascript
routes
.add('about', 'en', '/about')
.add('about', 'it', '/chi-siamo')
.add('news', 'en','/news/:slug', 'news-detail')
.add('news', 'it','/notizia/:slug', 'news-detail')
.add('contacts', 'en','/contacts', 'contacts-page', {email:'foo@bar.it'})
.add('contacts', 'it','/contattaci', 'contact-page', {email:'foo@bar.it'})

.add('pages', 'it','/(.*)/:slug', 'dynamic-page', {}, true)
...
```

### Set routes handler on `server.js` file

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

### Now create you page react component

If you route have match parameter on URL, all data is merged info `query`. Available inside `getInitialProps ` function

> **RequestHandler automatically sets the local inside of req.locale**
```javascript
export default class News extends React.Component {
  static async getInitialProps ({query, req, res}) {
    // query.slug
    // req.locale
  }
  render () {
    // this.props.url.query.slug
  }
}
```

## ROUTES API

### `routes.add`
This function add a new route

| name  | is required  | example  | note  |
| ------------ | ------------ | ------------ | ------------ |
|  **`name`** | √  | `home`  | name of the route  |
|  **`locale`** |  √ | `it`  | locale of the route. This field must always be added, even if the language of the route is the same as the default language  |
| **`pattern`** | √  | `/en/news/:slug`  | Route pattern (see [path-to-regexp](https://github.com/pillarjs/path-to-regexp)) to know the right way to build perfect route  |
| **`data`**  | X  | ` { foo: 'bar' } `  | Custom data object  |
| **`update`**  | X  | ` true `  |  update route with the same name and locale |

### `routes.setLocale`

This function changes the default locale 
```javascript
    const routes = sacajawea({ locale: 'it' })
    console.log(routes.locale) // it
    routes.setLocale('fr')
    console.log(routes.locale) // fr
```

### `routes.findByName`
Search route by name and locale

| name  | is required  | example  | note  |
| ------------ | ------------ | ------------ | ------------ |
|  **`name`** | √  | `home`  | name of the route you want to search |
|  **`locale`** |  X | `it`  | locale of the route searched. This field is optional, if it is not used, the default language is used   |

Return **route object** or **false** if route not exist

### `routes.findAndGetUrls`
This function works similarly to "findByName", but in addition to return, the route object also returns a second object that contains the url of the searched route. However, if this route is not found, an exception is thrown

| name  | is required  | example  | note  |
| ------------ | ------------ | ------------ | ------------ |
|  **`name`** | √  | `home`  | name of the route you want to search |
|  **`locale`** |  X | `it`  | locale of the route searched. This field is optional, if it is not used, the default language is used   |
|  **`params`** |  X | `{}`  | Any parameters to be passed to the route   |

## `Link` component

```jsx
// pages/index.js
import {Link} from '../routes'

export default () => (
  <div>
    <div>Welcome to Next.js!</div>
    <Link route='blog' params={{slug: 'hello-world'}}>
      <a>Hello world</a>
    </Link>
    or
    <Link route='/blog/hello-world' locale=“it”>
      <a>Hello world</a>
    </Link>
  </div>
)
```


Props:

- `route` - Route name or URL to match (alias: `to`)
- `params` - Optional parameters for named routes
- `locale` - locale of route  

It generates the URLs for `href` and `as` and renders `next/link`. Other props like `prefetch` will work as well.

## `Router` component

```jsx
// pages/blog.js
import React from 'react'
import {Router} from '../routes'

export default class Blog extends React.Component {
  handleClick () {
    // With route name and params
    Router.pushRoute('blog', {slug: 'hello-world'})
    // With route URL
    Router.pushRoute('/blog/hello-world')
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

- `Router.pushRoute(route)`
- `Router.pushRoute(route, params)`
- `Router.pushRoute(route, params, locale)`
- `Router.pushRoute(route, params, locale, options)`

Arguments:

- `route` - Route name or URL to match
- `params` - Optional parameters for named routes
- `locale` - Route locale
- `options` - Passed to Next.js

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

---

##SEO

Sacajawea, from version 2, implements a helper able to automatically generate:

* `title`
* `description`
* `canonical`
* `og:title`
* `og:description`
* `og:locale`
* `og:url`
* `twitter:title`
* `twitter:description`
* hreflang links for the same route

To implement this wrap your component into hoc component

```javascript
import { WithSeo } from '@palmabit/sacajawea'

export default WithSeo(YourComponentPage)
```

after this into *props* you can found a `SeoComponent`

We suggest to use [react-helmet](https://github.com/nfl/react-helmet) for a better integration 

```javascript

render() {
    const { SeoComponent } = this.props
    
    return (
    <Helmet>
	    <title>foo</title>
	    <SeoComponent title=“foo” description=“bar” />
    </Helmet>
    )
}
```