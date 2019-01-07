//
// ConfiguraitonAPI.swift
//
// Generated by openapi-generator
// https://openapi-generator.tech
//

import Alamofire



public class ConfiguraitonAPI: APIBase {
    /**

     - parameter keyName: (query) Context ids 
     - parameter params: (query)  (optional)
     - parameter include: (query) Include additional keys (optional)
     - parameter flatten: (query) Return flat key/value JSON (no nesting) (optional)
     - parameter completion: completion handler to receive the data and the error objects
     */
    public class func getValue(keyName keyName: String, params: [String:String]? = nil, include: [String]? = nil, flatten: Bool? = nil, completion: ((error: ErrorType?) -> Void)) {
        getValueWithRequestBuilder(keyName: keyName, params: params, include: include, flatten: flatten).execute { (response, error) -> Void in
            completion(error: error);
        }
    }


    /**
     - GET /values
     - Get tweek key value     - parameter keyName: (query) Context ids 
     - parameter params: (query)  (optional)
     - parameter include: (query) Include additional keys (optional)
     - parameter flatten: (query) Return flat key/value JSON (no nesting) (optional)

     - returns: RequestBuilder<Void> 
     */
    public class func getValueWithRequestBuilder(keyName keyName: String, params: [String:String]? = nil, include: [String]? = nil, flatten: Bool? = nil) -> RequestBuilder<Void> {
        let path = "/values"
        let URLString = OpenAPIClientAPI.basePath + path

        let nillableParameters: [String:AnyObject?] = [
            "params": params,
            "keyName": keyName,
            "$include": include,
            "$flatten": flatten
        ]
 
        let parameters = APIHelper.rejectNil(nillableParameters)
 
        let convertedParameters = APIHelper.convertBoolToString(parameters)
 
        let requestBuilder: RequestBuilder<Void>.Type = OpenAPIClientAPI.requestBuilderFactory.getBuilder()

        return requestBuilder.init(method: "GET", URLString: URLString, parameters: convertedParameters, isBody: false)
    }

}
