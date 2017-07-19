using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.IdentityModel.Clients.ActiveDirectory;

namespace Tweek.Client
{
    public class AuthenticatedMessageHandler : DelegatingHandler
    {
        private readonly AuthenticationContext mAuthContext;
        private readonly string mResourceId;
        private readonly string mClientId;
        private readonly string mClientSecret;

        public AuthenticatedMessageHandler(string authorityUrl, string resourceId, string clientId, string clientSecret)
        {
            InnerHandler = new HttpClientHandler();
            mResourceId = resourceId;
            mClientId = clientId;
            mClientSecret = clientSecret;
            mAuthContext = new AuthenticationContext(authorityUrl, TokenCache.DefaultShared);
        }

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            var token = (await mAuthContext.AcquireTokenAsync(mResourceId, new ClientCredential(mClientId, mClientSecret))).AccessToken;
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            return await base.SendAsync(request, cancellationToken);
        }
    }
}