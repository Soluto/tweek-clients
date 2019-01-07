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
    public interface ISchemaApi
    {
        /// <summary>
        ///  Delete Schema
        /// </summary>
        /// <param name="identityType">The type of the identity</param>
        /// <param name="authorName"></param>
        /// <param name="authorEmail"></param>
        /// <returns>string</returns>
        string DeleteIdentity (string identityType, string authorName, string authorEmail);
        /// <summary>
        ///  Get query
        /// </summary>
        /// <returns>List&lt;Object&gt;</returns>
        List<Object> GetSchemas ();
        /// <summary>
        ///  Add identity
        /// </summary>
        /// <param name="identityType"></param>
        /// <param name="authorName"></param>
        /// <param name="authorEmail"></param>
        /// <param name="value"></param>
        /// <returns>string</returns>
        string SchemaAddIdentity (string identityType, string authorName, string authorEmail, Object value);
        /// <summary>
        ///  Update identity
        /// </summary>
        /// <param name="identityType"></param>
        /// <param name="authorName"></param>
        /// <param name="authorEmail"></param>
        /// <param name="patch"></param>
        /// <returns>string</returns>
        string SchemaPatchIdentity (string identityType, string authorName, string authorEmail, Patch patch);
    }
  
    /// <summary>
    /// Represents a collection of functions to interact with the API endpoints
    /// </summary>
    public class SchemaApi : ISchemaApi
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="SchemaApi"/> class.
        /// </summary>
        /// <param name="apiClient"> an instance of ApiClient (optional)</param>
        /// <returns></returns>
        public SchemaApi(ApiClient apiClient = null)
        {
            if (apiClient == null) // use the default one in Configuration
                this.ApiClient = Configuration.DefaultApiClient; 
            else
                this.ApiClient = apiClient;
        }
    
        /// <summary>
        /// Initializes a new instance of the <see cref="SchemaApi"/> class.
        /// </summary>
        /// <returns></returns>
        public SchemaApi(String basePath)
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
        ///  Delete Schema
        /// </summary>
        /// <param name="identityType">The type of the identity</param> 
        /// <param name="authorName"></param> 
        /// <param name="authorEmail"></param> 
        /// <returns>string</returns>            
        public string DeleteIdentity (string identityType, string authorName, string authorEmail)
        {
            
            // verify the required parameter 'identityType' is set
            if (identityType == null) throw new ApiException(400, "Missing required parameter 'identityType' when calling DeleteIdentity");
            
            // verify the required parameter 'authorName' is set
            if (authorName == null) throw new ApiException(400, "Missing required parameter 'authorName' when calling DeleteIdentity");
            
            // verify the required parameter 'authorEmail' is set
            if (authorEmail == null) throw new ApiException(400, "Missing required parameter 'authorEmail' when calling DeleteIdentity");
            
    
            var path = "/schemas/{identityType}";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "identityType" + "}", ApiClient.ParameterToString(identityType));
    
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
             if (authorName != null) queryParams.Add("author.name", ApiClient.ParameterToString(authorName)); // query parameter
 if (authorEmail != null) queryParams.Add("author.email", ApiClient.ParameterToString(authorEmail)); // query parameter
                                        
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.DELETE, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling DeleteIdentity: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling DeleteIdentity: " + response.ErrorMessage, response.ErrorMessage);
    
            return (string) ApiClient.Deserialize(response.Content, typeof(string), response.Headers);
        }
    
        /// <summary>
        ///  Get query
        /// </summary>
        /// <returns>List&lt;Object&gt;</returns>            
        public List<Object> GetSchemas ()
        {
            
    
            var path = "/schemas";
            path = path.Replace("{format}", "json");
                
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
                throw new ApiException ((int)response.StatusCode, "Error calling GetSchemas: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling GetSchemas: " + response.ErrorMessage, response.ErrorMessage);
    
            return (List<Object>) ApiClient.Deserialize(response.Content, typeof(List<Object>), response.Headers);
        }
    
        /// <summary>
        ///  Add identity
        /// </summary>
        /// <param name="identityType"></param> 
        /// <param name="authorName"></param> 
        /// <param name="authorEmail"></param> 
        /// <param name="value"></param> 
        /// <returns>string</returns>            
        public string SchemaAddIdentity (string identityType, string authorName, string authorEmail, Object value)
        {
            
            // verify the required parameter 'identityType' is set
            if (identityType == null) throw new ApiException(400, "Missing required parameter 'identityType' when calling SchemaAddIdentity");
            
            // verify the required parameter 'authorName' is set
            if (authorName == null) throw new ApiException(400, "Missing required parameter 'authorName' when calling SchemaAddIdentity");
            
            // verify the required parameter 'authorEmail' is set
            if (authorEmail == null) throw new ApiException(400, "Missing required parameter 'authorEmail' when calling SchemaAddIdentity");
            
            // verify the required parameter 'value' is set
            if (value == null) throw new ApiException(400, "Missing required parameter 'value' when calling SchemaAddIdentity");
            
    
            var path = "/schemas/{identityType}";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "identityType" + "}", ApiClient.ParameterToString(identityType));
    
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
             if (authorName != null) queryParams.Add("author.name", ApiClient.ParameterToString(authorName)); // query parameter
 if (authorEmail != null) queryParams.Add("author.email", ApiClient.ParameterToString(authorEmail)); // query parameter
                                    postBody = ApiClient.Serialize(value); // http body (model) parameter
    
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.POST, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling SchemaAddIdentity: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling SchemaAddIdentity: " + response.ErrorMessage, response.ErrorMessage);
    
            return (string) ApiClient.Deserialize(response.Content, typeof(string), response.Headers);
        }
    
        /// <summary>
        ///  Update identity
        /// </summary>
        /// <param name="identityType"></param> 
        /// <param name="authorName"></param> 
        /// <param name="authorEmail"></param> 
        /// <param name="patch"></param> 
        /// <returns>string</returns>            
        public string SchemaPatchIdentity (string identityType, string authorName, string authorEmail, Patch patch)
        {
            
            // verify the required parameter 'identityType' is set
            if (identityType == null) throw new ApiException(400, "Missing required parameter 'identityType' when calling SchemaPatchIdentity");
            
            // verify the required parameter 'authorName' is set
            if (authorName == null) throw new ApiException(400, "Missing required parameter 'authorName' when calling SchemaPatchIdentity");
            
            // verify the required parameter 'authorEmail' is set
            if (authorEmail == null) throw new ApiException(400, "Missing required parameter 'authorEmail' when calling SchemaPatchIdentity");
            
            // verify the required parameter 'patch' is set
            if (patch == null) throw new ApiException(400, "Missing required parameter 'patch' when calling SchemaPatchIdentity");
            
    
            var path = "/schemas/{identityType}";
            path = path.Replace("{format}", "json");
            path = path.Replace("{" + "identityType" + "}", ApiClient.ParameterToString(identityType));
    
            var queryParams = new Dictionary<String, String>();
            var headerParams = new Dictionary<String, String>();
            var formParams = new Dictionary<String, String>();
            var fileParams = new Dictionary<String, FileParameter>();
            String postBody = null;
    
             if (authorName != null) queryParams.Add("author.name", ApiClient.ParameterToString(authorName)); // query parameter
 if (authorEmail != null) queryParams.Add("author.email", ApiClient.ParameterToString(authorEmail)); // query parameter
                                    postBody = ApiClient.Serialize(patch); // http body (model) parameter
    
            // authentication setting, if any
            String[] authSettings = new String[] {  };
    
            // make the HTTP request
            IRestResponse response = (IRestResponse) ApiClient.CallApi(path, Method.PATCH, queryParams, postBody, headerParams, formParams, fileParams, authSettings);
    
            if (((int)response.StatusCode) >= 400)
                throw new ApiException ((int)response.StatusCode, "Error calling SchemaPatchIdentity: " + response.Content, response.Content);
            else if (((int)response.StatusCode) == 0)
                throw new ApiException ((int)response.StatusCode, "Error calling SchemaPatchIdentity: " + response.ErrorMessage, response.ErrorMessage);
    
            return (string) ApiClient.Deserialize(response.Content, typeof(string), response.Headers);
        }
    
    }
}
