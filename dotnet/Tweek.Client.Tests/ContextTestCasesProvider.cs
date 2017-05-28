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

    }
}
