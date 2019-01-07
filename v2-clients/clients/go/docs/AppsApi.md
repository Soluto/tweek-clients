# \AppsApi

All URIs are relative to *http://localhost/api/v2*

Method | HTTP request | Description
------------- | ------------- | -------------
[**AppsCreateApp**](AppsApi.md#AppsCreateApp) | **Post** /apps | 


# **AppsCreateApp**
> AppCreationResponseModel AppsCreateApp(ctx, authorName, authorEmail, appCreationRequestModel)


### Required Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
  **authorName** | **string**|  | 
  **authorEmail** | **string**|  | 
  **appCreationRequestModel** | [**AppCreationRequestModel**](AppCreationRequestModel.md)|  | 

### Return type

[**AppCreationResponseModel**](AppCreationResponseModel.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

