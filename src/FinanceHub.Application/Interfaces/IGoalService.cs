using FinanceHub.Application.DTOs;
namespace FinanceHub.Application.Interfaces;
public interface IGoalService
{
    Task<List<GoalDto>> GetAllAsync(Guid userId);
    Task<GoalDto> GetByIdAsync(Guid userId, Guid id);
    Task<GoalDto> CreateAsync(Guid userId, CreateGoalDto dto);
    Task<GoalDto> UpdateAsync(Guid userId, Guid id, UpdateGoalDto dto);
    Task DeleteAsync(Guid userId, Guid id);
    Task<GoalDto> ContributeAsync(Guid userId, Guid id, ContributeGoalDto dto);
}
