using System;
using System.Net.Http;

namespace Tweek.Client
{
    public class BaseTweekClient : IDisposable
    {
        protected readonly HttpClient Client;

        private string _apiClientName;

        public string ApiClientName
        {
            get => _apiClientName;
            set
            {
                _apiClientName = value;
                Client.DefaultRequestHeaders.Remove("X-Api-Client");
                Client.DefaultRequestHeaders.Add("X-Api-Client", _apiClientName);
            }
        }

        protected BaseTweekClient(Uri baseUri)
        {
            Client = new HttpClient {BaseAddress = baseUri};
        }

        protected BaseTweekClient(HttpClient client)
        {
            Client = client;
        }

        public void Dispose()
        {
            Client.Dispose();
        }
    }
}