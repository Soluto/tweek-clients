# Org.OpenAPITools.Api.ManifestApi

All URIs are relative to *http://localhost/api/v2*

Method | HTTP request | Description
------------- | ------------- | -------------
[**GetManifests**](ManifestApi.md#getmanifests) | **GET** /manifests | 


<a name="getmanifests"></a>
# **GetManifests**
> List<Object> GetManifests ()



Get Manifests

### Example
```csharp
using System;
using System.Diagnostics;
using Org.OpenAPITools.Api;
using Org.OpenAPITools.Client;
using Org.OpenAPITools.Model;

namespace Example
{
    public class GetManifestsExample
    {
        public void main()
        {
            var apiInstance = new ManifestApi();

            try
            {
                List&lt;Object&gt; result = apiInstance.GetManifests();
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling ManifestApi.GetManifests: " + e.Message );
            }
        }
    }
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

**List<Object>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

