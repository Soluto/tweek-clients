using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;

namespace Tweek.Client
{
    public interface ITweekApiClient : IDisposable
    {
        Task<JToken> GetValues(string keyPath, IDictionary<string, string> context, GetRequestOptions options = null);
    }
}
