using Ion.Pro.Analyser.SenSys;
using NicroWare.Pro.DmxControl.JSON;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace Ion.Test.InfluxTest
{
    class Program
    {
        static string url = "http://127.0.0.1:8086/";
        static string db = "iontest";
        static string dataset = "../../../Ion.Pro.Analyser/Data/Sets/126_usart_data.log16";

        static void Main(string[] args)
        {
            HttpClient client = new HttpClient();
            SensorManager manager = new SensorManager();

            manager.RegisterFileProvider("log16", new LegacySensorProvider());

            SensorDataSet set = manager.Load(dataset);

            //Task t = PostData(client);
            //Task t = GetData(client);
            Task t = InsertData(client, set);

            t.Wait();
            
        }

        public static async Task InsertData(HttpClient client, SensorDataSet set)
        {
            StringBuilder sb = new StringBuilder();
            foreach (KeyValuePair<string, List<RealSensorPackage>> pair in set.AllData)
            {
                if (char.IsNumber(pair.Key[0]))
                    continue;
                foreach (RealSensorPackage rsp in pair.Value)
                {
                    sb.AppendLine($"{pair.Key} value={rsp.Value.ToString().Replace(",", ".")} {rsp.TimeStamp}");
                }
            }
            HttpResponseMessage message = await client.PostAsync(CreateWrite(db, false), new StringContent(sb.ToString().Replace("\r", "")));
            Console.WriteLine(await message.Content.ReadAsStringAsync());


        }

        public static async Task PostData(HttpClient client)
        {
            HttpResponseMessage message = await client.PostAsync(CreateWrite(db, true), new StringContent("speedpeddal value=0.89"));
            Console.WriteLine(await message.Content.ReadAsStringAsync());
        }

        public static async Task GetData(HttpClient client)
        {
            //Task<HttpResponseMessage> message = client.GetAsync(url + "query?pretty=true&db=mydb&q=select * FROM speedpeddal");
            HttpResponseMessage message = await client.GetAsync(CreateQuery(db, "select * FROM speedpeddal", true));
            string s = await message.Content.ReadAsStringAsync();
            Console.WriteLine(s);
            JSONObject jo = JSONObject.Parse(s);
        }

        private static string CreateQuery(string db, string sql, bool pretty = false)
        {
            return $"{url}query?pretty={pretty.ToString().ToLower()}&db={db}&q={sql}";
        }

        private static string CreateWrite(string db, bool pretty = false)
        {
            return $"{url}write?pretty={pretty.ToString().ToLower()}&db={db}";
        }
    }

    
}
