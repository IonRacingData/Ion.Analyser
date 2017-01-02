using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;

namespace Ion.Pro.Analyser
{
    public class HttpServer
    {
        List<TcpFetcher> allFetcher = new List<TcpFetcher>();

        public HttpServer()
        {

        }

        public void Bind(IPAddress address, int port, Func<HttpWrapper, Task> handler)
        {
            TcpFetcher fetcher = new TcpFetcher(address, port);
            allFetcher.Add(fetcher);
            fetcher.Start();

            fetcher.Receive += (object sender, ReceiveEventArgs e) => {
                Task t = handler(e.Wrapper);
            };
        }
    }

    public class ReceiveEventArgs : EventArgs
    {
        public HttpWrapper Wrapper { get; set; }

        public ReceiveEventArgs(HttpWrapper wrapper)
        {
            this.Wrapper = wrapper;
        }
    }

    public class TcpFetcher
    {
        public TcpListener Listner { get; set; }
        Task listnerMethod;
        public event EventHandler<ReceiveEventArgs> Receive;

        public TcpFetcher(IPAddress address, int port)
        {
            this.Listner = new TcpListener(address, port);
        }

        public void Start()
        {
            Listner.Start();
            listnerMethod = ReceiveTaskAsync();
        }

        public async Task ReceiveTaskAsync()
        {
            while (true)
            {
                try
                {
                    TcpClient client = await Listner.AcceptTcpClientAsync();
                    if (client != null)
                    {
                        HttpWrapper wrapper = new HttpWrapper(client);
                        OnReceive(new ReceiveEventArgs(wrapper));
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        private void OnReceive(ReceiveEventArgs e)
        {
            Receive?.Invoke(this, e);
        }
    }

    public class HttpWrapper
    {
        public DateTime Received { get; set; }
        public TcpClient Client { get; set; }

        public HttpWrapper(TcpClient client)
        {
            this.Client = client;
            this.Received = DateTime.Now;
        }
    }
}

