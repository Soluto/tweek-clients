using System;
using System.Net.Http;

namespace Tweek.Client
{
    public class AuthenticatedClientFactory
    {
        public static ITweekApiClient CreateAuthenticatedApiClient(Uri baseUri,
                string authorityUrl,
                string resourceId,
                string clientId,
                string clientSecret)
        {
            var messageHanlder = new AuthenticatedMessageHandler(authorityUrl, resourceId, clientId, clientSecret);
            return new TweekApiClient(new HttpClient(messageHanlder) { BaseAddress = baseUri });
        }
    }
}