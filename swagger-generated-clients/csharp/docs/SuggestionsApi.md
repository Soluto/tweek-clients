# IO.Swagger.Api.SuggestionsApi

All URIs are relative to *http://localhost/api/v2/*

Method | HTTP request | Description
------------- | ------------- | -------------
[**GetSuggestions**](SuggestionsApi.md#getsuggestions) | **GET** /suggestions | 


<a name="getsuggestions"></a>
# **GetSuggestions**
> List<Object> GetSuggestions ()



Get Suggestions

### Example
```csharp
using System;
using System.Diagnostics;
using IO.Swagger.Api;
using IO.Swagger.Client;
using IO.Swagger.Model;

namespace Example
{
    public class GetSuggestionsExample
    {
        public void main()
        {
            var apiInstance = new SuggestionsApi();

            try
            {
                List&lt;Object&gt; result = apiInstance.GetSuggestions();
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling SuggestionsApi.GetSuggestions: " + e.Message );
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

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

