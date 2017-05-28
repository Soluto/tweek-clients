using System.Threading.Tasks;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;
using System;

namespace Tweek.Client.Extensions
{
    public static class TweekApiClientExtensions
    {
        public static async Task<T> Get<T>(this ITweekApiClient client, string keyPath, IDictionary<string,string> context)
        {
            var token = await client.Get(keyPath, context);
            return token.ToObject<T>();
        }
    }
}