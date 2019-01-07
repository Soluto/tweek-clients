# ConfiguraitonApi

All URIs are relative to *http://localhost/api/v2*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getValue**](ConfiguraitonApi.md#getValue) | **GET** /values | 


<a name="getValue"></a>
# **getValue**
> getValue(keyName, params, $include, $flatten)



Get tweek key value

### Example
```java
// Import classes:
//import org.openapitools.client.ApiException;
//import org.openapitools.client.api.ConfiguraitonApi;


ConfiguraitonApi apiInstance = new ConfiguraitonApi();
String keyName = "keyName_example"; // String | Context ids
Map<String, String> params = new HashMap(); // Map<String, String> | 
List<String> $include = Arrays.asList(); // List<String> | Include additional keys
Boolean $flatten = true; // Boolean | Return flat key/value JSON (no nesting)
try {
    apiInstance.getValue(keyName, params, $include, $flatten);
} catch (ApiException e) {
    System.err.println("Exception when calling ConfiguraitonApi#getValue");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **keyName** | **String**| Context ids |
 **params** | [**Map&lt;String, String&gt;**](String.md)|  | [optional]
 **$include** | [**List&lt;String&gt;**](String.md)| Include additional keys | [optional]
 **$flatten** | **Boolean**| Return flat key/value JSON (no nesting) | [optional]

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

