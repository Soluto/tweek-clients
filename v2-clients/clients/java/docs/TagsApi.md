# TagsApi

All URIs are relative to *http://localhost/api/v2*

Method | HTTP request | Description
------------- | ------------- | -------------
[**saveTag**](TagsApi.md#saveTag) | **PUT** /tags | 
[**tagsGet**](TagsApi.md#tagsGet) | **GET** /tags | 


<a name="saveTag"></a>
# **saveTag**
> saveTag(body)



Save tags

### Example
```java
// Import classes:
//import org.openapitools.client.ApiException;
//import org.openapitools.client.api.TagsApi;


TagsApi apiInstance = new TagsApi();
Object body = null; // Object | The tags that need saving
try {
    apiInstance.saveTag(body);
} catch (ApiException e) {
    System.err.println("Exception when calling TagsApi#saveTag");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | **Object**| The tags that need saving |

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

<a name="tagsGet"></a>
# **tagsGet**
> List&lt;String&gt; tagsGet()



Get all tags

### Example
```java
// Import classes:
//import org.openapitools.client.ApiException;
//import org.openapitools.client.api.TagsApi;


TagsApi apiInstance = new TagsApi();
try {
    List<String> result = apiInstance.tagsGet();
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling TagsApi#tagsGet");
    e.printStackTrace();
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

**List&lt;String&gt;**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

