using FinanceHub.Application.DTOs;
namespace FinanceHub.Application.Interfaces;
public interface IAccountService
{
    Task<List<AccountDto>> GetAllAsync(Guid userId);
    Task<AccountDto> GetByIdAsync(Guid userId, Guid id);
    Task<AccountDto> CreateAsync(Guid userId, CreateAccountDto dto);
    Task<AccountDto> UpdateAsync(Guid userId, Guid id, UpdateAccountDto dto);
    Task DeleteAsync(Guid userId, Guid id);
    Task<AccountSummaryDto> GetSummaryAsync(Guid userId);
}
