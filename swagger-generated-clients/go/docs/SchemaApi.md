# \SchemaApi

All URIs are relative to *http://localhost/api/v2/*

Method | HTTP request | Description
------------- | ------------- | -------------
[**DeleteIdentity**](SchemaApi.md#DeleteIdentity) | **Delete** /schemas/{identityType} | 
[**GetSchemas**](SchemaApi.md#GetSchemas) | **Get** /schemas | 
[**SchemaAddIdentity**](SchemaApi.md#SchemaAddIdentity) | **Post** /schemas/{identityType} | 
[**SchemaPatchIdentity**](SchemaApi.md#SchemaPatchIdentity) | **Patch** /schemas/{identityType} | 


# **DeleteIdentity**
> string DeleteIdentity(ctx, identityType, authorName, authorEmail)


Delete Schema

### Required Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
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

# **GetSchemas**
> []interface{} GetSchemas(ctx, )


Get query

### Required Parameters
This endpoint does not need any parameter.

### Return type

[**[]interface{}**](interface{}.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **SchemaAddIdentity**
> string SchemaAddIdentity(ctx, identityType, authorName, authorEmail, value)


Add identity

### Required Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
  **identityType** | **string**|  | 
  **authorName** | **string**|  | 
  **authorEmail** | **string**|  | 
  **value** | [**interface{}**](interface{}.md)|  | 

### Return type

**string**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: text/html

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **SchemaPatchIdentity**
> string SchemaPatchIdentity(ctx, identityType, authorName, authorEmail, patch)


Update identity

### Required Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
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

