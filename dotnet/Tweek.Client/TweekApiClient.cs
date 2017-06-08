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
        private const string JSON_MEDIATYPE = "application/json";

        public TweekApiClient(Uri baseUri)
        {
            mClient = new HttpClient { BaseAddress = baseUri };
        }

        public TweekApiClient(HttpClient client)
        {
            mClient = client;
        }

        public async Task AppendContext(string identityType, string identityId, IDictionary<string, JToken> context)
        {
            var content = new StringContent(JsonConvert.SerializeObject(context), Encoding.UTF8, JSON_MEDIATYPE);
            await mClient.PostAsync(Uri.EscapeUriString($"/api/v1/context/{identityType}/{identityId}"), content);
        }

        public async Task<JToken> Get(string keyPath, IDictionary<string, string> context, GetRequestOptions options)
        {
            var parameters = context?.ToList() ?? new List<KeyValuePair<string,string>>();
            if(options.Flatten) parameters.Add(new KeyValuePair<string, string>("$flatten", "true"));
            if(options.IgnoreKeyTypes) parameters.Add(new KeyValuePair<string, string>("$ignoreKeyTypes", "true"));

            if(options.Include != null)
            {
                foreach (var item in options.Include)
                {
                    parameters.Add(new KeyValuePair<string, string>("$include", item));
                }
            }

            var queryString = (parameters == null) ? "" : string.Join("&", parameters.Select(pair => $"{Uri.EscapeDataString(pair.Key)}={Uri.EscapeDataString(pair.Value)}"));
            var stream = await mClient.GetStreamAsync($"/api/v1/keys/{keyPath}?{queryString}");
            return await JToken.LoadAsync(new JsonTextReader(new StreamReader(stream)));
        }

        public async Task DeleteContextProperty(string identityType, string identityId, string property)
        {
            await mClient.DeleteAsync(Uri.EscapeUriString($"/api/v1/context/{identityType}/{identityId}/{property}"));
        }
    }
}
