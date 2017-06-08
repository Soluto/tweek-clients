using System;
using System.Net.Http;
using System.Threading.Tasks;
using Xunit;
using Xunit.Abstractions;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using Tweek.Client.Extensions;
using Newtonsoft.Json;

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

        [Theory(DisplayName = "Get produces correct results when called for a single key")]
        [MemberData(nameof(ContextTestCasesProvider.NO_CONTEXT_TEST_CASES), MemberType = typeof(ContextTestCasesProvider))]
        public async Task GetProducesCorrectResultsWithoutInjectedContext(string key, IDictionary<string, string> context, string expected)
        {
            // Arrange
            var expectedToken = JToken.FromObject(expected);

            // Act
            var result = await mTweek.Get(key, context);

            // Assert
            Assert.Equal(expectedToken, result);
        }

        [Theory(DisplayName = "Get produces correct results when called for a single key with context")]
        [MemberData(nameof(ContextTestCasesProvider.CONTEXT_TEST_CASES), MemberType = typeof(ContextTestCasesProvider))]
        public async Task GetProducesCorrectResultsWithInjectedContext(string key, IDictionary<string, string> context, string expected)
        {
            // Arrange
            var expectedToken = JToken.FromObject(expected);

            // Act
            var result = await mTweek.Get(key, context);

            // Assert
            Assert.Equal(expectedToken, result);
        }

        [Theory(DisplayName = "Scan produces correct results when called for a path which has children")]
        [MemberData(nameof(ContextTestCasesProvider.SCAN_TEST_CASES), MemberType = typeof(ContextTestCasesProvider))]
        public async Task ScanProducesCorrectResultsForPathWithChildren(string key, JToken expected)
        {
            // Arrange
            var expectedToken = JToken.FromObject(expected);

            // Act
            var result = await mTweek.Get(key, null);

            // Assert
            Assert.Equal(expectedToken, result);
        }

        [Theory(DisplayName = "Keys with special characters are handled correctly for Append/Get/Delete operations")]
        [MemberData(nameof(ContextTestCasesProvider.SPECIAL_CHARACTERS_CASES), MemberType = typeof(ContextTestCasesProvider))]
        public async Task KeysWithSpecialCharactersAreHandledCorrectly(string identityType, string identityId, string keyPath, JToken value, JToken expected)
        {
            // Append
            IDictionary<string, JToken> context = new Dictionary<string, JToken> { { "@fixed:" + keyPath, value } };
            await mTweek.AppendContext(identityType, identityId, context);

            // Get
            var contextForGet = new Dictionary<string, string> { { identityType, identityId } };
            JToken actual = await mTweek.Get(keyPath, contextForGet);

            Assert.Equal(expected, actual );

            // Delete
            await mTweek.DeleteContextProperty(identityType, identityId, "@fixed:" + keyPath);

            // Make sure it doesn't appear after delete
            actual = await mTweek.Get(keyPath, contextForGet);
            Assert.Equal(JValue.CreateNull(), actual);
        }

        [Theory(DisplayName = "Type-safe desirialization should account for snake case names in Tweek")]
        [MemberData(nameof(ContextTestCasesProvider.SNAKE_CASE_CASES), MemberType = typeof(ContextTestCasesProvider))]
        public async Task TypeSafeDesirializationShouldAccountForSnakeCase(string identityType, string identityId, string keyPath, JToken context, TestClass expected)
        {
            // Arrange
            IDictionary<string, JToken> contextForKeyPath = new Dictionary<string, JToken> { { "@fixed:" + keyPath, context } };
            await mTweek.AppendContext(identityType, identityId, contextForKeyPath);

            // Act
            var contextForGet = new Dictionary<string, string> { { identityType, identityId } };
            var actual = await mTweek.Get<TestClass>(keyPath, contextForGet);

            // Assert
            Assert.Equal(JsonConvert.SerializeObject(expected), JsonConvert.SerializeObject(actual));

            // Cleanup
            await mTweek.DeleteContextProperty(identityType, identityId, "@fixed:" + keyPath);
        }

        [Theory(DisplayName = "Get produces correct results when include is specified")]
        [MemberData(nameof(ContextTestCasesProvider.INCLUDE_TEST_CASES), MemberType = typeof(ContextTestCasesProvider))]
        public async Task GetProducesCorrectResultsForInclude(string key, ICollection<string> includes, JToken expected)
        {
            // Arrange
            var options = new GetRequestOptions { Include = includes };
            IDictionary<string, string> context = null;

            // Act
            var result = await mTweek.Get(key, context, options);

            // Assert
            Assert.Equal(expected, result);
        }

        [Theory(DisplayName = "Get produces correct results when 'flatten' is specified")]
        [MemberData(nameof(ContextTestCasesProvider.FLATTEN_TEST_CASES), MemberType = typeof(ContextTestCasesProvider))]
        public async Task GetProducesCorrectResultsForFlatten(string key, JToken expected)
        {
            // Arrange
            var options = new GetRequestOptions { Flatten = true };
            IDictionary<string, string> context = null;

            // Act
            var result = await mTweek.Get(key, context, options);

            // Assert
            Assert.Equal(expected, result);
        }

        [Theory(DisplayName = "Get produces correct results when 'ignoreKeyTypes' is specified")]
        [MemberData(nameof(ContextTestCasesProvider.IGNORE_KEY_TYPES_TEST_CASES), MemberType = typeof(ContextTestCasesProvider))]
        public async Task GetProducesCorrectResultsForIgnoreKeyTypes(string key, JToken expected)
        {
            // Arrange
            var options = new GetRequestOptions { IgnoreKeyTypes = true };
            IDictionary<string, string> context = null;

            // Act
            var result = await mTweek.Get(key, context, options);

            // Assert
            Assert.Equal(expected.ToString(), result.ToString());
        }

    }
}
