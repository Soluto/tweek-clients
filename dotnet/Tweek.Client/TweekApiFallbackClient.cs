using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;


namespace Tweek.Client
{

    public class TweekApiFallbackClient : ITweekApiClient
    {
        public class ApiCallErrorArgs : EventArgs
        {
            public TimeSpan TimeElapsed { get; set; }
            public Exception Exception { get; set; }
        }

        public event EventHandler<ApiCallErrorArgs> ApiCallErrorHandler;

        IEnumerable<ITweekApiClient> mClients;

        public TweekApiFallbackClient(IEnumerable<ITweekApiClient> clients)
        {
            mClients = clients;
        }

        public async Task AppendContext(string identityType, string identityId, IDictionary<string, JToken> context)
        {
            await ExecuteWithFallback(async client => await client.AppendContext(identityType, identityId, context));
        }

        public async Task DeleteContextProperty(string identityType, string identityId, string property)
        {
            await ExecuteWithFallback(async client => await client.DeleteContextProperty(identityType, identityId, property));
        }

        public async Task<JToken> Get(string keyPath, IDictionary<string, string> context, GetRequestOptions options = null)
        {
            return await ExecuteWithFallback(async client => await client.Get(keyPath, context, options));
        }

        private async Task<T> ExecuteWithFallback<T>(Func<ITweekApiClient, Task<T>> action)
        {
            var exceptions = new List<Exception>();
            Stopwatch stopwatch = new Stopwatch();
            foreach (var client in mClients)
            {
                try
                {
                    stopwatch.Start();
                    return await action(client);
                }
                catch (Exception exception)
                {
                    stopwatch.Stop();
                    exceptions.Add(exception);
                    var errorArgs = new ApiCallErrorArgs()
                    {
                        Exception = exception,
                        TimeElapsed = stopwatch.Elapsed,
                    };
                    ApiCallErrorHandler?.Invoke(this, errorArgs);
                }
            }
            throw new AggregateException("All fallbacks are exhausted", exceptions);
        }

        private async Task ExecuteWithFallback(Func<ITweekApiClient, Task> action)
        {
            await ExecuteWithFallback<object>(async client =>
            {
                await action(client);
                return null;
            });
        }
        
    }
}
