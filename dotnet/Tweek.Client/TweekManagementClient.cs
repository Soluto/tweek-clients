using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Tweek.Client
{
    public class TweekManagementClient : BaseTweekClient, ITweekManagementClient
    {
        private const string JSON_MEDIATYPE = "application/json";

        public TweekManagementClient(Uri baseUri) : base(baseUri)
        {
        }

        public TweekManagementClient(HttpClient client) : base(client)
        {
        }
        
        public async Task AppendContext(string identityType, string identityId, IDictionary<string, JToken> context)
        {
            var content = new StringContent(JsonConvert.SerializeObject(context), Encoding.UTF8, JSON_MEDIATYPE);
            var result = await Client.PostAsync(Uri.EscapeUriString($"/api/v2/context/{identityType}/{identityId}"), content);
            result.EnsureSuccessStatusCode();
        }

  
        public async Task DeleteContextProperty(string identityType, string identityId, string property)
        {
            var result = await Client.DeleteAsync(Uri.EscapeUriString($"/api/v2/context/{identityType}/{identityId}/{property}"));
            result.EnsureSuccessStatusCode();
        }
    }
}