using System.Threading.Tasks;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;
using System;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace Tweek.Client.Extensions
{
    public static class TweekApiClientExtensions
    {
        private static readonly JsonSerializer SnakeCaseSerializer = JsonSerializer.CreateDefault(new JsonSerializerSettings() {
                ContractResolver = new DefaultContractResolver {
                    NamingStrategy = new SnakeCaseNamingStrategy()
                }
            });
        public static async Task<T> Get<T>(this ITweekApiClient client, string keyPath, IDictionary<string,string> context)
        {
            var token = await client.Get(keyPath, context);
            return token.ToObject<T>(SnakeCaseSerializer);
        }
    }
}