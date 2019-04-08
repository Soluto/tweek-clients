using System.Collections.Generic;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;

namespace Tweek.Client
{
    public class TweekFallbackClient : BaseTweekFallbackClient<ITweekClient>, ITweekClient
    {
        public TweekFallbackClient(ICollection<ITweekClient> clients) : base(clients)
        {
        }

        public async Task<JToken> GetValues(string keyPath, IDictionary<string, string> context, GetRequestOptions options = null)
        {
            return await ExecuteWithFallback(async client => await client.GetValues(keyPath, context, options));
        }
    }
}