using System;
using System.Net.Http;

namespace Tweek.Client
{
    public class AuthenticatedClientFactory
    {
        public static ITweekClient CreateAuthenticatedClient(Uri baseUri,
            AuthenticatedMessageHandler.BearerTokenProvider bearerTokenProvider,
            bool useLegacyEndpoint = default(bool))
        {
            var messageHandler = new AuthenticatedMessageHandler(bearerTokenProvider);
            return new TweekClient(new HttpClient(messageHandler) {BaseAddress = baseUri}, useLegacyEndpoint);
        }

        public static ITweekManagementClient CreateAuthenticatedManagementClient(Uri baseUri,
            AuthenticatedMessageHandler.BearerTokenProvider bearerTokenProvider)
        {
            var messageHandler = new AuthenticatedMessageHandler(bearerTokenProvider);
            return new TweekManagementClient(new HttpClient(messageHandler) {BaseAddress = baseUri});
        }

        public static ITweekManagementClient CreateAuthenticatedManagementClient(Uri baseUri,
            string clientId, string clientSecret)
        {
            return new TweekManagementClient(new HttpClient
            {
                BaseAddress = baseUri,
                DefaultRequestHeaders = {{"X-Client-Id", clientId}, {"X-Client-Secret", clientSecret}}
            });
        }
    }
}