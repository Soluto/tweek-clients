using System;
using System.Net.Http;

namespace Tweek.Client
{
    public class AuthenticatedClientFactory
    {
        public static ITweekApiClient CreateAuthenticatedApiClient(Uri baseUri,
            AuthenticatedMessageHandler.BearerTokenProviderDelegate bearerTokenProviderDelegate)
        {
            var messageHanlder = new AuthenticatedMessageHandler(bearerTokenProviderDelegate);
            return new TweekApiClient(new HttpClient(messageHanlder) { BaseAddress = baseUri });
        }
    }
}