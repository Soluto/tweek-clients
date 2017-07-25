# Tweek Client for JavaScript

## Basic usage
### Install the package
```
npm install --save tweek-rest
```

### Create a client:
```javascript
const tweekClient = new TweekClient({
  baseServiceUrl: "https://mydomain",
  fetch,
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
