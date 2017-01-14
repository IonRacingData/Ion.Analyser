using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;

namespace Ion.Pro.Analyser
{
    public class ComBus
    {

        public List<ComBusClient> ConnectedClients { get; private set; } = new List<ComBusClient>();
        static ComBus Default { get; set; }

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
        }


    }

    public class ComBusClient
    {
        public int Id { get; set; }
        public string Name { get; set; }
    }

    public class WebSocketComBusClient : ComBusClient
    {
        public TcpClient Client;


    }
}
