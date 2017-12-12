# Tweek Client for .NET (netstandard 1.1)

## Basic usage
### Install the nuget
nuget install Tweek.Client

### Create a client:
```csharp
ITweekApiClient configurationClient = new TweekApiClient("https://mydomain");
```

### Query your configuration key and get JToken
```csharp
JToken myConfiguration = await configurationClient.Get("/myconfiguration", null);
```

### Query your configuration key and get type safe result
```csharp
string myStringValue = await configurationClient.Get<string>("/mystring", null);
```

### Updating Context
```csharp
var myContext = new Dictionary<string, JToken> {{ "age", JToken.FromObject(23) }};

await configurationClient.AppendContext("user_id", "123456", myContext);
```

## Using Polly for resilience and transient fault handling
Documentation for Polly is found [here](https://github.com/App-vNext/Polly#resilience-policies)

Example:
```csharp
var retryPolicy = Policy<JToken>.Handle<HttpRequestException>().Retry(3);

var configurationClient = new TweekApiClient("https://mydomain");
var clientWithRetries = new TweekApiPolicyClient(configurationClient, retryPolicy);

// Will make 3 retries on http errors
string myString = await clientWithRetries.Get<string>("/mystring", null);
```

## Using Authentication

Example:

```csharp
// AuthenticatedMessageHandler which inserts authentication token in every request
public class AuthenticatedMessageHandler: DelegatingHandler
{
    private readonly Func<Task<string>> mAuthorizationProvider;

    public AuthenticatedMessageHandler(Func<Task<string>> authorizationProvider)
    {
        mAuthorizationProvider = authorizationProvider;
        InnerHandler = new HttpClientHandler();
    }

    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        var token = await mAuthorizationProvider.GetTokenAsync();
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return await base.SendAsync(request, cancellationToken);
    }
}

// Now we can use it
var oauth2TokenProvider = () => {...}; // Use your favorite OAuth implementation, for example ADAL
var tweekClient = new TweekApiClient(new HttpClient(new AuthenticatedMessageHandler(oauth2TokenProvider)) { BaseUri = new Uri("https://example.com") });

var myString = tweekClient.Get<string>("/mystring");
```
