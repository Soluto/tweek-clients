# AppsApi

All URIs are relative to *http://localhost/api/v2*

Method | HTTP request | Description
------------- | ------------- | -------------
[**appsCreateApp**](AppsApi.md#appsCreateApp) | **POST** /apps | 


<a name="appsCreateApp"></a>
# **appsCreateApp**
> AppCreationResponseModel appsCreateApp(authorName, authorEmail, appCreationRequestModel)



### Example
```java
// Import classes:
//import org.openapitools.client.ApiException;
//import org.openapitools.client.api.AppsApi;


AppsApi apiInstance = new AppsApi();
String authorName = "authorName_example"; // String | 
String authorEmail = "authorEmail_example"; // String | 
AppCreationRequestModel appCreationRequestModel = new AppCreationRequestModel(); // AppCreationRequestModel | 
try {
    AppCreationResponseModel result = apiInstance.appsCreateApp(authorName, authorEmail, appCreationRequestModel);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling AppsApi#appsCreateApp");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **authorName** | **String**|  |
 **authorEmail** | **String**|  |
 **appCreationRequestModel** | [**AppCreationRequestModel**](AppCreationRequestModel.md)|  |

### Return type

[**AppCreationResponseModel**](AppCreationResponseModel.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

