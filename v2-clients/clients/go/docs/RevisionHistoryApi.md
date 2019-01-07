# \RevisionHistoryApi

All URIs are relative to *http://localhost/api/v2*

Method | HTTP request | Description
------------- | ------------- | -------------
[**GetRevisionHistory**](RevisionHistoryApi.md#GetRevisionHistory) | **Get** /revision-history | 


# **GetRevisionHistory**
> []map[string]interface{} GetRevisionHistory(ctx, keyPath, since)


Get Revision History

### Required Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
  **keyPath** | **string**|  | 
  **since** | **string**|  | 

### Return type

[**[]map[string]interface{}**](map[string]interface{}.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

