using System;
using System.Collections.Generic;
using RestSharp;
using IO.Swagger.Client;
using IO.Swagger.Model;

namespace IO.Swagger.Api
{
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public interface IKeysApi
    {
        /// <summary>
        ///  Save Key
        /// </summary>
        /// <param name="keyPath"></param>
        /// <param name="authorName"></param>
        /// <param name="authorEmail"></param>
        /// <param name="newKeyModel"></param>
        /// <returns>string</returns>
        string CreateKey (string keyPath, string authorName, string authorEmail, KeyUpdateModel newKeyModel);
        /// <summary>
        ///  
        /// </summary>
        /// <param name="keyPath"></param>
        /// <param name="authorName"></param>
        /// <param name="authorEmail"></param>
        /// <param name="additionalKeys"></param>
        /// <returns>string</returns>
        string KeysDeleteKey (string keyPath, string authorName, string authorEmail, List<string> additionalKeys);
        /// <summary>
        ///  
        /// </summary>
        /// <param name="keyPath"></param>
        /// <param name="revision"></param>
        /// <returns>Object</returns>
        Object KeysGetKey (string keyPath, string revision);
    }
  
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public class KeysApi : IKeysApi
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="KeysApi"/> class.
        /// </summary>
        /// <param name="apiClient"> an instance of ApiClient (optional)</param>
        /// <returns></returns>
        public KeysApi(ApiClient apiClient = null)
        {
            if (apiClient == null) // use the default one in Configuration
                this.ApiClient = Configuration.DefaultApiClient; 
            else
                this.ApiClient = apiClient;
        }
    
        /// <summary>
        /// Initializes a new instance of the <see cref="KeysApi"/> class.
        /// </summary>
        /// <returns></returns>
        public KeysApi(String basePath)
        {
            this.ApiClient = new ApiClient(basePath);
        }
    
        /// <summary>
        /// Sets the base path of the API client.
        /// </summary>
        /// <param name="basePath">The base path</param>
        /// <value>The base path</value>
        public void SetBasePath(String basePath)
        {
            this.ApiClient.BasePath = basePath;
        }
    
        /// <summary>
        /// Gets the base path of the API client.
        /// </summary>
        /// <param name="basePath">The base path</param>
        /// <value>The base path</value>
        public String GetBasePath(String basePath)
        {
            return this.ApiClient.BasePath;
        }
    
        /// <summary>
        /// Gets or sets the API client.
        /// </summary>
        /// <value>An instance of the ApiClient</value>
        public ApiClient ApiClient {get; set;}
    
        /// <summary>
        ///  Save Key
        /// </summary>
        /// <param name="keyPath"></param> 
        /// <param name="authorName"></param> 
        /// <param name="authorEmail"></param> 
        /// <param name="newKeyModel"></param> 
        /// <returns>string</returns>            
        public string CreateKey (string keyPath, string authorName, string authorEmail, KeyUpdateModel newKeyModel)
        {
            
            // verify the required parameter 'keyPath' is set
            if (keyPath == null) throw new ApiException(400, "Missing required parameter 'keyPath' when calling CreateKey");
            
            // verify the required parameter 'authorName' is set
            if (authorName == null) throw new ApiException(400, "Missing required parameter 'authorName' when calling CreateKey");
            
            // verify the required parameter 'authorEmail' is set
            if (authorEmail == null) throw new ApiException(400, "Missing required parameter 'authorEmail' when calling CreateKey");
            
            // verify the required parameter 'newKeyModel' is set
            if (newKeyModel == null) throw new ApiException(400, "Missing required parameter 'newKeyModel' when calling CreateKey");
            
    
            var path = "/keys";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
             if (keyPath != null) queryParams.Add("keyPath", ApiClient.ParameterToString(keyPath)); // query parameter
 if (authorName != null) queryParams.Add("author.name", ApiClient.ParameterToString(authorName)); // query parameter
 if (authorEmail != null) queryParams.Add("author.email", ApiClient.ParameterToString(authorEmail)); // query parameter
                                    postBody = ApiClient.Serialize(newKeyModel); // http body (model) parameter
    
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.PUT, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling CreateKey: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling CreateKey: " + response.ErrorMessage, response.ErrorMessage);
    
            return (string) ApiClient.Deserialize(response.Content, typeof(string), response.Headers);
        }
    
        /// <summary>
        ///  
        /// </summary>
        /// <param name="keyPath"></param> 
        /// <param name="authorName"></param> 
        /// <param name="authorEmail"></param> 
        /// <param name="additionalKeys"></param> 
        /// <returns>string</returns>            
        public string KeysDeleteKey (string keyPath, string authorName, string authorEmail, List<string> additionalKeys)
        {
            
            // verify the required parameter 'keyPath' is set
            if (keyPath == null) throw new ApiException(400, "Missing required parameter 'keyPath' when calling KeysDeleteKey");
            
            // verify the required parameter 'authorName' is set
            if (authorName == null) throw new ApiException(400, "Missing required parameter 'authorName' when calling KeysDeleteKey");
            
            // verify the required parameter 'authorEmail' is set
            if (authorEmail == null) throw new ApiException(400, "Missing required parameter 'authorEmail' when calling KeysDeleteKey");
            
    
            var path = "/keys";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
             if (keyPath != null) queryParams.Add("keyPath", ApiClient.ParameterToString(keyPath)); // query parameter
 if (authorName != null) queryParams.Add("author.name", ApiClient.ParameterToString(authorName)); // query parameter
 if (authorEmail != null) queryParams.Add("author.email", ApiClient.ParameterToString(authorEmail)); // query parameter
                                    postBody = ApiClient.Serialize(additionalKeys); // http body (model) parameter
    
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.DELETE, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling KeysDeleteKey: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling KeysDeleteKey: " + response.ErrorMessage, response.ErrorMessage);
    
            return (string) ApiClient.Deserialize(response.Content, typeof(string), response.Headers);
        }
    
        /// <summary>
        ///  
        /// </summary>
        /// <param name="keyPath"></param> 
        /// <param name="revision"></param> 
        /// <returns>Object</returns>            
        public Object KeysGetKey (string keyPath, string revision)
        {
            
            // verify the required parameter 'keyPath' is set
            if (keyPath == null) throw new ApiException(400, "Missing required parameter 'keyPath' when calling KeysGetKey");
            
    
            var path = "/keys";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
             if (keyPath != null) queryParams.Add("keyPath", ApiClient.ParameterToString(keyPath)); // query parameter
 if (revision != null) queryParams.Add("revision", ApiClient.ParameterToString(revision)); // query parameter
                                        
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.GET, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling KeysGetKey: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling KeysGetKey: " + response.ErrorMessage, response.ErrorMessage);
    
            return (Object) ApiClient.Deserialize(response.Content, typeof(Object), response.Headers);
        }
    
    }
}
