import * as queryString from 'query-string';
import 'isomorphic-fetch';

export type IdentityContext = { id?: string } & {
  [prop: string]: string | number | boolean;
};

export type Context = {
  [identityType: string]: IdentityContext;
};

export type TweekCasing = 'snake' | 'camelCase';

export type FetchConfig = {
  include?: string[];
  casing?: TweekCasing;
  convertTyping?: boolean;
  flatten?: boolean;
  context?: Context;
  requestTimeout?: number;
};

export type TweekInitConfig = FetchConfig & {
  baseServiceUrl: string;
  fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
};

function requestTimeout(timeoutInMillis): Promise<Response> {
  const failureResponse = new Response(null, { status: 408 });
  return new Promise((res, rej) => {
    let wait = setTimeout(() => {
      clearTimeout(wait);
      res(failureResponse);
    }, timeoutInMillis);
  });
}

function captialize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function snakeToCamelCase(target) {
  if (typeof target !== 'object') return target;
  return Object.keys(target).reduce((o, key) => {
    let [firstKey, ...others] = key.split('_');
    let newKey = [firstKey, ...others.map(captialize)].join('');
    o[newKey] = snakeToCamelCase(target[key]);
    return o;
  }, {});
}

function convertTypingFromJSON(target) {
  if (typeof target === 'string') {
    try {
      return JSON.parse(target);
    } catch (e) {
      return target;
    }
  } else if (typeof target === 'object') {
    return Object.keys(target).reduce((o, key) => {
      o[key] = convertTypingFromJSON(target[key]);
      return o;
    }, {});
  } else return target;
}

export interface ITweekClient {
  fetch<T>(path: string, config?: FetchConfig): Promise<T>;
  appendContext(identityType: string, identityId: string, context: object): Promise<void>;
  deleteContext(identityType: string, identityId: string, property: string): Promise<void>;
}

export class TweekClient implements ITweekClient {
  config: TweekInitConfig;

  private static ENCODE_$_CHARACTER = encodeURIComponent('$');
  private static ENCODE_SLASH_CHARACTER = encodeURIComponent('/');

  constructor(config: TweekInitConfig) {
    this.config = <TweekInitConfig & FetchConfig>{
      ...{ casing: 'snake', flatten: false, convertTyping: false, context: {} },
      ...config,
    };

    let { baseServiceUrl } = config;

    if (baseServiceUrl.endsWith('/')) {
      baseServiceUrl = baseServiceUrl.substr(0, baseServiceUrl.length - 1);
      this.config.baseServiceUrl = baseServiceUrl;
    }
  }

  fetch<T>(path: string, _config?: FetchConfig): Promise<T> {
    const { casing, flatten, baseServiceUrl, convertTyping, context, include } = <TweekInitConfig & FetchConfig>{
      ...this.config,
      ..._config,
    };
    let queryParamsObject = this._contextToQueryParams(context);

    if (flatten) {
      queryParamsObject['$flatten'] = true;
    }

    queryParamsObject['$include'] = include;
    let queryParams = queryString.stringify(queryParamsObject);
    queryParams = this.queryParamsEncoder(queryParams);

    const url =
      baseServiceUrl +
      '/api/v1/keys' +
      (path.startsWith('/') ? '' : '/') +
      path +
      (!!queryParams ? `?${queryParams}` : '');
    let result: Promise<any> = this.config.fetch(url, {}).then(response => {
      if (response.ok) {
        return response.json();
      } else {
        return Promise.reject(new Error(response.statusText));
      }
    });

    if (!flatten && casing === 'camelCase') {
      result = result.then(snakeToCamelCase);
    }

    if (convertTyping) {
      result = result.then(convertTypingFromJSON);
    }

    return <Promise<T>>result;
  }

  appendContext(identityType: string, identityId: string, context: object): Promise<void> {
    const url = `${this.config.baseServiceUrl}/api/v1/context/${identityType}/${identityId}`;
    let result = this.config
      .fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(context),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error appending context, code ${response.status}, message: '${response.statusText}'`);
        }
      });
    return <Promise<void>>result;
  }

  deleteContext(identityType: string, identityId: string, property: string): Promise<void> {
    const url = `${this.config.baseServiceUrl}/api/v1/context/${identityType}/${identityId}/${property}`;
    let result = this.config.fetch(url, { method: 'DELETE' }).then(response => {
      if (!response.ok) {
        throw new Error(`Error deleting context property, code ${response.status}, message: '${response.statusText}'`);
      }
    });
    return <Promise<void>>result;
  }

  public queryParamsEncoder = (queryParams: string) =>
    queryParams.replace(/\$/g, TweekClient.ENCODE_$_CHARACTER).replace(/\//g, TweekClient.ENCODE_SLASH_CHARACTER);

  private _contextToQueryParams = context => {
    return Object.keys(context).reduce((pre, cur) => {
      let identityContext = context[cur];
      Object.keys(identityContext).forEach(
        x => (x === 'id' ? (pre[`${cur}`] = identityContext[x]) : (pre[`${cur}.${x}`] = identityContext[x])),
      );
      return pre;
    }, {});
  };
}

export function createTweekClient(config: {
  baseServiceUrl: string;
  context?: any;
  requestTimeoutInMillis?: number;
  getAuthenticationToken?: () => Promise<string> | string;
}) {
  const { baseServiceUrl, context = {}, getAuthenticationToken, requestTimeoutInMillis = 8000 } = config;

  let fetchClient = (input, init) => Promise.race([fetch(input, init), requestTimeout(requestTimeoutInMillis)]);
  if (getAuthenticationToken) {
    fetchClient = async (input, init = {}) => {
      const token = await Promise.resolve(getAuthenticationToken());
      return Promise.race([
        fetch(input, {
          ...init,
          headers: {
            ...init.headers,
            Authorization: `Bearer ${token}`,
          },
        }),
        requestTimeout(requestTimeoutInMillis),
      ]);
    };
  }

  return new TweekClient({
    baseServiceUrl,
    casing: 'camelCase',
    convertTyping: false,
    context,
    fetch: fetchClient,
  });
}
