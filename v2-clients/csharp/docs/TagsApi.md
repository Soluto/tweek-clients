# IO.Swagger.Api.TagsApi

All URIs are relative to *http://localhost/api/v2/*

Method | HTTP request | Description
------------- | ------------- | -------------
[**SaveTag**](TagsApi.md#savetag) | **PUT** /tags | 
[**TagsGet**](TagsApi.md#tagsget) | **GET** /tags | 


<a name="savetag"></a>
# **SaveTag**
> void SaveTag (Object tagsToSave)



Save tags

### Example
```csharp
using System;
using System.Diagnostics;
using IO.Swagger.Api;
using IO.Swagger.Client;
using IO.Swagger.Model;

namespace Example
{
    public class SaveTagExample
    {
        public void main()
        {
            var apiInstance = new TagsApi();
            var tagsToSave = ;  // Object | The tags that need saving

            try
            {
                apiInstance.SaveTag(tagsToSave);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling TagsApi.SaveTag: " + e.Message );
            }
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **tagsToSave** | **Object**| The tags that need saving | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: text/html

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

<a name="tagsget"></a>
# **TagsGet**
> List<string> TagsGet ()



Get all tags

### Example
```csharp
using System;
using System.Diagnostics;
using IO.Swagger.Api;
using IO.Swagger.Client;
using IO.Swagger.Model;

namespace Example
{
    public class TagsGetExample
    {
        public void main()
        {
            var apiInstance = new TagsApi();

            try
            {
                List&lt;string&gt; result = apiInstance.TagsGet();
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling TagsApi.TagsGet: " + e.Message );
            }
        }
    }
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

**List<string>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

