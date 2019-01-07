# IO.Swagger.Api.PolicyApi

All URIs are relative to *http://localhost/api/v2/*

Method | HTTP request | Description
------------- | ------------- | -------------
[**GetPolicies**](PolicyApi.md#getpolicies) | **GET** /policies | 
[**ReplacePolicy**](PolicyApi.md#replacepolicy) | **PUT** /policies | 
[**UpdatePolicy**](PolicyApi.md#updatepolicy) | **PATCH** /policies | 


<a name="getpolicies"></a>
# **GetPolicies**
> List<Object> GetPolicies ()



Get Policies

### Example
```csharp
using System;
using System.Diagnostics;
using IO.Swagger.Api;
using IO.Swagger.Client;
using IO.Swagger.Model;

namespace Example
{
    public class GetPoliciesExample
    {
        public void main()
        {
            var apiInstance = new PolicyApi();

            try
            {
                List&lt;Object&gt; result = apiInstance.GetPolicies();
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling PolicyApi.GetPolicies: " + e.Message );
            }
        }
    }
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

**List<Object>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

<a name="replacepolicy"></a>
# **ReplacePolicy**
> void ReplacePolicy ()



Replace Policy

### Example
```csharp
using System;
using System.Diagnostics;
using IO.Swagger.Api;
using IO.Swagger.Client;
using IO.Swagger.Model;

namespace Example
{
    public class ReplacePolicyExample
    {
        public void main()
        {
            var apiInstance = new PolicyApi();

            try
            {
                apiInstance.ReplacePolicy();
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling PolicyApi.ReplacePolicy: " + e.Message );
            }
        }
    }
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

<a name="updatepolicy"></a>
# **UpdatePolicy**
> void UpdatePolicy (Patch policyPatch)



Update Policy

### Example
```csharp
using System;
using System.Diagnostics;
using IO.Swagger.Api;
using IO.Swagger.Client;
using IO.Swagger.Model;

namespace Example
{
    public class UpdatePolicyExample
    {
        public void main()
        {
            var apiInstance = new PolicyApi();
            var policyPatch = new Patch(); // Patch | 

            try
            {
                apiInstance.UpdatePolicy(policyPatch);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling PolicyApi.UpdatePolicy: " + e.Message );
            }
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **policyPatch** | [**Patch**](Patch.md)|  | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

