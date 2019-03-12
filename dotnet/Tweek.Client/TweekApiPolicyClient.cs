using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using Polly;

namespace Tweek.Client
{
    public class TweekApiPolicyClient: ITweekApiClient
    {
        private ITweekApiClient mClient;
        private Policy<JToken> mPolicy;

        public TweekApiPolicyClient(ITweekApiClient client, Policy<JToken> policy)
        {
            mClient = client;
            mPolicy = policy;
        }

        public async Task AppendContext(string identityType, string identityId, IDictionary<string, JToken> context)
        {
            await mPolicy.ExecuteAsync(
                async () => await mClient.AppendContext(identityType, identityId, context)
                    .ContinueWith(_ => (JToken)null)
            );
        }

        public async Task DeleteContextProperty(string identityType, string identityId, string property)
        {
            await mPolicy.ExecuteAsync(
                async () => await mClient.DeleteContextProperty(identityType, identityId, property)
                    .ContinueWith(_ => (JToken)null)
            );
        }

        public async Task<JToken> Get(string keyPath, IDictionary<string, string> context, GetRequestOptions options)
        {
            return await mPolicy.ExecuteAsync(async () => await mClient.Get(keyPath, context, options));
        }

        public void Dispose()
        {
            mClient.Dispose();
        }
    }
}
