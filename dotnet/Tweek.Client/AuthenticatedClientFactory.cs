using System;
using System.Net.Http;

namespace Tweek.Client
{
    public class AuthenticatedClientFactory
    {
        public static ITweekApiClient CreateAuthenticatedApiClient(Uri baseUri,
            AuthenticatedMessageHandler.BearerTokenProvider bearerTokenProvider)
        {
            var messageHanlder = new AuthenticatedMessageHandler(bearerTokenProvider);
            return new TweekApiClient(new HttpClient(messageHanlder) { BaseAddress = baseUri });
        }
    }
}