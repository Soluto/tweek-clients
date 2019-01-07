using System;
using System.Text;
using System.Collections;
using System.Collections.Generic;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace IO.Swagger.Model {

  /// <summary>
  /// 
  /// </summary>
  [DataContract]
  public class KeyUpdateModel {
    /// <summary>
    /// 
    /// </summary>
    /// <value></value>
    [DataMember(Name="implementation", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "implementation")]
    public Object Implementation { get; set; }

    /// <summary>
    /// 
    /// </summary>
    /// <value></value>
    [DataMember(Name="manifest", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "manifest")]
    public Object Manifest { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class KeyUpdateModel {\n");
      sb.Append("  Implementation: ").Append(Implementation).Append("\n");
      sb.Append("  Manifest: ").Append(Manifest).Append("\n");
      sb.Append("}\n");
      return sb.ToString();
    }

    /// <summary>
    /// Get the JSON string presentation of the object
    /// </summary>
    /// <returns>JSON string presentation of the object</returns>
    public string ToJson() {
      return JsonConvert.SerializeObject(this, Formatting.Indented);
    }

}
}
