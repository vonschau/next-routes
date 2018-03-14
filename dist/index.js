'use strict';

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _jsxFileName = 'src/index.js';

var _pathToRegexp = require('path-to-regexp');

var _pathToRegexp2 = _interopRequireDefault(_pathToRegexp);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _url = require('url');

var _link = require('next/dist/lib/link.js');

var _link2 = _interopRequireDefault(_link);

var _index = require('next/dist/lib/router/index.js');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function (opts) {
  return new Routes(opts);
};

var Routes = function () {
  function Routes() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$Link = _ref.Link,
        Link = _ref$Link === undefined ? _link2.default : _ref$Link,
        _ref$Router = _ref.Router,
        Router = _ref$Router === undefined ? _index2.default : _ref$Router,
        locale = _ref.locale;

    (0, _classCallCheck3.default)(this, Routes);

    this.routes = [];
    this.Link = this.getLink(Link);
    this.Router = this.getRouter(Router);
    this.locale = locale;
  }

  (0, _createClass3.default)(Routes, [{
    key: 'add',
    value: function add(name) {
      var locale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.locale;
      var pattern = arguments[2];
      var page = arguments[3];
      var data = arguments[4];

      var options = void 0;
      if (name instanceof Object) {
        options = name;

        if (!options.name) {
          throw new Error('Unnamed routes not supported');
        }

        name = options.name;

        if (!options.page) {
          options.page = options.name;
        }

        locale = options.locale || this.locale;
      } else {
        if ((typeof page === 'undefined' ? 'undefined' : (0, _typeof3.default)(page)) === 'object') {
          data = page;
          page = name;
        } else {
          page = page || name;
        }

        options = { name: name, locale: locale, pattern: pattern, page: page };

        if (data) {
          options.data = data;
        }
      }

      if (this.findByName(name, locale)) {
        throw new Error('Route "' + name + '" already exists');
      }
      this.routes.push(new Route(options));
      return this;
    }
  }, {
    key: 'setLocale',
    value: function setLocale(locale) {
      this.locale = locale;
    }
  }, {
    key: 'setRoutes',
    value: function setRoutes(routes) {
      var _this = this;

      if (Array.isArray(routes)) {
        this.routes = [];
        routes.forEach(function (route) {
          _this.add(route.name, route.locale, route.pattern, route.page, route.data);
        });
      } else if ((typeof routes === 'undefined' ? 'undefined' : (0, _typeof3.default)(routes)) === 'object') {
        this.routes = [];
        this.add(routes.name, routes.locale, routes.pattern, routes.page, routes.data);
      } else {
        throw new Error('Data passed to setRoutes is neither an array nor an object');
      }
    }
  }, {
    key: 'findByName',
    value: function findByName(name, locale) {
      if (name) {
        return this.routes.filter(function (route) {
          return route.name === name && route.locale === locale;
        })[0];
      }
    }
  }, {
    key: 'match',
    value: function match(url) {
      var parsedUrl = (0, _url.parse)(url, true);
      var pathname = parsedUrl.pathname,
          query = parsedUrl.query;


      return this.routes.reduce(function (result, route) {
        if (result.route) {
          return result;
        }

        var params = route.match(pathname);

        if (!params) {
          return result;
        }

        return (0, _extends3.default)({}, result, { route: route, params: params, query: (0, _extends3.default)({}, query, params) });
      }, { query: query, parsedUrl: parsedUrl });
    }
  }, {
    key: 'findAndGetUrls',
    value: function findAndGetUrls(name, locale, params) {
      locale = locale || this.locale;
      var route = this.findByName(name, locale);

      if (route) {
        return { route: route, urls: route.getUrls(params), byName: true };
      } else {
        throw new Error('Route "' + name + '" not found');
      }
    }
  }, {
    key: 'getRequestHandler',
    value: function getRequestHandler(app, customHandler) {
      var _this2 = this;

      var nextHandler = app.getRequestHandler();

      return function (req, res) {
        var _match = _this2.match(req.url),
            route = _match.route,
            query = _match.query,
            parsedUrl = _match.parsedUrl;

        if (route) {
          req.locale = route.locale;
          req.nextRoute = route.nextRoute;

          if (customHandler) {
            customHandler({ req: req, res: res, route: route, query: query });
          } else {
            app.render(req, res, route.page, query);
          }
        } else {
          nextHandler(req, res, parsedUrl);
        }
      };
    }
  }, {
    key: 'getLink',
    value: function getLink(Link) {
      var _this3 = this;

      var LinkRoutes = function LinkRoutes(props) {
        var href = props.href,
            locale = props.locale,
            params = props.params,
            newProps = (0, _objectWithoutProperties3.default)(props, ['href', 'locale', 'params']);

        var locale2 = locale || _this3.locale;
        var parsedUrl = (0, _url.parse)(href);

        if (parsedUrl.hostname !== null || href[0] === '/' || href[0] === '#') {
          var propsToPass = void 0;
          if (Link.propTypes) {
            var allowedKeys = (0, _keys2.default)(Link.propTypes);
            propsToPass = allowedKeys.reduce(function (obj, key) {
              props.hasOwnProperty(key) && (obj[key] = props[key]);
              return obj;
            }, {});
          } else {
            propsToPass = props;
          }
          return _react2.default.createElement(Link, (0, _extends3.default)({}, propsToPass, {
            __source: {
              fileName: _jsxFileName,
              lineNumber: 151
            }
          }));
        }

        (0, _assign2.default)(newProps, _this3.findAndGetUrls(href, locale2, params).urls);

        return _react2.default.createElement(Link, (0, _extends3.default)({}, newProps, {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 156
          }
        }));
      };
      return LinkRoutes;
    }
  }, {
    key: 'getRouter',
    value: function getRouter(Router) {
      var _this4 = this;

      var wrap = function wrap(method) {
        return function (route, params, locale, options) {
          var locale2 = typeof locale === 'string' ? locale : _this4.locale;
          var options2 = (typeof locale === 'undefined' ? 'undefined' : (0, _typeof3.default)(locale)) === 'object' ? locale : options;

          var _findAndGetUrls = _this4.findAndGetUrls(route, locale2, params),
              byName = _findAndGetUrls.byName,
              _findAndGetUrls$urls = _findAndGetUrls.urls,
              as = _findAndGetUrls$urls.as,
              href = _findAndGetUrls$urls.href;

          return Router[method](href, as, byName ? options2 : params);
        };
      };

      Router.pushRoute = wrap('push');
      Router.replaceRoute = wrap('replace');
      Router.prefetchRoute = wrap('prefetch');
      return Router;
    }
  }]);
  return Routes;
}();

var Route = function () {
  function Route(_ref2) {
    var name = _ref2.name,
        locale = _ref2.locale,
        pattern = _ref2.pattern,
        page = _ref2.page,
        data = _ref2.data;
    (0, _classCallCheck3.default)(this, Route);

    if (!name && !page) {
      throw new Error('Missing page to render for route "' + pattern + '"');
    }

    this.name = name;
    this.locale = locale;
    this.pattern = name === 'homepage' ? '' : pattern || '/' + name;
    this.page = page.replace(/(^|\/)homepage/, '').replace(/^\/?/, '/');
    this.regex = (0, _pathToRegexp2.default)(this.pattern, this.keys = []);
    this.keyNames = this.keys.map(function (key) {
      return key.name;
    });
    this.toPath = _pathToRegexp2.default.compile(this.pattern);
    this.data = data || {};
  }

  (0, _createClass3.default)(Route, [{
    key: 'match',
    value: function match(path) {
      if (path.substring(1, this.locale.length + 1) === this.locale) {
        path = path.substring(this.locale.length + 1);

        if (!path) {
          return {};
        }
      }
      var values = this.regex.exec(path);
      if (values) {
        return this.valuesToParams(values.slice(1));
      }
    }
  }, {
    key: 'valuesToParams',
    value: function valuesToParams(values) {
      var _this5 = this;

      return values.reduce(function (params, val, i) {
        return (0, _assign2.default)(params, (0, _defineProperty3.default)({}, _this5.keys[i].name, val));
      }, {});
    }
  }, {
    key: 'getHref',
    value: function getHref() {
      var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      return this.page + '?' + toQuerystring(params);
    }
  }, {
    key: 'getAs',
    value: function getAs() {
      var _this6 = this;

      var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var as = this.toPath(params) || '/';
      var keys = (0, _keys2.default)(params);
      var qsKeys = keys.filter(function (key) {
        return _this6.keyNames.indexOf(key) === -1;
      });

      if (!qsKeys.length) return as;

      var qsParams = qsKeys.reduce(function (qs, key) {
        return (0, _assign2.default)(qs, (0, _defineProperty3.default)({}, key, params[key]));
      }, {});

      return as + '?' + toQuerystring(qsParams);
    }
  }, {
    key: 'getUrls',
    value: function getUrls(params) {
      var as = this.getAs(params);
      var href = this.getHref(params);
      return { as: as, href: href };
    }
  }]);
  return Route;
}();

var toQuerystring = function toQuerystring(obj) {
  return (0, _keys2.default)(obj).map(function (key) {
    var value = obj[key];
    if (Array.isArray(value)) {
      value = value.join('/');
    }
    return [encodeURIComponent(key), encodeURIComponent(value)].join('=');
  }).join('&');
};