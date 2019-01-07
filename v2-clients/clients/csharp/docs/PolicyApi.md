# Org.OpenAPITools.Api.PolicyApi

All URIs are relative to *http://localhost/api/v2*

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
using Org.OpenAPITools.Api;
using Org.OpenAPITools.Client;
using Org.OpenAPITools.Model;

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

 - **Content-Type**: Not defined
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
using Org.OpenAPITools.Api;
using Org.OpenAPITools.Client;
using Org.OpenAPITools.Model;

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

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

<a name="updatepolicy"></a>
# **UpdatePolicy**
> void UpdatePolicy (List<PatchOperation> patchOperation)



Update Policy

### Example
```csharp
using System;
using System.Diagnostics;
using Org.OpenAPITools.Api;
using Org.OpenAPITools.Client;
using Org.OpenAPITools.Model;

namespace Example
{
    public class UpdatePolicyExample
    {
        public void main()
        {
            var apiInstance = new PolicyApi();
            var patchOperation = new List<PatchOperation>(); // List<PatchOperation> | 

            try
            {
                apiInstance.UpdatePolicy(patchOperation);
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
 **patchOperation** | [**List&lt;PatchOperation&gt;**](List.md)|  | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

