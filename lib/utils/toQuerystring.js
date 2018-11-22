"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (function (obj) {
    return Object.keys(obj)
        .map(function (key) {
        var value = obj[key];
        if (Array.isArray(value)) {
            value = value.join('/');
        }
        return [encodeURIComponent(key), encodeURIComponent(value)].join('=');
    })
        .join('&');
});
//# sourceMappingURL=toQuerystring.js.map