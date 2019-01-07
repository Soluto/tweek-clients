# SchemaApi

All URIs are relative to *http://localhost/api/v2/*

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
//import io.swagger.client.ApiException;
//import io.swagger.client.api.SchemaApi;


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

 - **Content-Type**: application/json
 - **Accept**: text/html

<a name="getSchemas"></a>
# **getSchemas**
> List&lt;Object&gt; getSchemas()



Get query

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.SchemaApi;


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

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="schemaAddIdentity"></a>
# **schemaAddIdentity**
> String schemaAddIdentity(identityType, authorName, authorEmail, value)



Add identity

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.SchemaApi;


SchemaApi apiInstance = new SchemaApi();
String identityType = "identityType_example"; // String | 
String authorName = "authorName_example"; // String | 
String authorEmail = "authorEmail_example"; // String | 
Object value = null; // Object | 
try {
    String result = apiInstance.schemaAddIdentity(identityType, authorName, authorEmail, value);
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
 **value** | **Object**|  |

### Return type

**String**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: text/html

<a name="schemaPatchIdentity"></a>
# **schemaPatchIdentity**
> String schemaPatchIdentity(identityType, authorName, authorEmail, patch)



Update identity

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.SchemaApi;


SchemaApi apiInstance = new SchemaApi();
String identityType = "identityType_example"; // String | 
String authorName = "authorName_example"; // String | 
String authorEmail = "authorEmail_example"; // String | 
Patch patch = new Patch(); // Patch | 
try {
    String result = apiInstance.schemaPatchIdentity(identityType, authorName, authorEmail, patch);
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
 **patch** | [**Patch**](Patch.md)|  |

### Return type

**String**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: text/html

