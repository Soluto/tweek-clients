using System;
using System.Net.Http;
using System.Threading.Tasks;
using Xunit;
using Xunit.Abstractions;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;

namespace Tweek.Client.Tests
{
    public class SmokeTests
    {
        private ITweekApiClient mTweek;
        private ITestOutputHelper mOutput;

        public SmokeTests(ITestOutputHelper output)
        {
            Uri baseUri = new Uri(Environment.GetEnvironmentVariable("TWEEK_TEST_URI") ?? "http://tweek-api");
            mTweek = new TweekApiClient(new HttpClient { BaseAddress = baseUri });
            mOutput = output;
        }

        [Theory(DisplayName = "GetKey produces correct results when called for a single key")]
        [MemberData(nameof(ContextTestCasesProvider.NO_CONTEXT_TEST_CASES), MemberType = typeof(ContextTestCasesProvider))]
        public async Task GetKeyProducesCorrectResultsWithoutInjectedContext(string key, IDictionary<string, string> context, string expected)
        {
            // Arrange
            var expectedToken = JToken.FromObject(expected);

            // Act
            var result = await mTweek.GetKey(key, context);

            // Assert
            Assert.Equal(expectedToken, result);
        }

        [Theory(DisplayName = "GetKey produces correct results when called for a single key with context")]
        [MemberData(nameof(ContextTestCasesProvider.CONTEXT_TEST_CASES), MemberType = typeof(ContextTestCasesProvider))]
        public async Task GetKeyProducesCorrectResultsWithInjectedContext(string key, IDictionary<string, string> context, string expected)
        {
            // Arrange
            var expectedToken = JToken.FromObject(expected);

            // Act
            var result = await mTweek.GetKey(key, context);

            // Assert
            Assert.Equal(expectedToken, result);
        }
    }
}
