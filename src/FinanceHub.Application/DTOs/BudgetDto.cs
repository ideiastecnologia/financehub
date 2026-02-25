namespace FinanceHub.Application.DTOs;
public record BudgetDto(Guid Id, Guid CategoryId, string CategoryName, string CategoryColor, string CategoryIcon, int Month, int Year, decimal PlannedAmount, decimal SpentAmount, decimal ProgressPercentage);
public record CreateBudgetDto(Guid CategoryId, int Month, int Year, decimal PlannedAmount);
public record UpdateBudgetDto(decimal PlannedAmount);
public record BudgetOverviewDto(int Month, int Year, decimal TotalPlanned, decimal TotalSpent, List<BudgetDto> Budgets);
