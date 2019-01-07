# Org.OpenAPITools.Api.ConfiguraitonApi

All URIs are relative to *http://localhost/api/v2*

Method | HTTP request | Description
------------- | ------------- | -------------
[**GetValue**](ConfiguraitonApi.md#getvalue) | **GET** /values | 


<a name="getvalue"></a>
# **GetValue**
> void GetValue (string keyName, Dictionary<string, string> _params = null, List<string> include = null, bool? flatten = null)



Get tweek key value

### Example
```csharp
using System;
using System.Diagnostics;
using Org.OpenAPITools.Api;
using Org.OpenAPITools.Client;
using Org.OpenAPITools.Model;

namespace Example
{
    public class GetValueExample
    {
        public void main()
        {
            var apiInstance = new ConfiguraitonApi();
            var keyName = keyName_example;  // string | Context ids
            var _params = new Dictionary<string, string>(); // Dictionary<string, string> |  (optional) 
            var include = new List<string>(); // List<string> | Include additional keys (optional) 
            var flatten = true;  // bool? | Return flat key/value JSON (no nesting) (optional) 

            try
            {
                apiInstance.GetValue(keyName, _params, include, flatten);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling ConfiguraitonApi.GetValue: " + e.Message );
            }
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **keyName** | **string**| Context ids | 
 **_params** | [**Dictionary&lt;string, string&gt;**](string.md)|  | [optional] 
 **include** | [**List&lt;string&gt;**](string.md)| Include additional keys | [optional] 
 **flatten** | **bool?**| Return flat key/value JSON (no nesting) | [optional] 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

