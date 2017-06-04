using System.Threading.Tasks;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;

namespace Tweek.Client
{
    public interface ITweekApiClient
    {
        Task<JToken> Get(string keyPath, IDictionary<string, string> context, bool flatten = false, bool ignoreKeyTypes = false, ICollection<string> include = null);

        Task AppendContext(string identityType, string identityId, IDictionary<string,JToken> context);

        Task DeleteContextProperty(string identityType, string identityId, string property);
    }
}
