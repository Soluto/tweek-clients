using System.Collections.Generic;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using Polly;

namespace Tweek.Client
{
    public class TweekManagementPolicyClient : ITweekManagementClient
    {
        private readonly ITweekManagementClient _client;
        private readonly Policy<JToken> _policy;

        public TweekManagementPolicyClient(ITweekManagementClient client, Policy<JToken> policy)
        {
            _client = client;
            _policy = policy;
        }

        public async Task AppendContext(string identityType, string identityId, IDictionary<string, JToken> context)
        {
            await _policy.ExecuteAsync(
                async () => await _client.AppendContext(identityType, identityId, context)
                    .ContinueWith(_ => (JToken)null)
            );
        }

        public async Task DeleteContextProperty(string identityType, string identityId, string property)
        {
            await _policy.ExecuteAsync(
                async () => await _client.DeleteContextProperty(identityType, identityId, property)
                    .ContinueWith(_ => (JToken)null)
            );
        }

        public void Dispose()
        {
            _client.Dispose();
        }
    }
}