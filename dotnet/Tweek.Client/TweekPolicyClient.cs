using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using Polly;

namespace Tweek.Client
{
    public class TweekPolicyClient: ITweekClient
    {
        private readonly ITweekClient _client;
        private readonly Policy<JToken> _policy;

        public TweekPolicyClient(ITweekClient client, Policy<JToken> policy)
        {
            _client = client;
            _policy = policy;
        }

        public async Task<JToken> GetValues(string keyPath, IDictionary<string, string> context, GetRequestOptions options)
        {
            return await _policy.ExecuteAsync(async () => await _client.GetValues(keyPath, context, options));
        }

        public void Dispose()
        {
            _client.Dispose();
        }
    }
}
