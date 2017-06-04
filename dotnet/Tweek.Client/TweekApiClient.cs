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

        public async Task<JToken> Get(string keyPath, IDictionary<string, string> context, bool flatten, bool ignoreKeyTypes, IEnumerable<string> include)
        {
            var parameters = context?.ToList();
            if(parameters == null) parameters = new List<KeyValuePair<string,string>>();
            if(flatten) parameters.Add(new KeyValuePair<string, string>("$flatten", "true"));
            if(ignoreKeyTypes) parameters.Add(new KeyValuePair<string, string>("$ignoreKeyTypes", "true"));

            if(include != null)
            {
                foreach (var item in include)
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
