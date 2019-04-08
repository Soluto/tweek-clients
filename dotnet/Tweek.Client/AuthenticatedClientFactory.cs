using System;
using System.Net.Http;

namespace Tweek.Client
{
    public class AuthenticatedClientFactory
    {
        public static ITweekClient CreateAuthenticatedClient(Uri baseUri,
            AuthenticatedMessageHandler.BearerTokenProvider bearerTokenProvider)
        {
            var messageHanlder = new AuthenticatedMessageHandler(bearerTokenProvider);
            return new TweekClient(new HttpClient(messageHanlder) {BaseAddress = baseUri});
        }

        public static ITweekManagementClient CreateAuthenticatedManagementClient(Uri baseUri,
            AuthenticatedMessageHandler.BearerTokenProvider bearerTokenProvider)
        {
            var messageHandler = new AuthenticatedMessageHandler(bearerTokenProvider);
            return new TweekManagementClient(new HttpClient(messageHandler) {BaseAddress = baseUri});
        }
    }
}