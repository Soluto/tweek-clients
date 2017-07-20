using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading;
using System.Threading.Tasks;

namespace Tweek.Client
{
    public class AuthenticatedMessageHandler : DelegatingHandler
    {

        public delegate Task<string> BearerTokenProviderDelegate();

        private BearerTokenProviderDelegate mGetBearerToken;
        public AuthenticatedMessageHandler(HttpMessageHandler innerHandler, BearerTokenProviderDelegate getBearerToken)
        {
            InnerHandler = innerHandler;
            mGetBearerToken = getBearerToken;
        }

        public AuthenticatedMessageHandler(BearerTokenProviderDelegate getBearerToken) : this(new HttpClientHandler(), getBearerToken)
        {
        }

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", await mGetBearerToken());
            return await base.SendAsync(request, cancellationToken);
        }
    }
}