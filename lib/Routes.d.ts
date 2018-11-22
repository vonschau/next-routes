import NextLink, { LinkProps } from 'next/link';
import NextRouter, { SingletonRouter } from 'next/router';
import * as React from 'react';
import Route from './Route';
interface NextRouteOptions {
    shallow: boolean;
}
declare type FnType = (route: string, params?: any, locale?: string | NextRouteOptions, options?: NextRouteOptions) => void;
declare type RouterType = typeof NextRouter & {
    pushRoute: FnType;
    replaceRoute: FnType;
    prefetchRoute: FnType;
};
interface ExtendedLinkProps extends LinkProps {
    route: string;
    locale?: string;
    to?: string;
    params?: any;
}
declare type LinkType = React.SFC<ExtendedLinkProps>;
interface ConstructorProps {
    Link?: any;
    Router?: any;
    locale: string;
}
interface Option {
    name: string;
    page: string;
    locale: string;
    pattern: string;
    data?: any;
}
export default class Routes {
    routes: Route[];
    Link: LinkType;
    Router: RouterType;
    locale: string;
    constructor({ locale }: ConstructorProps);
    add(name: string | Option, locale: string | undefined, pattern: string, page: string, data?: any): this;
    setLocale(locale: string): void;
    findByName(name: string, locale?: string): Route | undefined;
    match(url: string): {
        query: any;
        route?: Route | undefined;
        params?: any;
        parsedUrl: any;
    };
    findAndGetUrls(nameOrUrl: string, locale: string, params: any): {
        foundRoute: Route;
        urls: {
            as: string;
            href: string;
        };
        byName: boolean;
        route?: undefined;
    } | {
        route: Route | undefined;
        urls: {
            href: string;
            as: string;
        };
        foundRoute?: undefined;
        byName?: undefined;
    };
    getRequestHandler(app: any, customHandler?: any): (req: any, res: any) => void;
    getLink(Link: typeof NextLink): React.FunctionComponent<ExtendedLinkProps>;
    getRouter(Router: SingletonRouter): RouterType;
}
export {};
