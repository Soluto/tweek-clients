# PolicyApi

All URIs are relative to *http://localhost/api/v2*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getPolicies**](PolicyApi.md#getPolicies) | **GET** /policies | 
[**replacePolicy**](PolicyApi.md#replacePolicy) | **PUT** /policies | 
[**updatePolicy**](PolicyApi.md#updatePolicy) | **PATCH** /policies | 


<a name="getPolicies"></a>
# **getPolicies**
> List&lt;Object&gt; getPolicies()



Get Policies

### Example
```java
// Import classes:
//import org.openapitools.client.ApiException;
//import org.openapitools.client.api.PolicyApi;


PolicyApi apiInstance = new PolicyApi();
try {
    List<Object> result = apiInstance.getPolicies();
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling PolicyApi#getPolicies");
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

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a name="replacePolicy"></a>
# **replacePolicy**
> replacePolicy()



Replace Policy

### Example
```java
// Import classes:
//import org.openapitools.client.ApiException;
//import org.openapitools.client.api.PolicyApi;


PolicyApi apiInstance = new PolicyApi();
try {
    apiInstance.replacePolicy();
} catch (ApiException e) {
    System.err.println("Exception when calling PolicyApi#replacePolicy");
    e.printStackTrace();
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a name="updatePolicy"></a>
# **updatePolicy**
> updatePolicy(patchOperation)



Update Policy

### Example
```java
// Import classes:
//import org.openapitools.client.ApiException;
//import org.openapitools.client.api.PolicyApi;


PolicyApi apiInstance = new PolicyApi();
List<PatchOperation> patchOperation = Arrays.asList(null); // List<PatchOperation> | 
try {
    apiInstance.updatePolicy(patchOperation);
} catch (ApiException e) {
    System.err.println("Exception when calling PolicyApi#updatePolicy");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **patchOperation** | [**List&lt;PatchOperation&gt;**](List.md)|  |

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

