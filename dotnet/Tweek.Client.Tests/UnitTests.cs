using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using FakeItEasy;
using Newtonsoft.Json.Linq;
using Xunit;

namespace Tweek.Client.Tests
{
    public class UnitTests
    {
        [Fact(DisplayName = "Fallback client proceeds to the next endpoint when some endpoint fails")]
        public async Task GivenFallbackClient_WhenSomeEndpointFails_TheClientProceedsToTheNextOne()
        {
            // Arrange
            var expectedResult = JToken.FromObject("Good result");
            var expectedException = new HttpRequestException("Bad endpoint");
            int failureCount = 0;
            var clients = new List<ITweekClient>
            {
                CreateBadFakeClient(expectedException),
                CreateGoodFakeClient(expectedResult),
                CreateBadFakeClient(expectedException)
             };
            var client = new TweekFallbackClient(clients);
            Exception actualException = null;

            client.OnError += (sender, args) =>
            {
                failureCount++;
                actualException = args.Exception;
            };

            // Act
            var actualResult = await client.GetValues("test/key", new Dictionary<string, string>());

            // Assert
            Assert.Equal(1, failureCount);
            Assert.Equal(expectedResult, actualResult);
            Assert.Equal(expectedException, actualException);
        }

        private ITweekClient CreateGoodFakeClient(JToken returnResult)
        {
            var goodClient = A.Fake<ITweekClient>();
            A.CallTo(() => goodClient.GetValues(A<string>._, A<IDictionary<string,string>>._, A<GetRequestOptions>._))
                .ReturnsLazily(() => returnResult);
            return goodClient;
        }

        private ITweekClient CreateBadFakeClient(Exception exceptionToThrow)
        {
            var badClient = A.Fake<ITweekClient>();
            A.CallTo(() => badClient.GetValues(A<string>._, A<IDictionary<string,string>>._, A<GetRequestOptions>._))
                .ThrowsAsync(exceptionToThrow);
            return badClient;
        }
    }
}
