using System.Collections.Generic;

public class GetRequestOptions
{
    public bool Flatten {get; set;} = false;
    public bool IgnoreKeyTypes {get; set;} = false;
    public ICollection<string> Include {get; set;} = null;
}