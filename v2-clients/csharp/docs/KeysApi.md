# IO.Swagger.Api.KeysApi

All URIs are relative to *http://localhost/api/v2/*

Method | HTTP request | Description
------------- | ------------- | -------------
[**CreateKey**](KeysApi.md#createkey) | **PUT** /keys | 
[**KeysDeleteKey**](KeysApi.md#keysdeletekey) | **DELETE** /keys | 
[**KeysGetKey**](KeysApi.md#keysgetkey) | **GET** /keys | 


<a name="createkey"></a>
# **CreateKey**
> string CreateKey (string keyPath, string authorName, string authorEmail, KeyUpdateModel newKeyModel)



Save Key

### Example
```csharp
using System;
using System.Diagnostics;
using IO.Swagger.Api;
using IO.Swagger.Client;
using IO.Swagger.Model;

namespace Example
{
    public class CreateKeyExample
    {
        public void main()
        {
            var apiInstance = new KeysApi();
            var keyPath = keyPath_example;  // string | 
            var authorName = authorName_example;  // string | 
            var authorEmail = authorEmail_example;  // string | 
            var newKeyModel = new KeyUpdateModel(); // KeyUpdateModel | 

            try
            {
                string result = apiInstance.CreateKey(keyPath, authorName, authorEmail, newKeyModel);
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling KeysApi.CreateKey: " + e.Message );
            }
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **keyPath** | **string**|  | 
 **authorName** | **string**|  | 
 **authorEmail** | **string**|  | 
 **newKeyModel** | [**KeyUpdateModel**](KeyUpdateModel.md)|  | 

### Return type

**string**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: text/html

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

<a name="keysdeletekey"></a>
# **KeysDeleteKey**
> string KeysDeleteKey (string keyPath, string authorName, string authorEmail, List<string> additionalKeys = null)



### Example
```csharp
using System;
using System.Diagnostics;
using IO.Swagger.Api;
using IO.Swagger.Client;
using IO.Swagger.Model;

namespace Example
{
    public class KeysDeleteKeyExample
    {
        public void main()
        {
            var apiInstance = new KeysApi();
            var keyPath = keyPath_example;  // string | 
            var authorName = authorName_example;  // string | 
            var authorEmail = authorEmail_example;  // string | 
            var additionalKeys = ;  // List<string> |  (optional) 

            try
            {
                string result = apiInstance.KeysDeleteKey(keyPath, authorName, authorEmail, additionalKeys);
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling KeysApi.KeysDeleteKey: " + e.Message );
            }
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **keyPath** | **string**|  | 
 **authorName** | **string**|  | 
 **authorEmail** | **string**|  | 
 **additionalKeys** | **List&lt;string&gt;**|  | [optional] 

### Return type

**string**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: text/html

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

<a name="keysgetkey"></a>
# **KeysGetKey**
> Object KeysGetKey (string keyPath, string revision = null)



### Example
```csharp
using System;
using System.Diagnostics;
using IO.Swagger.Api;
using IO.Swagger.Client;
using IO.Swagger.Model;

namespace Example
{
    public class KeysGetKeyExample
    {
        public void main()
        {
            var apiInstance = new KeysApi();
            var keyPath = keyPath_example;  // string | 
            var revision = revision_example;  // string |  (optional) 

            try
            {
                Object result = apiInstance.KeysGetKey(keyPath, revision);
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling KeysApi.KeysGetKey: " + e.Message );
            }
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **keyPath** | **string**|  | 
 **revision** | **string**|  | [optional] 

### Return type

**Object**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

