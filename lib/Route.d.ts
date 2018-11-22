import * as pathToRegexp from 'path-to-regexp';
interface Option {
    name: string;
    page: string;
    locale: string;
    pattern: string;
    data?: any;
}
export default class Route {
    name: string;
    locale: string;
    pattern: string;
    page: string;
    regex: RegExp;
    keys: Array<{
        name: string;
    }>;
    keyNames: string[];
    toPath: pathToRegexp.PathFunction;
    data: object;
    constructor({ name, locale, pattern, page, data }: Option);
    match(path: string): {
        [key: string]: string;
    } | undefined;
    valuesToParams(values: string[]): {
        [key: string]: string;
    };
    getHref(params?: any): string;
    getAs(params?: any): string;
    getUrls(params: any): {
        as: string;
        href: string;
    };
}
export {};
