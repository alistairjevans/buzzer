using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Buzzer.Hubs
{
    public class BuzzerHub : Hub
    {
        public async Task Buzz(string user)
        {
            await Clients.All.SendAsync("UserBuzz", user, DateTime.UtcNow);
        }
    }
}
