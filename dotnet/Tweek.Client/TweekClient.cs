using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Net.Http;
using Newtonsoft.Json.Linq;
using Tweek.Client.Extensions;

namespace Tweek.Client
{
    public class TweekClient : BaseTweekClient, ITweekClient
    {
        private readonly string _baseUrl;
        
        public TweekClient(Uri baseUri, bool useLegacyEndpoint = default(bool)) : base(baseUri)
        {
            _baseUrl = GetBaseUrl(useLegacyEndpoint);
        }

        public TweekClient(HttpClient client, bool useLegacyEndpoint = default(bool)) : base(client)
        {
            _baseUrl = GetBaseUrl(useLegacyEndpoint);
        }

        public async Task<JToken> GetValues(string keyPath, IDictionary<string, string> context, GetRequestOptions options)
        {
            var parameters = context?.ToList() ?? new List<KeyValuePair<string,string>>();
            if(options?.Flatten ?? false) parameters.Add(new KeyValuePair<string, string>("$flatten", "true"));
            if(options?.IgnoreKeyTypes ?? false) parameters.Add(new KeyValuePair<string, string>("$ignoreKeyTypes", "true"));

            if(options?.Include != null)
            {
                parameters.AddRange(options.Include.Select(item => new KeyValuePair<string, string>("$include", item)));
            }

            var queryString = string.Join("&", parameters.Select(pair => $"{Uri.EscapeDataString(pair.Key)}={Uri.EscapeDataString(pair.Value)}"));
            using (var stream = await Client.GetStreamAsync($"{_baseUrl}/{keyPath}?{queryString}"))
            {
                return await stream.AsJToken();
            }
        }

        private static string GetBaseUrl(bool useLegacyEndpoint)
        {
            return useLegacyEndpoint ? "/api/v1/keys" : "/api/v2/values";
        }
    }
}
