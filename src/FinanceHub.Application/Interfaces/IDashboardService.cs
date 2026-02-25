using FinanceHub.Application.DTOs;
namespace FinanceHub.Application.Interfaces;
public interface IDashboardService
{
    Task<DashboardDto> GetDashboardAsync(Guid userId);
}
