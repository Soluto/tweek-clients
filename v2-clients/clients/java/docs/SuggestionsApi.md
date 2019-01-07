# SuggestionsApi

All URIs are relative to *http://localhost/api/v2/*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getSuggestions**](SuggestionsApi.md#getSuggestions) | **GET** /suggestions | 


<a name="getSuggestions"></a>
# **getSuggestions**
> List&lt;Object&gt; getSuggestions()



Get Suggestions

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.SuggestionsApi;


SuggestionsApi apiInstance = new SuggestionsApi();
try {
    List<Object> result = apiInstance.getSuggestions();
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling SuggestionsApi#getSuggestions");
    e.printStackTrace();
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

**List&lt;Object&gt;**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

