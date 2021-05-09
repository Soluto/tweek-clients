# Tweek Local Cache client

This package introduce "Tweek Repository", a js client that implement request batching, caching and state management for Tweek.  
Its main usage is for client apps that use Tweek (mobile/web/desktop).  
It also offers integration with React using react-tweek package.  


## Basic usage
### Install the package
```
npm install --save tweek-local-cache tweek-client
```

### Create a client:
```javascript
import {createTweekClient} from 'tweek-client'
import {TweekRepository} from 'tweek-local-cache'

const tweekClient = createTweekClient({
  baseServiceUrl: "https://mydomain",
});

const tweekRepository = new TweekRepository({client:tweekClient});
tweekRepository.context = {
user: {
   id:"alice",
   country:"uk"
}}

let value = await tweekRepository.get("my_key");
```
