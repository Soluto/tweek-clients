using System;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;

namespace Tweek.Client.Tests
{
    public class ContextTestCasesProvider
    {
        public static IEnumerable<object[]> NO_CONTEXT_TEST_CASES()
        {
            yield return new object[] { "@tweek_clients_tests/test_category/test_key1", null, JToken.FromObject("def value") };
            yield return new object[] { "@tweek_clients_tests/test_category/test_key2", null, JToken.FromObject(false) };
            yield return new object[] { "@tweek_clients_tests/test_category2/user_fruit", null, JToken.FromObject("apple") };
        }

        public static IEnumerable<object[]> CONTEXT_TEST_CASES()
        {
            yield return new object [] {
                "@tweek_clients_tests/test_category2/user_fruit",
                new Dictionary<string,string> {{"device.DeviceType", "Desktop"}},
                JToken.FromObject("orange")
            };

            yield return new object [] {
                "@tweek_clients_tests/test_category2/user_fruit",
                new Dictionary<string,string> {{"device.DeviceType", "Mobile"}},
                JToken.FromObject("apple")
            };

            yield return new object [] {
                "@tweek_clients_tests/test_category/test_key1",
                new Dictionary<string,string> {{"device.DeviceOsType", "Ios"}},
                JToken.FromObject("ios value")
            };

            yield return new object [] {
                "@tweek_clients_tests/test_category/test_key1",
                new Dictionary<string,string> {{"device.DeviceOsType", "Android"}},
                JToken.FromObject("def value")
            };

            yield return new object [] {
                "@tweek_clients_tests/test_category/test_key2",
                new Dictionary<string,string> {{"device.PartnerBrandId", "testPartner"}},
                JToken.FromObject(true)
            };

            yield return new object [] {
                "@tweek_clients_tests/test_category/test_key2",
                new Dictionary<string,string> {{"device.PartnerBrandId", "anotherTestPartner"}},
                JToken.FromObject(false)
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
                "userId", "abcd1234", "someKey", JToken.FromObject("☻icons☕"), JToken.FromObject("☻icons☕")
            };

            yield return new object[] {
                "userId", "abcd1234", "someKey", JToken.FromObject("עברית"), JToken.FromObject("עברית")
            };

            yield return new object[] {
                "userId", "abcd1234", "someKey", JToken.FromObject("\nnewline\r"), JToken.FromObject("\nnewline\r")
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

        public static IEnumerable<object[]> INCLUDE_TEST_CASES()
        {
            yield return new object[] {
                "@tweek_clients_tests/test_category/_",
                new [] {"test_key1"},
                JToken.FromObject(new {test_key1 = "def value"})
            };

            yield return new object[] {
                "@tweek_clients_tests/test_category/_",
                new [] {"test_key1", "test_key2"},
                JToken.FromObject(new {test_key1 = "def value", test_key2 = false})
            };
        }

        public static IEnumerable<object[]> FLATTEN_TEST_CASES()
        {
            yield return new object[] {
                "@tweek_clients_tests/_",
                JToken.FromObject(new Dictionary<string,object> {
                    {"test_category/test_key1", "def value"},
                    {"test_category/test_key2", false},
                    {"test_category2/user_fruit","apple"}
                })
            };
        }

        public static IEnumerable<object[]> IGNORE_KEY_TYPES_TEST_CASES()
        {
            yield return new object[] {
                "@tweek_clients_tests/test_category/test_key2",
                JToken.FromObject("false")
            };
        }
    }
}
