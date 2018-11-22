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
Object.defineProperty(exports, "__esModule", { value: true });
var pathToRegexp = require("path-to-regexp");
var toQuerystring_1 = require("./utils/toQuerystring");
var Route = /** @class */ (function () {
    function Route(_a) {
        var name = _a.name, locale = _a.locale, pattern = _a.pattern, page = _a.page, data = _a.data;
        if (!name && !page) {
            throw new Error("Missing page to render for route \"" + pattern + "\"");
        }
        this.name = name;
        this.locale = locale;
        this.pattern = name === 'homepage' ? '' : pattern || "/" + name;
        this.page = page.replace(/(^|\/)homepage/, '').replace(/^\/?/, '/');
        this.regex = pathToRegexp(this.pattern, (this.keys = []));
        this.keyNames = this.keys.map(function (key) { return key.name; });
        this.toPath = pathToRegexp.compile(this.pattern);
        this.data = data || {};
    }
    Route.prototype.match = function (path) {
        var values = this.regex.exec(path);
        if (values) {
            return this.valuesToParams(values.slice(1));
        }
        return undefined;
    };
    Route.prototype.valuesToParams = function (values) {
        var _this = this;
        return values.reduce(function (params, val, i) {
            var _a;
            return (__assign({}, params, (_a = {}, _a[_this.keys[i].name] = val, _a)));
        }, {});
    };
    Route.prototype.getHref = function (params) {
        if (params === void 0) { params = {}; }
        return this.page + "?" + toQuerystring_1.default(params);
    };
    Route.prototype.getAs = function (params) {
        var _this = this;
        if (params === void 0) { params = {}; }
        var as = this.toPath(params) || '/';
        var keys = Object.keys(params);
        var qsKeys = keys.filter(function (key) { return _this.keyNames.indexOf(key) === -1; });
        if (!qsKeys.length) {
            return as;
        }
        var qsParams = qsKeys.reduce(function (qs, key) {
            var _a;
            return Object.assign(qs, (_a = {},
                _a[key] = params[key],
                _a));
        }, {});
        return as + "?" + toQuerystring_1.default(qsParams);
    };
    Route.prototype.getUrls = function (params) {
        var as = this.getAs(params);
        var href = this.getHref(params);
        return { as: as, href: href };
    };
    return Route;
}());
exports.default = Route;
//# sourceMappingURL=Route.js.map