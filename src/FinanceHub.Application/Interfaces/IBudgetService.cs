using FinanceHub.Application.DTOs;
namespace FinanceHub.Application.Interfaces;
public interface IBudgetService
{
    Task<List<BudgetDto>> GetAllAsync(Guid userId);
    Task<BudgetDto> GetByIdAsync(Guid userId, Guid id);
    Task<BudgetDto> CreateAsync(Guid userId, CreateBudgetDto dto);
    Task<BudgetDto> UpdateAsync(Guid userId, Guid id, UpdateBudgetDto dto);
    Task DeleteAsync(Guid userId, Guid id);
    Task<BudgetOverviewDto> GetOverviewAsync(Guid userId, int month, int year);
}
