using FinanceHub.Application.DTOs;
namespace FinanceHub.Application.Interfaces;
public interface ITransactionService
{
    Task<PagedResultDto<TransactionDto>> GetAllAsync(Guid userId, TransactionFilterDto filter);
    Task<TransactionDto> GetByIdAsync(Guid userId, Guid id);
    Task<TransactionDto> CreateAsync(Guid userId, CreateTransactionDto dto);
    Task<TransactionDto> UpdateAsync(Guid userId, Guid id, UpdateTransactionDto dto);
    Task DeleteAsync(Guid userId, Guid id);
    Task<TransactionSummaryDto> GetSummaryAsync(Guid userId, string period);
}
