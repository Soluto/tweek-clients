using System.Collections.Generic;
using Newtonsoft.Json.Linq;

namespace Tweek.Client.Tests
{
    public class ContextTestCasesProvider
    {
        public static IEnumerable<object[]> NO_CONTEXT_TEST_CASES()
        {
            yield return new object[] { "@tweek_clients_tests/test_category/test_key1", null, "def value" };
            yield return new object[] { "@tweek_clients_tests/test_category/test_key2", null, "False" };
            yield return new object[] { "@tweek_clients_tests/test_category2/user_fruit", null, "apple" };
        }

        public static IEnumerable<object[]> CONTEXT_TEST_CASES()
        {
            yield return new object [] {
                "@tweek_clients_tests/test_category2/user_fruit",
                new Dictionary<string,string> {{"device.DeviceType", "Desktop"}},
                "orange"
            };

            yield return new object [] {
                "@tweek_clients_tests/test_category2/user_fruit",
                new Dictionary<string,string> {{"device.DeviceType", "Mobile"}},
                "apple"
            };

            yield return new object [] {
                "@tweek_clients_tests/test_category/test_key1",
                new Dictionary<string,string> {{"device.DeviceOsType", "Ios"}},
                "ios value"
            };

            yield return new object [] {
                "@tweek_clients_tests/test_category/test_key1",
                new Dictionary<string,string> {{"device.DeviceOsType", "Android"}},
                "def value"
            };

            yield return new object [] {
                "@tweek_clients_tests/test_category/test_key2",
                new Dictionary<string,string> {{"device.PartnerBrandId", "testPartner"}},
                "True"
            };

            yield return new object [] {
                "@tweek_clients_tests/test_category/test_key2",
                new Dictionary<string,string> {{"device.PartnerBrandId", "anotherTestPartner"}},
                "False"
            };
        }

        public static IEnumerable<object[]> SCAN_TEST_CASES()
        {
            yield return new object[] {
                "@tweek_clients_tests/test_category2/_",
                JToken.FromObject( new { user_fruit = "apple" })
            };
        }

        public static IEnumerable<object[]> SPECIAL_CHARACTERS_CASES()
        {
            yield return new object[] {
                "userId", "abcd1234", "plainString", JToken.FromObject("someValue"), JToken.FromObject("someValue")
            };

            yield return new object[] {
                "userId", "abcd1234", "☻icons☕", JToken.FromObject("someValue"), JToken.FromObject("someValue")
            };

            yield return new object[] {
                "userId", "abcd1234", "עברית", JToken.FromObject("someValue"), JToken.FromObject("someValue")
            };

            yield return new object[] {
                "userId", "abcd1234", "\nnewline\r", JToken.FromObject("someValue"), JToken.FromObject("someValue")
            };

            yield return new object[] {
                "userId", "abcd1234", "a/b/c", JToken.FromObject("someValue"), JToken.FromObject("someValue")
            };

            yield return new object[] {
                "userId", "abcd1234", "@something", JToken.FromObject("someValue"), JToken.FromObject("someValue")
            };

            yield return new object[] {
                "userEmail", "abc@example.com", "email", JToken.FromObject("abc@example.com"), JToken.FromObject("abc@example.com")
            };

        }

        public static IEnumerable<object[]> SNAKE_CASE_CASES()
        {
            // (string identityType, string identityId, string keyPath, JToken context, TestClass expected)
            var expected1 = new TestClass { SomeInteger = 1, SomeString = "string", SomeBoolean = true};
            var context1 = JToken.FromObject(new {
                some_integer = 1,
                some_string = "string",
                some_boolean = true,
            });

            yield return new object[] {
                "userId", "abcd1234", "test_key_path", context1, expected1
            };
        }

    }
}
