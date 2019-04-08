using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading.Tasks;

namespace Tweek.Client
{
    public class BaseTweekFallbackClient<TClient> : IDisposable
        where TClient: IDisposable
    {
        private readonly ICollection<TClient> _clients;

        public event EventHandler<TweekCallErrorArgs> OnError;

        protected BaseTweekFallbackClient(ICollection<TClient> clients)
        {
            _clients = clients;
        }

        protected async Task<TValue> ExecuteWithFallback<TValue>(Func<TClient, Task<TValue>> action)
        {
            var exceptions = new List<Exception>();
            var stopwatch = new Stopwatch();
            
            foreach (var client in _clients)
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
                    var errorArgs = new TweekCallErrorArgs
                    {
                        Exception = exception,
                        TimeElapsed = stopwatch.Elapsed,
                    };
                    OnError?.Invoke(this, errorArgs);
                }
            }
            throw new AggregateException("All fallbacks are exhausted", exceptions);
        }

        protected async Task ExecuteWithFallback(Func<TClient, Task> action)
        {
            await ExecuteWithFallback<object>(async client =>
            {
                await action(client);
                return null;
            });
        }

        public void Dispose()
        {
            foreach (var client in _clients)
            {
                client.Dispose();
            }
        }
    }
}