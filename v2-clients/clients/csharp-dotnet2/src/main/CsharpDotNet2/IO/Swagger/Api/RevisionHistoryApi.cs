using System;
using System.Collections.Generic;
using RestSharp;
using IO.Swagger.Client;

namespace IO.Swagger.Api
{
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public interface IRevisionHistoryApi
    {
        /// <summary>
        ///  Get Revision History
        /// </summary>
        /// <param name="keyPath"></param>
        /// <param name="since"></param>
        /// <returns>List&lt;Object&gt;</returns>
        List<Object> GetRevisionHistory (string keyPath, string since);
    }
  
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public class RevisionHistoryApi : IRevisionHistoryApi
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="RevisionHistoryApi"/> class.
        /// </summary>
        /// <param name="apiClient"> an instance of ApiClient (optional)</param>
        /// <returns></returns>
        public RevisionHistoryApi(ApiClient apiClient = null)
        {
            if (apiClient == null) // use the default one in Configuration
                this.ApiClient = Configuration.DefaultApiClient; 
            else
                this.ApiClient = apiClient;
        }
    
        /// <summary>
        /// Initializes a new instance of the <see cref="RevisionHistoryApi"/> class.
        /// </summary>
        /// <returns></returns>
        public RevisionHistoryApi(String basePath)
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
        ///  Get Revision History
        /// </summary>
        /// <param name="keyPath"></param> 
        /// <param name="since"></param> 
        /// <returns>List&lt;Object&gt;</returns>            
        public List<Object> GetRevisionHistory (string keyPath, string since)
        {
            
            // verify the required parameter 'keyPath' is set
            if (keyPath == null) throw new ApiException(400, "Missing required parameter 'keyPath' when calling GetRevisionHistory");
            
            // verify the required parameter 'since' is set
            if (since == null) throw new ApiException(400, "Missing required parameter 'since' when calling GetRevisionHistory");
            
    
            var path = "/revision-history";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
             if (keyPath != null) queryParams.Add("keyPath", ApiClient.ParameterToString(keyPath)); // query parameter
 if (since != null) queryParams.Add("since", ApiClient.ParameterToString(since)); // query parameter
                                        
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.GET, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling GetRevisionHistory: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetRevisionHistory: " + response.ErrorMessage, response.ErrorMessage);
    
            return (List<Object>) ApiClient.Deserialize(response.Content, typeof(List<Object>), response.Headers);
        }
    
    }
}
