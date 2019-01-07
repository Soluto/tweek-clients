# ConfiguraitonApi

All URIs are relative to *http://localhost/api/v2/*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getValue**](ConfiguraitonApi.md#getValue) | **GET** /values | 


<a name="getValue"></a>
# **getValue**
> getValue(keyName, include, flatten)



Get tweek key value

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.ConfiguraitonApi;


ConfiguraitonApi apiInstance = new ConfiguraitonApi();
String keyName = "keyName_example"; // String | Configuration key name
List<String> include = Arrays.asList("include_example"); // List<String> | Include additional keys
Boolean flatten = true; // Boolean | Return flat key/value JSON (no nesting)
try {
    apiInstance.getValue(keyName, include, flatten);
} catch (ApiException e) {
    System.err.println("Exception when calling ConfiguraitonApi#getValue");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **keyName** | **String**| Configuration key name |
 **include** | [**List&lt;String&gt;**](String.md)| Include additional keys | [optional]
 **flatten** | **Boolean**| Return flat key/value JSON (no nesting) | [optional]

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

