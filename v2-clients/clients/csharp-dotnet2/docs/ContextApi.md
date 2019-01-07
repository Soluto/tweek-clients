# IO.Swagger.Api.ContextApi

All URIs are relative to *http://localhost/api/v2/*

Method | HTTP request | Description
------------- | ------------- | -------------
[**DeleteContextProp**](ContextApi.md#deletecontextprop) | **DELETE** /context/{identityType}/{identityId}/{prop} | 
[**GetContext**](ContextApi.md#getcontext) | **GET** /context/{identityType}/{identityId} | 
[**SaveContext**](ContextApi.md#savecontext) | **POST** /context/{identityType}/{identityId} | 


<a name="deletecontextprop"></a>
# **DeleteContextProp**
> void DeleteContextProp (string identityType, string identityId, string prop)



Delete identity context property

### Example
```csharp
using System;
using System.Diagnostics;
using IO.Swagger.Api;
using IO.Swagger.Client;
using IO.Swagger.Model;

namespace Example
{
    public class DeleteContextPropExample
    {
        public void main()
        {
            
            var apiInstance = new ContextApi();
            var identityType = identityType_example;  // string | the type of the identity - for example user
            var identityId = identityId_example;  // string | the identifier of the identity - for example jaime
            var prop = prop_example;  // string | the property to delete, for example age

            try
            {
                apiInstance.DeleteContextProp(identityType, identityId, prop);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling ContextApi.DeleteContextProp: " + e.Message );
            }
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **identityType** | **string**| the type of the identity - for example user | 
 **identityId** | **string**| the identifier of the identity - for example jaime | 
 **prop** | **string**| the property to delete, for example age | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

<a name="getcontext"></a>
# **GetContext**
> void GetContext (string identityType, string identityId)



Get identity context

### Example
```csharp
using System;
using System.Diagnostics;
using IO.Swagger.Api;
using IO.Swagger.Client;
using IO.Swagger.Model;

namespace Example
{
    public class GetContextExample
    {
        public void main()
        {
            
            var apiInstance = new ContextApi();
            var identityType = identityType_example;  // string | the type of the identity - for example user
            var identityId = identityId_example;  // string | the identifier of the identity - for example jaime

            try
            {
                apiInstance.GetContext(identityType, identityId);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling ContextApi.GetContext: " + e.Message );
            }
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **identityType** | **string**| the type of the identity - for example user | 
 **identityId** | **string**| the identifier of the identity - for example jaime | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

<a name="savecontext"></a>
# **SaveContext**
> void SaveContext (string identityType, string identityId)



Save identity context

### Example
```csharp
using System;
using System.Diagnostics;
using IO.Swagger.Api;
using IO.Swagger.Client;
using IO.Swagger.Model;

namespace Example
{
    public class SaveContextExample
    {
        public void main()
        {
            
            var apiInstance = new ContextApi();
            var identityType = identityType_example;  // string | the type of the identity - for example user
            var identityId = identityId_example;  // string | the identifier of the identity - for example jaime

            try
            {
                apiInstance.SaveContext(identityType, identityId);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling ContextApi.SaveContext: " + e.Message );
            }
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **identityType** | **string**| the type of the identity - for example user | 
 **identityId** | **string**| the identifier of the identity - for example jaime | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

