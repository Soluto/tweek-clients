# ManifestApi

All URIs are relative to *http://localhost/api/v2/*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getManifests**](ManifestApi.md#getManifests) | **GET** /manifests | 


<a name="getManifests"></a>
# **getManifests**
> List&lt;Object&gt; getManifests()



Get Manifests

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.ManifestApi;


ManifestApi apiInstance = new ManifestApi();
try {
    List<Object> result = apiInstance.getManifests();
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling ManifestApi#getManifests");
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

