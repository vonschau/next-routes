"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var link_1 = require("next/link");
var router_1 = require("next/router");
var React = require("react");
var url_1 = require("url");
var Route_1 = require("./Route");
var Routes = /** @class */ (function () {
    function Routes(_a) {
        var locale = _a.locale;
        this.routes = [];
        this.Link = this.getLink(link_1.default);
        this.Router = this.getRouter(router_1.default);
        this.locale = locale;
    }
    Routes.prototype.add = function (name, locale, pattern, page, data) {
        if (locale === void 0) { locale = this.locale; }
        var options;
        if (typeof name === 'object') {
            options = name;
            if (!options.name) {
                throw new Error('Unnamed routes not supported');
            }
            name = options.name;
            if (!options.page) {
                options.page = options.name;
            }
            locale = options.locale || this.locale;
        }
        else {
            if (typeof page === 'object') {
                data = page;
                page = name;
            }
            else {
                page = page || name;
            }
            options = { name: name, locale: locale, pattern: pattern, page: page };
            if (data) {
                options.data = data;
            }
        }
        if (this.findByName(name, locale)) {
            throw new Error("Route \"" + name + "\" already exists");
        }
        this.routes.push(new Route_1.default(options));
        return this;
    };
    Routes.prototype.setLocale = function (locale) {
        this.locale = locale;
    };
    Routes.prototype.findByName = function (name, locale) {
        locale = locale || this.locale;
        if (name) {
            return this.routes.filter(function (route) { return route.name === name && route.locale === locale; })[0];
        }
        return undefined;
    };
    Routes.prototype.match = function (url) {
        var parsedUrl = url_1.parse(url, true);
        var pathname = parsedUrl.pathname, query = parsedUrl.query;
        return this.routes.reduce(function (result, route) {
            if (result.route) {
                return result;
            }
            var params = route.match(pathname);
            if (!params) {
                return result;
            }
            return __assign({}, result, { route: route, params: params, query: __assign({}, query, params) });
        }, { query: query, parsedUrl: parsedUrl });
    };
    Routes.prototype.findAndGetUrls = function (nameOrUrl, locale, params) {
        locale = locale || this.locale;
        var foundRoute = this.findByName(nameOrUrl, locale);
        if (foundRoute) {
            return { foundRoute: foundRoute, urls: foundRoute.getUrls(params), byName: true };
        }
        else {
            var _a = this.match(nameOrUrl), route = _a.route, query = _a.query;
            var href = route ? route.getHref(query) : nameOrUrl;
            var urls = { href: href, as: nameOrUrl };
            return { route: route, urls: urls };
        }
    };
    Routes.prototype.getRequestHandler = function (app, customHandler) {
        var _this = this;
        var nextHandler = app.getRequestHandler();
        return function (req, res) {
            var _a = _this.match(req.url), route = _a.route, query = _a.query, parsedUrl = _a.parsedUrl;
            if (route) {
                req.locale = route.locale;
                if (customHandler) {
                    customHandler({ req: req, res: res, route: route, query: query });
                }
                else {
                    app.render(req, res, route.page, query);
                }
            }
            else {
                nextHandler(req, res, parsedUrl);
            }
        };
    };
    Routes.prototype.getLink = function (Link) {
        var _this = this;
        var LinkRoutes = function (props) {
            var route = props.route, params = props.params, locale = props.locale, to = props.to, newProps = __rest(props, ["route", "params", "locale", "to"]);
            var nameOrUrl = route || to;
            var locale2 = locale || _this.locale;
            if (nameOrUrl) {
                Object.assign(newProps, _this.findAndGetUrls(nameOrUrl, locale2, params).urls);
            }
            return React.createElement(Link, __assign({}, newProps));
        };
        return LinkRoutes;
    };
    Routes.prototype.getRouter = function (Router) {
        var _this = this;
        var wrap = function (method) { return function (route, params, locale, options) {
            var locale2 = typeof locale === 'string' ? locale : _this.locale;
            var options2 = typeof locale === 'object' ? locale : options;
            var _a = _this.findAndGetUrls(route, locale2, params), byName = _a.byName, _b = _a.urls, as = _b.as, href = _b.href;
            return Router[method](href, as, byName ? options2 : params);
        }; };
        return __assign({}, Router, { pushRoute: wrap('push'), replaceRoute: wrap('replace'), prefetchRoute: wrap('prefetch') });
    };
    return Routes;
}());
exports.default = Routes;
//# sourceMappingURL=Routes.js.map