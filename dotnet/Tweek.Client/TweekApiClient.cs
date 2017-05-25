using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Net.Http;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Tweek.Client
{

    public class TweekApiClient : ITweekApiClient
    {
        private HttpClient mClient;
        private Uri mBaseUri;
        private const string JSON_MEDIATYPE = "application/json";

        public TweekApiClient(Uri baseUri)
        {
            mBaseUri = baseUri;
            mClient = new HttpClient { BaseAddress = baseUri };
        }

        public TweekApiClient(HttpClient client)
        {
            mClient = client;
            mBaseUri = mClient.BaseAddress;
        }

        public async Task AppendContext(string identityType, string identityId, IDictionary<string, JToken> context)
        {
            var content = new StringContent(JsonConvert.SerializeObject(context), Encoding.UTF8, JSON_MEDIATYPE);
            await mClient.PostAsync(Uri.EscapeUriString($"/context/{identityType}/{identityId}"), content);
        }

        public async Task<JToken> GetKey(string keyPath, IDictionary<string, string> context)
        {
            var queryString = (context == null) ? "" : string.Join("&", context.Select(pair => $"{Uri.EscapeDataString(pair.Key)}={Uri.EscapeDataString(pair.Value)}"));
            var escapedKeyPath = Uri.EscapeUriString(keyPath);

            var stream = await mClient.GetStreamAsync($"/configurations/{escapedKeyPath}?{queryString}");
            return JToken.Load(new JsonTextReader(new StreamReader(stream)));
        }
    }
}
