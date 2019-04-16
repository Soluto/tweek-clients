# Tweek Client for JavaScript

## Basic usage

### Install the package

```
npm install --save tweek-client
```

### TweekClient

#### Create a client

`createTweekClient(config: CreateTweekClientConfig): TweekClient`

use this method to create a tweek client

```javascript
const tweekClient = createTweekClient({
  baseServiceUrl: 'https://mydomain',
});
```

the config object accepts these properties:

| Prop                     | Description                                            | Type                                              | Default     |
| ------------------------ | ------------------------------------------------------ | ------------------------------------------------- | ----------- |
| `baseServiceUrl`         | Required - the url for tweek gateway                   | `string`                                          |
| `context`                | the context to add to anu request                      | `object`                                          |
| `useLegacyEndpoint`      | if set to true, will use `v1` version of the api       | `boolean`                                         | `false`     |
| `fetch`                  | a fetch client to use to make the requests             | `(RequestInfo, RequestInit) => Promise<Response>` | cross-fetch |
| `requestTimeoutInMillis` | request timeout in ms                                  | `number`                                          | 8000        |
| `onError`                | callback to be called for request errors               | `(Response) => void`                              |
| `getAuthenticationToken` | a function that returns a token for jwt authentication | `() => Promise<string> \| string`                 |
| `clientId`               | client id for basic auth authentication                | `string`                                          |
| `clientSecret`           | client secret for basic auth authentication            | `string`                                          |

#### Query your configuration key and get value

`tweekClient.getValues<T>(keyPath: string, config?: GetValuesConfig): Promise<T>`

```javascript
const myConfiguration = await tweekClient.getValues('some_key/path');
```

the config object accepts these properties:

| Prop             | Description                                                                                   | Type       | Default |
| ---------------- | --------------------------------------------------------------------------------------------- | ---------- | ------- |
| `include`        | the keys to include in the request, used to filter scan keys                                  | `string[]` |
| `context`        | override the client context                                                                   | `object`   |
| `flatten`        | if set to true the response will be in the format of a { [keyPath]: value }                   | `boolean`  | `false` |
| `ignoreKeyTypes` | if set to true, all the key types will be ignored and returned as strings                     | `boolean`  | `false` |
| `maxChunkSize`   | if the `include` section has a lot of entries, it will split the request into multiple chunks | `number`   | 100     |

#### Query configuration with key value error details

**only supported on api versions 1.0-rc3 and above**

`tweekClient.getValuesWithDetails<T>(path: string, config?: GetValuesConfig) : Promise<DetailedTweekResult<T>>`

```javascript
const myDetaildConfig = await tweekClient.getValuesWithDetails('some_key/path');
```

the config object has the same properties as `getValues`

### TweekManagementClient

#### Create a client

`createTweekManagementClient(config: CreateTweekManagementClientConfig): TweekManagementClient`

use this method to create a tweek management client

```javascript
const tweekManagementClient = createTweekManagementClient({
  baseServiceUrl: 'https://mydomain',
});
```

the config object accepts these properties:

| Prop                     | Description                                            | Type                                              | Default     |
| ------------------------ | ------------------------------------------------------ | ------------------------------------------------- | ----------- |
| `baseServiceUrl`         | Required - the url for tweek gateway                   | `string`                                          |
| `fetch`                  | a fetch client to use to make the requests             | `(RequestInfo, RequestInit) => Promise<Response>` | cross-fetch |
| `requestTimeoutInMillis` | request timeout in ms                                  | `number`                                          | 8000        |
| `onError`                | callback to be called for request errors               | `(Response) => void`                              |
| `getAuthenticationToken` | a function that returns a token for jwt authentication | `() => Promise<string> \| string`                 |
| `clientId`               | client id for basic auth authentication                | `string`                                          |
| `clientSecret`           | client secret for basic auth authentication            | `string`                                          |

#### Updating Context

```javascript
const myContext = {
  age: 23,
};

await tweekManagementClient.appendContext('user', '123456', myContext);
```

## Using Authentication

Example:

```javascript
function getAuthenticationToken() {
  return 'jwt token';
}

const tweekClient = createTweekClient({
  baseServiceUrl: 'https://mydomain',
  getAuthenticationToken,
});
```

`getAuthenticationToken` can also return a promise

```javascript
function getAuthenticationToken() {
  return Promise.resolve('jwt token');
}

const tweekClient = createTweekClient({
  baseServiceUrl: 'https://mydomain',
  getAuthenticationToken,
});
```
