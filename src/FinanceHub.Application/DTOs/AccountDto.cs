namespace FinanceHub.Application.DTOs;
public record AccountDto(Guid Id, string Name, string Type, string Currency, decimal Balance, string Color, string Icon, bool IsActive);
public record CreateAccountDto(string Name, string Type, string Currency, decimal Balance, string Color, string Icon);
public record UpdateAccountDto(string Name, string Type, string Currency, string Color, string Icon, bool IsActive);
public record AccountSummaryDto(decimal TotalBalance, int TotalAccounts, List<AccountDto> Accounts);
