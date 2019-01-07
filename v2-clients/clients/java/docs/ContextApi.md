# ContextApi

All URIs are relative to *http://localhost/api/v2/*

Method | HTTP request | Description
------------- | ------------- | -------------
[**deleteContextProp**](ContextApi.md#deleteContextProp) | **DELETE** /context/{identityType}/{identityId}/{prop} | 
[**getContext**](ContextApi.md#getContext) | **GET** /context/{identityType}/{identityId} | 
[**saveContext**](ContextApi.md#saveContext) | **POST** /context/{identityType}/{identityId} | 


<a name="deleteContextProp"></a>
# **deleteContextProp**
> deleteContextProp(identityType, identityId, prop)



Delete identity context property

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.ContextApi;


ContextApi apiInstance = new ContextApi();
String identityType = "identityType_example"; // String | the type of the identity - for example user
String identityId = "identityId_example"; // String | the identifier of the identity - for example jaime
String prop = "prop_example"; // String | the property to delete, for example age
try {
    apiInstance.deleteContextProp(identityType, identityId, prop);
} catch (ApiException e) {
    System.err.println("Exception when calling ContextApi#deleteContextProp");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **identityType** | **String**| the type of the identity - for example user |
 **identityId** | **String**| the identifier of the identity - for example jaime |
 **prop** | **String**| the property to delete, for example age |

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="getContext"></a>
# **getContext**
> getContext(identityType, identityId)



Get identity context

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.ContextApi;


ContextApi apiInstance = new ContextApi();
String identityType = "identityType_example"; // String | the type of the identity - for example user
String identityId = "identityId_example"; // String | the identifier of the identity - for example jaime
try {
    apiInstance.getContext(identityType, identityId);
} catch (ApiException e) {
    System.err.println("Exception when calling ContextApi#getContext");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **identityType** | **String**| the type of the identity - for example user |
 **identityId** | **String**| the identifier of the identity - for example jaime |

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a name="saveContext"></a>
# **saveContext**
> saveContext(identityType, identityId)



Save identity context

### Example
```java
// Import classes:
//import io.swagger.client.ApiException;
//import io.swagger.client.api.ContextApi;


ContextApi apiInstance = new ContextApi();
String identityType = "identityType_example"; // String | the type of the identity - for example user
String identityId = "identityId_example"; // String | the identifier of the identity - for example jaime
try {
    apiInstance.saveContext(identityType, identityId);
} catch (ApiException e) {
    System.err.println("Exception when calling ContextApi#saveContext");
    e.printStackTrace();
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **identityType** | **String**| the type of the identity - for example user |
 **identityId** | **String**| the identifier of the identity - for example jaime |

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

