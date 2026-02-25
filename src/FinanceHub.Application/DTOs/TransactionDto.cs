namespace FinanceHub.Application.DTOs;
public record TransactionDto(Guid Id, Guid AccountId, string AccountName, Guid CategoryId, string CategoryName, string CategoryColor, string CategoryIcon, string Type, decimal Amount, string Description, DateTime Date, bool IsRecurring, string? RecurrenceRule, string? Tags, string? Notes, string? AttachmentUrl);
public record CreateTransactionDto(Guid AccountId, Guid CategoryId, string Type, decimal Amount, string Description, DateTime Date, bool IsRecurring, string? RecurrenceRule, string? Tags, string? Notes);
public record UpdateTransactionDto(Guid AccountId, Guid CategoryId, string Type, decimal Amount, string Description, DateTime Date, bool IsRecurring, string? RecurrenceRule, string? Tags, string? Notes);
public record TransactionFilterDto(DateTime? DateFrom, DateTime? DateTo, Guid? CategoryId, Guid? AccountId, string? Type, decimal? MinAmount, decimal? MaxAmount, string? Search, int Page = 1, int PageSize = 20);
public record TransactionSummaryDto(decimal TotalIncome, decimal TotalExpense, decimal Balance, int TotalTransactions);
