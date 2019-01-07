# IO.Swagger.Api.ConfiguraitonApi

All URIs are relative to *http://localhost/api/v2/*

Method | HTTP request | Description
------------- | ------------- | -------------
[**GetValue**](ConfiguraitonApi.md#getvalue) | **GET** /values | 


<a name="getvalue"></a>
# **GetValue**
> void GetValue (string keyName, List<string> include, bool? flatten)



Get tweek key value

### Example
```csharp
using System;
using System.Diagnostics;
using IO.Swagger.Api;
using IO.Swagger.Client;
using IO.Swagger.Model;

namespace Example
{
    public class GetValueExample
    {
        public void main()
        {
            
            var apiInstance = new ConfiguraitonApi();
            var keyName = keyName_example;  // string | Configuration key name
            var include = new List<string>(); // List<string> | Include additional keys (optional) 
            var flatten = true;  // bool? | Return flat key/value JSON (no nesting) (optional) 

            try
            {
                apiInstance.GetValue(keyName, include, flatten);
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
 **keyName** | **string**| Configuration key name | 
 **include** | [**List<string>**](string.md)| Include additional keys | [optional] 
 **flatten** | **bool?**| Return flat key/value JSON (no nesting) | [optional] 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

