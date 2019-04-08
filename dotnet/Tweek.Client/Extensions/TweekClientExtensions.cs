using System.Threading.Tasks;
using System.Collections.Generic;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace Tweek.Client.Extensions
{
    public static class TweekClientExtensions
    {
        private static readonly JsonSerializer SnakeCaseSerializer = JsonSerializer.CreateDefault(
            new JsonSerializerSettings
            {
                ContractResolver = new DefaultContractResolver
                {
                    NamingStrategy = new SnakeCaseNamingStrategy()
                }
            });

        public static async Task<T> GetValues<T>(this ITweekClient client, string keyPath, IDictionary<string, string> context)
        {
            var token = await client.GetValues(keyPath, context);
            return token.ToObject<T>(SnakeCaseSerializer);
        }
    }
}