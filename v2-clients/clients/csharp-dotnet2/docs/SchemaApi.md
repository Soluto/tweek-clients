# IO.Swagger.Api.SchemaApi

All URIs are relative to *http://localhost/api/v2/*

Method | HTTP request | Description
------------- | ------------- | -------------
[**DeleteIdentity**](SchemaApi.md#deleteidentity) | **DELETE** /schemas/{identityType} | 
[**GetSchemas**](SchemaApi.md#getschemas) | **GET** /schemas | 
[**SchemaAddIdentity**](SchemaApi.md#schemaaddidentity) | **POST** /schemas/{identityType} | 
[**SchemaPatchIdentity**](SchemaApi.md#schemapatchidentity) | **PATCH** /schemas/{identityType} | 


<a name="deleteidentity"></a>
# **DeleteIdentity**
> string DeleteIdentity (string identityType, string authorName, string authorEmail)



Delete Schema

### Example
```csharp
using System;
using System.Diagnostics;
using IO.Swagger.Api;
using IO.Swagger.Client;
using IO.Swagger.Model;

namespace Example
{
    public class DeleteIdentityExample
    {
        public void main()
        {
            
            var apiInstance = new SchemaApi();
            var identityType = identityType_example;  // string | The type of the identity
            var authorName = authorName_example;  // string | 
            var authorEmail = authorEmail_example;  // string | 

            try
            {
                string result = apiInstance.DeleteIdentity(identityType, authorName, authorEmail);
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling SchemaApi.DeleteIdentity: " + e.Message );
            }
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **identityType** | **string**| The type of the identity | 
 **authorName** | **string**|  | 
 **authorEmail** | **string**|  | 

### Return type

**string**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: text/html

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

<a name="getschemas"></a>
# **GetSchemas**
> List<Object> GetSchemas ()



Get query

### Example
```csharp
using System;
using System.Diagnostics;
using IO.Swagger.Api;
using IO.Swagger.Client;
using IO.Swagger.Model;

namespace Example
{
    public class GetSchemasExample
    {
        public void main()
        {
            
            var apiInstance = new SchemaApi();

            try
            {
                List&lt;Object&gt; result = apiInstance.GetSchemas();
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling SchemaApi.GetSchemas: " + e.Message );
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

<a name="schemaaddidentity"></a>
# **SchemaAddIdentity**
> string SchemaAddIdentity (string identityType, string authorName, string authorEmail, Object value)



Add identity

### Example
```csharp
using System;
using System.Diagnostics;
using IO.Swagger.Api;
using IO.Swagger.Client;
using IO.Swagger.Model;

namespace Example
{
    public class SchemaAddIdentityExample
    {
        public void main()
        {
            
            var apiInstance = new SchemaApi();
            var identityType = identityType_example;  // string | 
            var authorName = authorName_example;  // string | 
            var authorEmail = authorEmail_example;  // string | 
            var value = ;  // Object | 

            try
            {
                string result = apiInstance.SchemaAddIdentity(identityType, authorName, authorEmail, value);
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling SchemaApi.SchemaAddIdentity: " + e.Message );
            }
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **identityType** | **string**|  | 
 **authorName** | **string**|  | 
 **authorEmail** | **string**|  | 
 **value** | **Object**|  | 

### Return type

**string**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: text/html

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

<a name="schemapatchidentity"></a>
# **SchemaPatchIdentity**
> string SchemaPatchIdentity (string identityType, string authorName, string authorEmail, Patch patch)



Update identity

### Example
```csharp
using System;
using System.Diagnostics;
using IO.Swagger.Api;
using IO.Swagger.Client;
using IO.Swagger.Model;

namespace Example
{
    public class SchemaPatchIdentityExample
    {
        public void main()
        {
            
            var apiInstance = new SchemaApi();
            var identityType = identityType_example;  // string | 
            var authorName = authorName_example;  // string | 
            var authorEmail = authorEmail_example;  // string | 
            var patch = new Patch(); // Patch | 

            try
            {
                string result = apiInstance.SchemaPatchIdentity(identityType, authorName, authorEmail, patch);
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling SchemaApi.SchemaPatchIdentity: " + e.Message );
            }
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **identityType** | **string**|  | 
 **authorName** | **string**|  | 
 **authorEmail** | **string**|  | 
 **patch** | [**Patch**](Patch.md)|  | 

### Return type

**string**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: text/html

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

