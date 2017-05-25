using System.Threading.Tasks;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;

namespace Tweek.Client
{
    public interface ITweekApiClient
    {
        Task<JToken> GetKey(string keyPath, IDictionary<string,string> context);

        Task AppendContext(string identityType, string identityId, IDictionary<string,JToken> context);
    }
}
