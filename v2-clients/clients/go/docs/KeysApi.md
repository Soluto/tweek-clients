# \KeysApi

All URIs are relative to *http://localhost/api/v2/*

Method | HTTP request | Description
------------- | ------------- | -------------
[**CreateKey**](KeysApi.md#CreateKey) | **Put** /keys | 
[**KeysDeleteKey**](KeysApi.md#KeysDeleteKey) | **Delete** /keys | 
[**KeysGetKey**](KeysApi.md#KeysGetKey) | **Get** /keys | 


# **CreateKey**
> string CreateKey(ctx, keyPath, authorName, authorEmail, newKeyModel)


Save Key

### Required Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
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

# **KeysDeleteKey**
> string KeysDeleteKey(ctx, keyPath, authorName, authorEmail, optional)




### Required Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
  **keyPath** | **string**|  | 
  **authorName** | **string**|  | 
  **authorEmail** | **string**|  | 
 **optional** | ***KeysDeleteKeyOpts** | optional parameters | nil if no parameters

### Optional Parameters
Optional parameters are passed through a pointer to a KeysDeleteKeyOpts struct

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------



 **additionalKeys** | **optional.[]string**|  | 

### Return type

**string**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: text/html

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **KeysGetKey**
> interface{} KeysGetKey(ctx, keyPath, optional)




### Required Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
  **keyPath** | **string**|  | 
 **optional** | ***KeysGetKeyOpts** | optional parameters | nil if no parameters

### Optional Parameters
Optional parameters are passed through a pointer to a KeysGetKeyOpts struct

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------

 **revision** | **optional.String**|  | 

### Return type

[**interface{}**](interface{}.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

