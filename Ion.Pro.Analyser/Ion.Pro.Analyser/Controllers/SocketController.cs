using Ion.Pro.Analyser.Web;

namespace Ion.Pro.Analyser.Controllers
{
    class SocketController : Controller
    {
        public IActionResult Connect()
        {
            if (WebSocket.IsWebSocketRequest(HttpContext))
            {
                return WebSocket.CreateResult(HttpContext, HandleSocket);
            }
            return Error("Problem creating WebSocket", HttpStatus.BadRequest400);
        }

        public void HandleSocket(HttpContext context)
        {
            ComBus.GetDefault().RegisterClient(new WebSocketComBusClient(context.Wrapper.Client));
        }
    }
}
