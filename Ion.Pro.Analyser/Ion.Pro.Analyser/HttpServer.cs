using System;
using System.Collections.Generic;
using System.Diagnostics;
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
        public TimingService Watch { get; set; }
        public TcpClient Client { get; set; }

        public HttpWrapper(TcpClient client)
        {
            this.Client = client;
            this.Received = DateTime.Now;
            Watch = new TimingService(true);
        }
    }

    public class TimingService
    {
        public Stopwatch Watch { get; private set; }
        public List<Tuple<long, string>> Records { get; private set; }

        public TimingService(bool start)
        {
            this.Records = new List<Tuple<long, string>>();
            if (start)
                this.Watch = Stopwatch.StartNew();
            else
                this.Watch = new Stopwatch();
        }

        public void Mark(string comment)
        {
            Records.Add(new Tuple<long, string>(Watch.ElapsedTicks, comment));
        }

        public void Stop()
        {
            Watch.Stop();
            Mark("Stopwatch stoped");
        }

        internal void Restart()
        {
            Records.Clear();
            Watch.Restart();
        }
    }

    public class HttpContext
    {
        public HttpHeaderRequest Request { get; set; }
        public HttpHeaderResponse Response { get; set; }
    }
}

