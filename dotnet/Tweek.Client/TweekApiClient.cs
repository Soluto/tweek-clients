using System;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Net.Http;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Tweek.Client.Extensions;

namespace Tweek.Client
{
    public class TweekApiClient : BaseTweekClient, ITweekApiClient
    {
        private const string JSON_MEDIATYPE = "application/json";

        public TweekApiClient(Uri baseUri) : base(baseUri)
        {
        }

        public TweekApiClient(HttpClient client) : base(client)
        {
        }

        public async Task AppendContext(string identityType, string identityId, IDictionary<string, JToken> context)
        {
            var content = new StringContent(JsonConvert.SerializeObject(context), Encoding.UTF8, JSON_MEDIATYPE);
            var result = await Client.PostAsync(Uri.EscapeUriString($"/api/v1/context/{identityType}/{identityId}"), content);
            result.EnsureSuccessStatusCode();
        }

        public async Task<JToken> Get(string keyPath, IDictionary<string, string> context, GetRequestOptions options)
        {
            var parameters = context?.ToList() ?? new List<KeyValuePair<string,string>>();
            if(options?.Flatten ?? false) parameters.Add(new KeyValuePair<string, string>("$flatten", "true"));
            if(options?.IgnoreKeyTypes ?? false) parameters.Add(new KeyValuePair<string, string>("$ignoreKeyTypes", "true"));

            if(options?.Include != null)
            {
                parameters.AddRange(options.Include.Select(item => new KeyValuePair<string, string>("$include", item)));
            }

            var queryString = string.Join("&", parameters.Select(pair => $"{Uri.EscapeDataString(pair.Key)}={Uri.EscapeDataString(pair.Value)}"));
            using (var stream = await Client.GetStreamAsync($"/api/v1/keys/{keyPath}?{queryString}"))
            {
                return await stream.AsJToken();
            }
        }

        public async Task DeleteContextProperty(string identityType, string identityId, string property)
        {
            var result = await Client.DeleteAsync(Uri.EscapeUriString($"/api/v1/context/{identityType}/{identityId}/{property}"));
            result.EnsureSuccessStatusCode();
        }
    }
}
