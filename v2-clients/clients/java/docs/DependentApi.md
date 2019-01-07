# DependentApi

All URIs are relative to *http://localhost/api/v2/*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getDependents**](DependentApi.md#getDependents) | **GET** /dependents | 


<a name="getDependents"></a>
# **getDependents**
> List&lt;Object&gt; getDependents()



Get Dependents

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.DependentApi;


DependentApi apiInstance = new DependentApi();
try {
    List<Object> result = apiInstance.getDependents();
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling DependentApi#getDependents");
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

