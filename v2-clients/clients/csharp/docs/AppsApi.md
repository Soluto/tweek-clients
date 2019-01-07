# Org.OpenAPITools.Api.AppsApi

All URIs are relative to *http://localhost/api/v2*

Method | HTTP request | Description
------------- | ------------- | -------------
[**AppsCreateApp**](AppsApi.md#appscreateapp) | **POST** /apps | 


<a name="appscreateapp"></a>
# **AppsCreateApp**
> AppCreationResponseModel AppsCreateApp (string authorName, string authorEmail, AppCreationRequestModel appCreationRequestModel)



### Example
```csharp
using System;
using System.Diagnostics;
using Org.OpenAPITools.Api;
using Org.OpenAPITools.Client;
using Org.OpenAPITools.Model;

namespace Example
{
    public class AppsCreateAppExample
    {
        public void main()
        {
            var apiInstance = new AppsApi();
            var authorName = authorName_example;  // string | 
            var authorEmail = authorEmail_example;  // string | 
            var appCreationRequestModel = new AppCreationRequestModel(); // AppCreationRequestModel | 

            try
            {
                AppCreationResponseModel result = apiInstance.AppsCreateApp(authorName, authorEmail, appCreationRequestModel);
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling AppsApi.AppsCreateApp: " + e.Message );
            }
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
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

