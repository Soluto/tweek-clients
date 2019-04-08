using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using FakeItEasy;
using Newtonsoft.Json.Linq;
using Xunit;
using Xunit.Abstractions;


namespace Tweek.Client.Tests
{
    public class UnitTests
    {
        private readonly ITestOutputHelper mOutput;

        public UnitTests(ITestOutputHelper output)
        {
            mOutput = output;
        }

        [Fact(DisplayName = "Fallback client proceeds to the next endpoint when some endpoint fails")]
        public async Task GivenFallbackClient_WhenSomeEndpointFails_TheClientProceedsToTheNextOne()
        {
            // Arrange
            var expectedResult = JToken.FromObject("Good result");
            var expectedException = new HttpRequestException("Bad endpoint");
            int failureCount = 0;
            var clients = new List<ITweekApiClient>
            {
                CreateBadFakeClient(expectedException),
                CreateGoodFakeClient(expectedResult),
                CreateBadFakeClient(expectedException)
             };
            var client = new TweekApiFallbackClient(clients);
            Exception actualException = null;

            client.OnError += (sender, args) =>
            {
                failureCount++;
                actualException = args.Exception;
            };

            // Act
            var actualResult = await client.Get("test/key", new Dictionary<string, string>());

            // Assert
            Assert.Equal(1, failureCount);
            Assert.Equal(expectedResult, actualResult);
            Assert.Equal(expectedException, actualException);
        }

        private ITweekApiClient CreateGoodFakeClient(JToken returnResult)
        {
            var goodClient = A.Fake<ITweekApiClient>();
            A.CallTo(() => goodClient.Get(A<string>._, A<IDictionary<string,string>>._, A<GetRequestOptions>._))
                .ReturnsLazily(() => returnResult);
            return goodClient;
        }

        private ITweekApiClient CreateBadFakeClient(Exception exceptionToThrow)
        {
            var badClient = A.Fake<ITweekApiClient>();
            A.CallTo(() => badClient.Get(A<string>._, A<IDictionary<string,string>>._, A<GetRequestOptions>._))
                .ThrowsAsync(exceptionToThrow);
            return badClient;
        }
    }
}
