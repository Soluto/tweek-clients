using System.Threading.Tasks;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;
using System;

namespace Tweek.Client.Extensions
{
    public static class TweekApiClientExtensions
    {
        public static async Task<JToken> Scan(this ITweekApiClient client, string keyPath, IDictionary<string,string> context)
        {
            return await client.GetKey($"{keyPath}/_", context);
        }
    }
}