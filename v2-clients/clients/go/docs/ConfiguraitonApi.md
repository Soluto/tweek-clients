# \ConfiguraitonApi

All URIs are relative to *http://localhost/api/v2*

Method | HTTP request | Description
------------- | ------------- | -------------
[**GetValue**](ConfiguraitonApi.md#GetValue) | **Get** /values | 


# **GetValue**
> GetValue(ctx, keyName, optional)


Get tweek key value

### Required Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
  **keyName** | **string**| Context ids | 
 **optional** | ***GetValueOpts** | optional parameters | nil if no parameters

### Optional Parameters
Optional parameters are passed through a pointer to a GetValueOpts struct

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------

 **params** | [**optional.Interface of map[string]string**](string.md)|  | 
 **include** | [**optional.Interface of []string**](string.md)| Include additional keys | 
 **flatten** | **optional.Bool**| Return flat key/value JSON (no nesting) | 

### Return type

 (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

