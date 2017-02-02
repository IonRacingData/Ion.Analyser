using Ion.Pro.Analyser.Controllers;
using NicroWare.Pro.DmxControl.JSON;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;

namespace Ion.Pro.Analyser
{
    public class ComBus : IComBus
    {
        public List<ComBusClient> ConnectedClients { get; private set; } = new List<ComBusClient>();
        static ComBus Default { get; set; }

        int NodeId { get; set; } = 0;

        private ComBus()
        {

        }

        public static ComBus GetDefault()
        {
            if (Default == null)
            {
                Default = new ComBus();
            }
            return Default;
        }

        public void RegisterClient(ComBusClient client)
        {
            ConnectedClients.Add(client);
            client.Id = NodeId++;
            client.ComBus = this;
        }

        public void SendMessage(ComMessage message)
        {
            Console.WriteLine("Sending Message over Combus: " + message.MessageId + " from: " + message.NodeId + " to: " + message.DestinationId);
            foreach (ComBusClient client in ConnectedClients)
            {
                if (message.NodeId != client.Id)
                {
                    client.ReceiveMessage(message);
                }
            }
        }
    }

    public interface IComBus
    {
        void SendMessage(ComMessage message);
    }

    public class ComMessage
    {
        public int NodeId { get; set; }
        public int DestinationId { get; set; } = -1;
        public int MessageId { get; set; }
        public string Path { get; set; }
        public int Status { get; set; }
        public string Data { get; set; }
    }

    public enum ComMessageStatus : int
    {
        Request110 = 110,
        OK200 = 200,
    }



    public abstract class ComBusClient
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public IComBus ComBus { get; set; }

        public abstract void ReceiveMessage(ComMessage message);
        public virtual void Close()
        {

        }
    }

    public abstract class ComBusRelay : ComBusClient
    {
        public abstract string ReadString();
        public abstract void WriteString(string s);

        protected async Task StartReceiving()
        {
            while (true)
            {
                string request = await Task.Run(() => this.ReadString());
                JSONObject jso = JSONObject.Parse(request);
                ComMessage message = jso.ToObject<ComMessage>();
                message.NodeId = this.Id;
                this.ComBus.SendMessage(message);
                Console.WriteLine($"This is a test message: {message.MessageId}: {message.Path} {message.Status} {message.Data}");
            }
        }

        public override void ReceiveMessage(ComMessage message)
        {
            if (message.DestinationId == this.Id || message.DestinationId < 0)
            {
                this.WriteString(JSONObject.Create(message).ToJsonString());
            }
        }
    }

    public class WebSocketComBusClient : ComBusRelay
    {
        private TcpClient rawClient;
        private WebSocketClient client;
        Task t;

        public WebSocketComBusClient(TcpClient client)
        {
            this.rawClient = client;
            this.client = new WebSocketClient(client.GetStream());
            this.t = base.StartReceiving();
        }

        public override string ReadString()
        {
            return client.ReadString();
        }

        public override void WriteString(string s)
        {
            this.client.WriteString(s);
        }

        public override void Close()
        {
            this.client.BaseStream.Close();
            this.rawClient.Close();
        }
    }

    public static class ComBusExtension
    {
        public static void ReplayMessage(this IComBus comBus, object data, ComMessage message, ComBusClient client)
        {
            comBus.SendMessage(new ComMessage()
            {
                Data = JSONObject.Create(data).ToJsonString(),
                DestinationId = message.NodeId,
                NodeId = client.Id,
                MessageId = message.MessageId,
                Status = (int)ComMessageStatus.OK200
            });
        }

        public static T ReadData<T>(this ComMessage message)
            where T : new()
        {
            return JSONObject.Parse(message.Data).ToObject<T>();
        }
    }
}
