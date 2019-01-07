# Org.OpenAPITools.Api.SchemaApi

All URIs are relative to *http://localhost/api/v2*

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
using Org.OpenAPITools.Api;
using Org.OpenAPITools.Client;
using Org.OpenAPITools.Model;

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

 - **Content-Type**: Not defined
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
using Org.OpenAPITools.Api;
using Org.OpenAPITools.Client;
using Org.OpenAPITools.Model;

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

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

<a name="schemaaddidentity"></a>
# **SchemaAddIdentity**
> string SchemaAddIdentity (string identityType, string authorName, string authorEmail, Object body)



Add identity

### Example
```csharp
using System;
using System.Diagnostics;
using Org.OpenAPITools.Api;
using Org.OpenAPITools.Client;
using Org.OpenAPITools.Model;

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
            var body = ;  // Object | 

            try
            {
                string result = apiInstance.SchemaAddIdentity(identityType, authorName, authorEmail, body);
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
 **body** | **Object**|  | 

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
> string SchemaPatchIdentity (string identityType, string authorName, string authorEmail, List<PatchOperation> patchOperation)



Update identity

### Example
```csharp
using System;
using System.Diagnostics;
using Org.OpenAPITools.Api;
using Org.OpenAPITools.Client;
using Org.OpenAPITools.Model;

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
            var patchOperation = new List<PatchOperation>(); // List<PatchOperation> | 

            try
            {
                string result = apiInstance.SchemaPatchIdentity(identityType, authorName, authorEmail, patchOperation);
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
 **patchOperation** | [**List&lt;PatchOperation&gt;**](List.md)|  | 

### Return type

**string**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: text/html

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

