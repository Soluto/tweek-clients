using System.Collections.Generic;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;

namespace Tweek.Client
{
    public class TweekManagementFallbackClient : BaseTweekFallbackClient<ITweekManagementClient>, ITweekManagementClient
    {
        public TweekManagementFallbackClient(ICollection<ITweekManagementClient> clients) : base(clients)
        {
        }

        public async Task AppendContext(string identityType, string identityId, IDictionary<string, JToken> context)
        {
            await ExecuteWithFallback(async client => await client.AppendContext(identityType, identityId, context));
        }

        public async Task DeleteContextProperty(string identityType, string identityId, string property)
        {
            await ExecuteWithFallback(async client => await client.DeleteContextProperty(identityType, identityId, property));
        }
    }
}