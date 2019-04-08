using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;

namespace Tweek.Client
{
    public interface ITweekManagementClient : IDisposable
    {        
        Task AppendContext(string identityType, string identityId, IDictionary<string,JToken> context);

        Task DeleteContextProperty(string identityType, string identityId, string property);
    }
}