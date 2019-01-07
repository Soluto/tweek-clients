# \ContextApi

All URIs are relative to *http://localhost/api/v2*

Method | HTTP request | Description
------------- | ------------- | -------------
[**DeleteContextProp**](ContextApi.md#DeleteContextProp) | **Delete** /context/{identityType}/{identityId}/{prop} | 
[**GetContext**](ContextApi.md#GetContext) | **Get** /context/{identityType}/{identityId} | 
[**SaveContext**](ContextApi.md#SaveContext) | **Post** /context/{identityType}/{identityId} | 


# **DeleteContextProp**
> DeleteContextProp(ctx, identityType, identityId, prop)


Delete identity context property

### Required Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
  **identityType** | **string**| the type of the identity - for example user | 
  **identityId** | **string**| the identifier of the identity - for example jaime | 
  **prop** | **string**| the property to delete, for example age | 

### Return type

 (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **GetContext**
> GetContext(ctx, identityType, identityId)


Get identity context

### Required Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
  **identityType** | **string**| the type of the identity - for example user | 
  **identityId** | **string**| the identifier of the identity - for example jaime | 

### Return type

 (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **SaveContext**
> SaveContext(ctx, identityType, identityId)


Save identity context

### Required Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
  **identityType** | **string**| the type of the identity - for example user | 
  **identityId** | **string**| the identifier of the identity - for example jaime | 

### Return type

 (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

