using AutoMapper;
using FinanceHub.Application.DTOs;
using FinanceHub.Application.Interfaces;
using FinanceHub.Domain.Entities;
using FinanceHub.Domain.Enums;
using FinanceHub.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FinanceHub.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public DashboardService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<DashboardDto> GetDashboardAsync(Guid userId)
    {
        var now = DateTime.UtcNow;
        var currentMonthStart = new DateTime(now.Year, now.Month, 1);
        var previousMonthStart = currentMonthStart.AddMonths(-1);
        var sixMonthsAgo = currentMonthStart.AddMonths(-5);

        // Total balance
        var accounts = await _unitOfWork.Repository<Account>().FindAsync(a => a.UserId == userId && a.IsActive);
        var totalBalance = accounts.Sum(a => a.Balance);

        // Current month transactions
        var currentMonthTransactions = await _unitOfWork.Repository<Transaction>()
            .FindAsync(t => t.UserId == userId && t.Date >= currentMonthStart);
        var monthlyIncome = currentMonthTransactions.Where(t => t.Type == TransactionType.Income).Sum(t => t.Amount);
        var monthlyExpense = currentMonthTransactions.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Amount);

        // Previous month
        var prevMonthTransactions = await _unitOfWork.Repository<Transaction>()
            .FindAsync(t => t.UserId == userId && t.Date >= previousMonthStart && t.Date < currentMonthStart);
        var prevMonthIncome = prevMonthTransactions.Where(t => t.Type == TransactionType.Income).Sum(t => t.Amount);
        var prevMonthExpense = prevMonthTransactions.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Amount);

        // Top categories (expenses)
        var expenseTransactions = await _unitOfWork.Repository<Transaction>().Query()
            .Include(t => t.Category)
            .Where(t => t.UserId == userId && t.Date >= currentMonthStart && t.Type == TransactionType.Expense)
            .ToListAsync();

        var totalExpenseAmount = expenseTransactions.Sum(t => t.Amount);
        var topCategories = expenseTransactions
            .GroupBy(t => new { t.Category.Name, t.Category.Color, t.Category.Icon })
            .Select(g => new CategoryBreakdownDto(
                g.Key.Name, g.Key.Color, g.Key.Icon,
                g.Sum(t => t.Amount),
                totalExpenseAmount > 0 ? Math.Round(g.Sum(t => t.Amount) / totalExpenseAmount * 100, 1) : 0))
            .OrderByDescending(c => c.Amount)
            .Take(5)
            .ToList();

        // Cash flow last 6 months
        var allTransactions = await _unitOfWork.Repository<Transaction>()
            .FindAsync(t => t.UserId == userId && t.Date >= sixMonthsAgo);
        var cashFlow = Enumerable.Range(0, 6)
            .Select(i => {
                var monthDate = currentMonthStart.AddMonths(-5 + i);
                var monthTrans = allTransactions.Where(t => t.Date.Year == monthDate.Year && t.Date.Month == monthDate.Month);
                return new CashFlowDto(
                    monthDate.Month, monthDate.Year,
                    monthTrans.Where(t => t.Type == TransactionType.Income).Sum(t => t.Amount),
                    monthTrans.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Amount));
            }).ToList();

        // Goals
        var goals = await _unitOfWork.Repository<Goal>().FindAsync(g => g.UserId == userId && g.Status == GoalStatus.Active);
        var goalDtos = _mapper.Map<List<GoalDto>>(goals);

        // Budget progress
        var budgets = await _unitOfWork.Repository<Budget>().Query()
            .Include(b => b.Category)
            .Where(b => b.UserId == userId && b.Month == now.Month && b.Year == now.Year)
            .ToListAsync();
        var budgetDtos = _mapper.Map<List<BudgetDto>>(budgets);

        // Recent transactions
        var recentTransactions = await _unitOfWork.Repository<Transaction>().Query()
            .Include(t => t.Account)
            .Include(t => t.Category)
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.Date)
            .Take(5)
            .ToListAsync();
        var recentDtos = _mapper.Map<List<TransactionDto>>(recentTransactions);

        return new DashboardDto(totalBalance, monthlyIncome, monthlyExpense,
            prevMonthIncome, prevMonthExpense, topCategories, cashFlow,
            goalDtos, budgetDtos, recentDtos);
    }
}
