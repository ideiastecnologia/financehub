using FinanceHub.Application.DTOs;
namespace FinanceHub.Application.Interfaces;
public interface IReportService
{
    Task<MonthlyReportDto> GetMonthlyReportAsync(Guid userId, int year, int month);
    Task<YearlyReportDto> GetYearlyReportAsync(Guid userId, int year);
    Task<List<CategoryBreakdownDto>> GetCategoryBreakdownAsync(Guid userId, string period);
}
