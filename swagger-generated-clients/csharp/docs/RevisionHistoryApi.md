# IO.Swagger.Api.RevisionHistoryApi

All URIs are relative to *http://localhost/api/v2/*

Method | HTTP request | Description
------------- | ------------- | -------------
[**GetRevisionHistory**](RevisionHistoryApi.md#getrevisionhistory) | **GET** /revision-history | 


<a name="getrevisionhistory"></a>
# **GetRevisionHistory**
> List<Object> GetRevisionHistory (string keyPath, string since)



Get Revision History

### Example
```csharp
using System;
using System.Diagnostics;
using IO.Swagger.Api;
using IO.Swagger.Client;
using IO.Swagger.Model;

namespace Example
{
    public class GetRevisionHistoryExample
    {
        public void main()
        {
            var apiInstance = new RevisionHistoryApi();
            var keyPath = keyPath_example;  // string | 
            var since = since_example;  // string | 

            try
            {
                List&lt;Object&gt; result = apiInstance.GetRevisionHistory(keyPath, since);
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling RevisionHistoryApi.GetRevisionHistory: " + e.Message );
            }
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **keyPath** | **string**|  | 
 **since** | **string**|  | 

### Return type

**List<Object>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

