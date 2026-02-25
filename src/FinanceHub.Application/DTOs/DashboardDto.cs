namespace FinanceHub.Application.DTOs;
public record DashboardDto(
    decimal TotalBalance,
    decimal MonthlyIncome,
    decimal MonthlyExpense,
    decimal PreviousMonthIncome,
    decimal PreviousMonthExpense,
    List<CategoryBreakdownDto> TopCategories,
    List<CashFlowDto> CashFlow,
    List<GoalDto> Goals,
    List<BudgetDto> BudgetProgress,
    List<TransactionDto> RecentTransactions);

public record CategoryBreakdownDto(string CategoryName, string Color, string Icon, decimal Amount, decimal Percentage);
public record CashFlowDto(int Month, int Year, decimal Income, decimal Expense);
