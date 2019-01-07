using System;
using System.Collections.Generic;
using RestSharp;
using IO.Swagger.Client;

namespace IO.Swagger.Api
{
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public interface IConfiguraitonApi
    {
        /// <summary>
        ///  Get tweek key value
        /// </summary>
        /// <param name="keyName">Configuration key name</param>
        /// <param name="include">Include additional keys</param>
        /// <param name="flatten">Return flat key/value JSON (no nesting)</param>
        /// <returns></returns>
        void GetValue (string keyName, List<string> include, bool? flatten);
    }
  
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public class ConfiguraitonApi : IConfiguraitonApi
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="ConfiguraitonApi"/> class.
        /// </summary>
        /// <param name="apiClient"> an instance of ApiClient (optional)</param>
        /// <returns></returns>
        public ConfiguraitonApi(ApiClient apiClient = null)
        {
            if (apiClient == null) // use the default one in Configuration
                this.ApiClient = Configuration.DefaultApiClient; 
            else
                this.ApiClient = apiClient;
        }
    
        /// <summary>
        /// Initializes a new instance of the <see cref="ConfiguraitonApi"/> class.
        /// </summary>
        /// <returns></returns>
        public ConfiguraitonApi(String basePath)
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
        ///  Get tweek key value
        /// </summary>
        /// <param name="keyName">Configuration key name</param> 
        /// <param name="include">Include additional keys</param> 
        /// <param name="flatten">Return flat key/value JSON (no nesting)</param> 
        /// <returns></returns>            
        public void GetValue (string keyName, List<string> include, bool? flatten)
        {
            
            // verify the required parameter 'keyName' is set
            if (keyName == null) throw new ApiException(400, "Missing required parameter 'keyName' when calling GetValue");
            
    
            var path = "/values";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
             if (keyName != null) queryParams.Add("keyName", ApiClient.ParameterToString(keyName)); // query parameter
 if (include != null) queryParams.Add("$include", ApiClient.ParameterToString(include)); // query parameter
 if (flatten != null) queryParams.Add("$flatten", ApiClient.ParameterToString(flatten)); // query parameter
                                        
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.GET, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling GetValue: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetValue: " + response.ErrorMessage, response.ErrorMessage);
    
            return;
        }
    
    }
}
