# Tweek Client for JavaScript

## Basic usage
### Install the package
```
npm install --save tweek-rest
```

### Create a client:
```javascript
const tweekClient = createTweekClient({
  baseServiceUrl: "https://mydomain",
});
```

### Query your configuration key and get value
```javascript
const myConfiguration = await tweekClient.fetch("/myconfiguration");
```

### Updating Context
```javascript
const myContext = {
  age: 23,
};

await tweekClient.appendContext("user", "123456", myContext);
```

## Using Authentication

Example:

```javascript
function getAuthenticationToken() {
  return 'jwt token';
}

const tweekClient = createTweekClient({
  baseServiceUrl: "https://mydomain",
  getAuthenticationToken,
});

```

`getAuthenticationToken` can also return a promise

```javascript
function getAuthenticationToken() {
  return Promise.resolve('jwt token');
}

const tweekClient = createTweekClient({
  baseServiceUrl: "https://mydomain",
  getAuthenticationToken,
});

```
