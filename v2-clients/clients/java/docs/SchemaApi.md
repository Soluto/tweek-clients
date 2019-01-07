# SchemaApi

All URIs are relative to *http://localhost/api/v2*

Method | HTTP request | Description
------------- | ------------- | -------------
[**deleteIdentity**](SchemaApi.md#deleteIdentity) | **DELETE** /schemas/{identityType} | 
[**getSchemas**](SchemaApi.md#getSchemas) | **GET** /schemas | 
[**schemaAddIdentity**](SchemaApi.md#schemaAddIdentity) | **POST** /schemas/{identityType} | 
[**schemaPatchIdentity**](SchemaApi.md#schemaPatchIdentity) | **PATCH** /schemas/{identityType} | 


<a name="deleteIdentity"></a>
# **deleteIdentity**
> String deleteIdentity(identityType, authorName, authorEmail)



Delete Schema

### Example
```java
// Import classes:
//import org.openapitools.client.ApiException;
//import org.openapitools.client.api.SchemaApi;


SchemaApi apiInstance = new SchemaApi();
String identityType = "identityType_example"; // String | The type of the identity
String authorName = "authorName_example"; // String | 
String authorEmail = "authorEmail_example"; // String | 
try {
    String result = apiInstance.deleteIdentity(identityType, authorName, authorEmail);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling SchemaApi#deleteIdentity");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **identityType** | **String**| The type of the identity |
 **authorName** | **String**|  |
 **authorEmail** | **String**|  |

### Return type

**String**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: text/html

<a name="getSchemas"></a>
# **getSchemas**
> List&lt;Object&gt; getSchemas()



Get query

### Example
```java
// Import classes:
//import org.openapitools.client.ApiException;
//import org.openapitools.client.api.SchemaApi;


SchemaApi apiInstance = new SchemaApi();
try {
    List<Object> result = apiInstance.getSchemas();
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling SchemaApi#getSchemas");
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

<a name="schemaAddIdentity"></a>
# **schemaAddIdentity**
> String schemaAddIdentity(identityType, authorName, authorEmail, body)



Add identity

### Example
```java
// Import classes:
//import org.openapitools.client.ApiException;
//import org.openapitools.client.api.SchemaApi;


SchemaApi apiInstance = new SchemaApi();
String identityType = "identityType_example"; // String | 
String authorName = "authorName_example"; // String | 
String authorEmail = "authorEmail_example"; // String | 
Object body = null; // Object | 
try {
    String result = apiInstance.schemaAddIdentity(identityType, authorName, authorEmail, body);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling SchemaApi#schemaAddIdentity");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **identityType** | **String**|  |
 **authorName** | **String**|  |
 **authorEmail** | **String**|  |
 **body** | **Object**|  |

### Return type

**String**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: text/html

<a name="schemaPatchIdentity"></a>
# **schemaPatchIdentity**
> String schemaPatchIdentity(identityType, authorName, authorEmail, patchOperation)



Update identity

### Example
```java
// Import classes:
//import org.openapitools.client.ApiException;
//import org.openapitools.client.api.SchemaApi;


SchemaApi apiInstance = new SchemaApi();
String identityType = "identityType_example"; // String | 
String authorName = "authorName_example"; // String | 
String authorEmail = "authorEmail_example"; // String | 
List<PatchOperation> patchOperation = Arrays.asList(null); // List<PatchOperation> | 
try {
    String result = apiInstance.schemaPatchIdentity(identityType, authorName, authorEmail, patchOperation);
    System.out.println(result);
} catch (ApiException e) {
    System.err.println("Exception when calling SchemaApi#schemaPatchIdentity");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **identityType** | **String**|  |
 **authorName** | **String**|  |
 **authorEmail** | **String**|  |
 **patchOperation** | [**List&lt;PatchOperation&gt;**](List.md)|  |

### Return type

**String**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: text/html

