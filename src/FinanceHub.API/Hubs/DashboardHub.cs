using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace FinanceHub.API.Hubs;

[Authorize]
public class DashboardHub : Hub
{
    public async Task JoinDashboard(string userId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"dashboard_{userId}");
    }

    public async Task LeaveDashboard(string userId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"dashboard_{userId}");
    }
}
