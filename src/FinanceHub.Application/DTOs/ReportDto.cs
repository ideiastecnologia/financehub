namespace FinanceHub.Application.DTOs;
public record MonthlyReportDto(int Month, int Year, decimal TotalIncome, decimal TotalExpense, decimal Balance, List<CategoryBreakdownDto> IncomeByCategory, List<CategoryBreakdownDto> ExpenseByCategory);
public record YearlyReportDto(int Year, decimal TotalIncome, decimal TotalExpense, decimal Balance, List<CashFlowDto> MonthlyBreakdown);
public record CategoryReportDto(string CategoryName, string Color, decimal TotalAmount, List<CategoryBreakdownDto> SubCategories, List<TransactionDto> Transactions);
