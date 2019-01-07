using System;
using System.Collections.Generic;
using RestSharp;
using IO.Swagger.Client;

namespace IO.Swagger.Api
{
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public interface IContextApi
    {
        /// <summary>
        ///  Delete identity context property
        /// </summary>
        /// <param name="identityType">the type of the identity - for example user</param>
        /// <param name="identityId">the identifier of the identity - for example jaime</param>
        /// <param name="prop">the property to delete, for example age</param>
        /// <returns></returns>
        void DeleteContextProp (string identityType, string identityId, string prop);
        /// <summary>
        ///  Get identity context
        /// </summary>
        /// <param name="identityType">the type of the identity - for example user</param>
        /// <param name="identityId">the identifier of the identity - for example jaime</param>
        /// <returns></returns>
        void GetContext (string identityType, string identityId);
        /// <summary>
        ///  Save identity context
        /// </summary>
        /// <param name="identityType">the type of the identity - for example user</param>
        /// <param name="identityId">the identifier of the identity - for example jaime</param>
        /// <returns></returns>
        void SaveContext (string identityType, string identityId);
    }
  
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public class ContextApi : IContextApi
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="ContextApi"/> class.
        /// </summary>
        /// <param name="apiClient"> an instance of ApiClient (optional)</param>
        /// <returns></returns>
        public ContextApi(ApiClient apiClient = null)
        {
            if (apiClient == null) // use the default one in Configuration
                this.ApiClient = Configuration.DefaultApiClient; 
            else
                this.ApiClient = apiClient;
        }
    
        /// <summary>
        /// Initializes a new instance of the <see cref="ContextApi"/> class.
        /// </summary>
        /// <returns></returns>
        public ContextApi(String basePath)
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
        ///  Delete identity context property
        /// </summary>
        /// <param name="identityType">the type of the identity - for example user</param> 
        /// <param name="identityId">the identifier of the identity - for example jaime</param> 
        /// <param name="prop">the property to delete, for example age</param> 
        /// <returns></returns>            
        public void DeleteContextProp (string identityType, string identityId, string prop)
        {
            
            // verify the required parameter 'identityType' is set
            if (identityType == null) throw new ApiException(400, "Missing required parameter 'identityType' when calling DeleteContextProp");
            
            // verify the required parameter 'identityId' is set
            if (identityId == null) throw new ApiException(400, "Missing required parameter 'identityId' when calling DeleteContextProp");
            
            // verify the required parameter 'prop' is set
            if (prop == null) throw new ApiException(400, "Missing required parameter 'prop' when calling DeleteContextProp");
            
    
            var path = "/context/{identityType}/{identityId}/{prop}";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "identityType" + "}", ApiClient.ParameterToString(identityType));
path = path.Replace("{" + "identityId" + "}", ApiClient.ParameterToString(identityId));
path = path.Replace("{" + "prop" + "}", ApiClient.ParameterToString(prop));
    
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
                                                    
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.DELETE, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling DeleteContextProp: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling DeleteContextProp: " + response.ErrorMessage, response.ErrorMessage);
    
            return;
        }
    
        /// <summary>
        ///  Get identity context
        /// </summary>
        /// <param name="identityType">the type of the identity - for example user</param> 
        /// <param name="identityId">the identifier of the identity - for example jaime</param> 
        /// <returns></returns>            
        public void GetContext (string identityType, string identityId)
        {
            
            // verify the required parameter 'identityType' is set
            if (identityType == null) throw new ApiException(400, "Missing required parameter 'identityType' when calling GetContext");
            
            // verify the required parameter 'identityId' is set
            if (identityId == null) throw new ApiException(400, "Missing required parameter 'identityId' when calling GetContext");
            
    
            var path = "/context/{identityType}/{identityId}";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "identityType" + "}", ApiClient.ParameterToString(identityType));
path = path.Replace("{" + "identityId" + "}", ApiClient.ParameterToString(identityId));
    
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
                                                    
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.GET, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling GetContext: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetContext: " + response.ErrorMessage, response.ErrorMessage);
    
            return;
        }
    
        /// <summary>
        ///  Save identity context
        /// </summary>
        /// <param name="identityType">the type of the identity - for example user</param> 
        /// <param name="identityId">the identifier of the identity - for example jaime</param> 
        /// <returns></returns>            
        public void SaveContext (string identityType, string identityId)
        {
            
            // verify the required parameter 'identityType' is set
            if (identityType == null) throw new ApiException(400, "Missing required parameter 'identityType' when calling SaveContext");
            
            // verify the required parameter 'identityId' is set
            if (identityId == null) throw new ApiException(400, "Missing required parameter 'identityId' when calling SaveContext");
            
    
            var path = "/context/{identityType}/{identityId}";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "identityType" + "}", ApiClient.ParameterToString(identityType));
path = path.Replace("{" + "identityId" + "}", ApiClient.ParameterToString(identityId));
    
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
                                                    
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.POST, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling SaveContext: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling SaveContext: " + response.ErrorMessage, response.ErrorMessage);
    
            return;
        }
    
    }
}
