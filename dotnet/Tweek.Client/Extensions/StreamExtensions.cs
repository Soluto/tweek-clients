using System.IO;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Tweek.Client.Extensions
{
    public static class StreamExtensions
    {
        public static async Task<JToken> AsJToken(this Stream stream)
        {
            using (var sr = new StreamReader(stream))
            using (var jr = new JsonTextReader(sr))
            {
                return await JToken.LoadAsync(jr);
            }
        } 
    }
}
