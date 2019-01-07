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
    public interface IAppsApi
    {
        /// <summary>
        ///  
        /// </summary>
        /// <param name="authorName"></param>
        /// <param name="authorEmail"></param>
        /// <param name="newAppModel"></param>
        /// <returns>AppCreationResponseModel</returns>
        AppCreationResponseModel AppsCreateApp (string authorName, string authorEmail, AppCreationRequestModel newAppModel);
    }
  
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public class AppsApi : IAppsApi
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="AppsApi"/> class.
        /// </summary>
        /// <param name="apiClient"> an instance of ApiClient (optional)</param>
        /// <returns></returns>
        public AppsApi(ApiClient apiClient = null)
        {
            if (apiClient == null) // use the default one in Configuration
                this.ApiClient = Configuration.DefaultApiClient; 
            else
                this.ApiClient = apiClient;
        }
    
        /// <summary>
        /// Initializes a new instance of the <see cref="AppsApi"/> class.
        /// </summary>
        /// <returns></returns>
        public AppsApi(String basePath)
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
        ///  
        /// </summary>
        /// <param name="authorName"></param> 
        /// <param name="authorEmail"></param> 
        /// <param name="newAppModel"></param> 
        /// <returns>AppCreationResponseModel</returns>            
        public AppCreationResponseModel AppsCreateApp (string authorName, string authorEmail, AppCreationRequestModel newAppModel)
        {
            
            // verify the required parameter 'authorName' is set
            if (authorName == null) throw new ApiException(400, "Missing required parameter 'authorName' when calling AppsCreateApp");
            
            // verify the required parameter 'authorEmail' is set
            if (authorEmail == null) throw new ApiException(400, "Missing required parameter 'authorEmail' when calling AppsCreateApp");
            
            // verify the required parameter 'newAppModel' is set
            if (newAppModel == null) throw new ApiException(400, "Missing required parameter 'newAppModel' when calling AppsCreateApp");
            
    
            var path = "/apps";
            path = path.Replace("{format}", "json");
                
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
             if (authorName != null) queryParams.Add("author.name", ApiClient.ParameterToString(authorName)); // query parameter
 if (authorEmail != null) queryParams.Add("author.email", ApiClient.ParameterToString(authorEmail)); // query parameter
                                    postBody = ApiClient.Serialize(newAppModel); // http body (model) parameter
    
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.POST, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling AppsCreateApp: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling AppsCreateApp: " + response.ErrorMessage, response.ErrorMessage);
    
            return (AppCreationResponseModel) ApiClient.Deserialize(response.Content, typeof(AppCreationResponseModel), response.Headers);
        }
    
    }
}
