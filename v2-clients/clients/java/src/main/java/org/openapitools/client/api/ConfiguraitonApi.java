/*
 * Tweek
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * OpenAPI spec version: 0.1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


package org.openapitools.client.api;

import org.openapitools.client.ApiCallback;
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.ApiResponse;
import org.openapitools.client.Configuration;
import org.openapitools.client.Pair;
import org.openapitools.client.ProgressRequestBody;
import org.openapitools.client.ProgressResponseBody;

import com.google.gson.reflect.TypeToken;

import java.io.IOException;



import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ConfiguraitonApi {
    private ApiClient apiClient;

    public ConfiguraitonApi() {
        this(Configuration.getDefaultApiClient());
    }

    public ConfiguraitonApi(ApiClient apiClient) {
        this.apiClient = apiClient;
    }

    public ApiClient getApiClient() {
        return apiClient;
    }

    public void setApiClient(ApiClient apiClient) {
        this.apiClient = apiClient;
    }

    /**
     * Build call for getValue
     * @param keyName Context ids (required)
     * @param params  (optional)
     * @param $include Include additional keys (optional)
     * @param $flatten Return flat key/value JSON (no nesting) (optional)
     * @param progressListener Progress listener
     * @param progressRequestListener Progress request listener
     * @return Call to execute
     * @throws ApiException If fail to serialize the request body object
     */
    public com.squareup.okhttp.Call getValueCall(String keyName, Map<String, String> params, List<String> $include, Boolean $flatten, final ProgressResponseBody.ProgressListener progressListener, final ProgressRequestBody.ProgressRequestListener progressRequestListener) throws ApiException {
        Object localVarPostBody = new Object();

        // create path and map variables
        String localVarPath = "/values";

        List<Pair> localVarQueryParams = new ArrayList<Pair>();
        List<Pair> localVarCollectionQueryParams = new ArrayList<Pair>();
        if (params != null) {
            localVarQueryParams.addAll(apiClient.parameterToPair("params", params));
        }

        if (keyName != null) {
            localVarQueryParams.addAll(apiClient.parameterToPair("keyName", keyName));
        }

        if ($include != null) {
            localVarCollectionQueryParams.addAll(apiClient.parameterToPairs("multi", "$include", $include));
        }

        if ($flatten != null) {
            localVarQueryParams.addAll(apiClient.parameterToPair("$flatten", $flatten));
        }

        Map<String, String> localVarHeaderParams = new HashMap<String, String>();
        Map<String, Object> localVarFormParams = new HashMap<String, Object>();
        final String[] localVarAccepts = {
            
        };
        final String localVarAccept = apiClient.selectHeaderAccept(localVarAccepts);
        if (localVarAccept != null) {
            localVarHeaderParams.put("Accept", localVarAccept);
        }

        final String[] localVarContentTypes = {
            
        };
        final String localVarContentType = apiClient.selectHeaderContentType(localVarContentTypes);
        localVarHeaderParams.put("Content-Type", localVarContentType);

        if (progressListener != null) {
            apiClient.getHttpClient().networkInterceptors().add(new com.squareup.okhttp.Interceptor() {
                @Override
                public com.squareup.okhttp.Response intercept(com.squareup.okhttp.Interceptor.Chain chain) throws IOException {
                    com.squareup.okhttp.Response originalResponse = chain.proceed(chain.request());
                    return originalResponse.newBuilder()
                    .body(new ProgressResponseBody(originalResponse.body(), progressListener))
                    .build();
                }
            });
        }

        String[] localVarAuthNames = new String[] {  };
        return apiClient.buildCall(localVarPath, "GET", localVarQueryParams, localVarCollectionQueryParams, localVarPostBody, localVarHeaderParams, localVarFormParams, localVarAuthNames, progressRequestListener);
    }

    @SuppressWarnings("rawtypes")
    private com.squareup.okhttp.Call getValueValidateBeforeCall(String keyName, Map<String, String> params, List<String> $include, Boolean $flatten, final ProgressResponseBody.ProgressListener progressListener, final ProgressRequestBody.ProgressRequestListener progressRequestListener) throws ApiException {
        
        // verify the required parameter 'keyName' is set
        if (keyName == null) {
            throw new ApiException("Missing the required parameter 'keyName' when calling getValue(Async)");
        }
        

        com.squareup.okhttp.Call call = getValueCall(keyName, params, $include, $flatten, progressListener, progressRequestListener);
        return call;

    }

    /**
     * 
     * Get tweek key value
     * @param keyName Context ids (required)
     * @param params  (optional)
     * @param $include Include additional keys (optional)
     * @param $flatten Return flat key/value JSON (no nesting) (optional)
     * @throws ApiException If fail to call the API, e.g. server error or cannot deserialize the response body
     */
    public void getValue(String keyName, Map<String, String> params, List<String> $include, Boolean $flatten) throws ApiException {
        getValueWithHttpInfo(keyName, params, $include, $flatten);
    }

    /**
     * 
     * Get tweek key value
     * @param keyName Context ids (required)
     * @param params  (optional)
     * @param $include Include additional keys (optional)
     * @param $flatten Return flat key/value JSON (no nesting) (optional)
     * @return ApiResponse&lt;Void&gt;
     * @throws ApiException If fail to call the API, e.g. server error or cannot deserialize the response body
     */
    public ApiResponse<Void> getValueWithHttpInfo(String keyName, Map<String, String> params, List<String> $include, Boolean $flatten) throws ApiException {
        com.squareup.okhttp.Call call = getValueValidateBeforeCall(keyName, params, $include, $flatten, null, null);
        return apiClient.execute(call);
    }

    /**
     *  (asynchronously)
     * Get tweek key value
     * @param keyName Context ids (required)
     * @param params  (optional)
     * @param $include Include additional keys (optional)
     * @param $flatten Return flat key/value JSON (no nesting) (optional)
     * @param callback The callback to be executed when the API call finishes
     * @return The request call
     * @throws ApiException If fail to process the API call, e.g. serializing the request body object
     */
    public com.squareup.okhttp.Call getValueAsync(String keyName, Map<String, String> params, List<String> $include, Boolean $flatten, final ApiCallback<Void> callback) throws ApiException {

        ProgressResponseBody.ProgressListener progressListener = null;
        ProgressRequestBody.ProgressRequestListener progressRequestListener = null;

        if (callback != null) {
            progressListener = new ProgressResponseBody.ProgressListener() {
                @Override
                public void update(long bytesRead, long contentLength, boolean done) {
                    callback.onDownloadProgress(bytesRead, contentLength, done);
                }
            };

            progressRequestListener = new ProgressRequestBody.ProgressRequestListener() {
                @Override
                public void onRequestProgress(long bytesWritten, long contentLength, boolean done) {
                    callback.onUploadProgress(bytesWritten, contentLength, done);
                }
            };
        }

        com.squareup.okhttp.Call call = getValueValidateBeforeCall(keyName, params, $include, $flatten, progressListener, progressRequestListener);
        apiClient.executeAsync(call, callback);
        return call;
    }
}
