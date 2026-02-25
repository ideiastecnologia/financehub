using AutoMapper;
using FinanceHub.Application.DTOs;
using FinanceHub.Application.Interfaces;
using FinanceHub.Domain.Entities;
using FinanceHub.Domain.Enums;
using FinanceHub.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FinanceHub.Application.Services;

public class ReportService : IReportService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public ReportService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<MonthlyReportDto> GetMonthlyReportAsync(Guid userId, int year, int month)
    {
        var transactions = await _unitOfWork.Repository<Transaction>().Query()
            .Include(t => t.Category)
            .Where(t => t.UserId == userId && t.Date.Year == year && t.Date.Month == month)
            .ToListAsync();

        var totalIncome = transactions.Where(t => t.Type == TransactionType.Income).Sum(t => t.Amount);
        var totalExpense = transactions.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Amount);

        var incomeByCategory = GetCategoryBreakdown(transactions.Where(t => t.Type == TransactionType.Income), totalIncome);
        var expenseByCategory = GetCategoryBreakdown(transactions.Where(t => t.Type == TransactionType.Expense), totalExpense);

        return new MonthlyReportDto(month, year, totalIncome, totalExpense, totalIncome - totalExpense, incomeByCategory, expenseByCategory);
    }

    public async Task<YearlyReportDto> GetYearlyReportAsync(Guid userId, int year)
    {
        var transactions = await _unitOfWork.Repository<Transaction>()
            .FindAsync(t => t.UserId == userId && t.Date.Year == year);

        var totalIncome = transactions.Where(t => t.Type == TransactionType.Income).Sum(t => t.Amount);
        var totalExpense = transactions.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Amount);

        var monthlyBreakdown = Enumerable.Range(1, 12)
            .Select(m => {
                var monthTrans = transactions.Where(t => t.Date.Month == m);
                return new CashFlowDto(m, year,
                    monthTrans.Where(t => t.Type == TransactionType.Income).Sum(t => t.Amount),
                    monthTrans.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Amount));
            }).ToList();

        return new YearlyReportDto(year, totalIncome, totalExpense, totalIncome - totalExpense, monthlyBreakdown);
    }

    public async Task<List<CategoryBreakdownDto>> GetCategoryBreakdownAsync(Guid userId, string period)
    {
        var now = DateTime.UtcNow;
        DateTime startDate;

        if (period.Equals("year", StringComparison.OrdinalIgnoreCase))
            startDate = new DateTime(now.Year, 1, 1);
        else
            startDate = new DateTime(now.Year, now.Month, 1);

        var transactions = await _unitOfWork.Repository<Transaction>().Query()
            .Include(t => t.Category)
            .Where(t => t.UserId == userId && t.Date >= startDate && t.Type == TransactionType.Expense)
            .ToListAsync();

        var total = transactions.Sum(t => t.Amount);
        return GetCategoryBreakdown(transactions, total);
    }

    private static List<CategoryBreakdownDto> GetCategoryBreakdown(IEnumerable<Transaction> transactions, decimal total)
    {
        return transactions
            .GroupBy(t => new { t.Category.Name, t.Category.Color, t.Category.Icon })
            .Select(g => new CategoryBreakdownDto(
                g.Key.Name, g.Key.Color, g.Key.Icon,
                g.Sum(t => t.Amount),
                total > 0 ? Math.Round(g.Sum(t => t.Amount) / total * 100, 1) : 0))
            .OrderByDescending(c => c.Amount)
            .ToList();
    }
}
