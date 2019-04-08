using System.Collections.Generic;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;

namespace Tweek.Client
{
    public class TweekApiFallbackClient : BaseTweekFallbackClient<ITweekApiClient>, ITweekApiClient
    {
        public TweekApiFallbackClient(ICollection<ITweekApiClient> clients) : base(clients)
        {
        }

        public async Task<JToken> GetValues(string keyPath, IDictionary<string, string> context, GetRequestOptions options = null)
        {
            return await ExecuteWithFallback(async client => await client.GetValues(keyPath, context, options));
        }
    }
}