# Org.OpenAPITools.Api.DependentApi

All URIs are relative to *http://localhost/api/v2*

Method | HTTP request | Description
------------- | ------------- | -------------
[**GetDependents**](DependentApi.md#getdependents) | **GET** /dependents | 


<a name="getdependents"></a>
# **GetDependents**
> List<Object> GetDependents ()



Get Dependents

### Example
```csharp
using System;
using System.Diagnostics;
using Org.OpenAPITools.Api;
using Org.OpenAPITools.Client;
using Org.OpenAPITools.Model;

namespace Example
{
    public class GetDependentsExample
    {
        public void main()
        {
            var apiInstance = new DependentApi();

            try
            {
                List&lt;Object&gt; result = apiInstance.GetDependents();
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling DependentApi.GetDependents: " + e.Message );
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

