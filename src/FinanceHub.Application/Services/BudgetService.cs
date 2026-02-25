using AutoMapper;
using FinanceHub.Application.DTOs;
using FinanceHub.Application.Interfaces;
using FinanceHub.Domain.Entities;
using FinanceHub.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FinanceHub.Application.Services;

public class BudgetService : IBudgetService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public BudgetService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<List<BudgetDto>> GetAllAsync(Guid userId)
    {
        var budgets = await _unitOfWork.Repository<Budget>().Query()
            .Include(b => b.Category)
            .Where(b => b.UserId == userId)
            .ToListAsync();
        return _mapper.Map<List<BudgetDto>>(budgets);
    }

    public async Task<BudgetDto> GetByIdAsync(Guid userId, Guid id)
    {
        var budget = await _unitOfWork.Repository<Budget>().Query()
            .Include(b => b.Category)
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);
        if (budget == null)
            throw new KeyNotFoundException("Budget not found.");
        return _mapper.Map<BudgetDto>(budget);
    }

    public async Task<BudgetDto> CreateAsync(Guid userId, CreateBudgetDto dto)
    {
        var budget = _mapper.Map<Budget>(dto);
        budget.UserId = userId;

        // Calculate already spent amount
        var transactions = await _unitOfWork.Repository<Transaction>()
            .FindAsync(t => t.UserId == userId && t.CategoryId == dto.CategoryId
                && t.Date.Month == dto.Month && t.Date.Year == dto.Year
                && t.Type == Domain.Enums.TransactionType.Expense);
        budget.SpentAmount = transactions.Sum(t => t.Amount);

        await _unitOfWork.Repository<Budget>().AddAsync(budget);
        await _unitOfWork.SaveChangesAsync();

        return await GetByIdAsync(userId, budget.Id);
    }

    public async Task<BudgetDto> UpdateAsync(Guid userId, Guid id, UpdateBudgetDto dto)
    {
        var budget = await _unitOfWork.Repository<Budget>().Query()
            .Include(b => b.Category)
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);
        if (budget == null)
            throw new KeyNotFoundException("Budget not found.");

        budget.PlannedAmount = dto.PlannedAmount;
        budget.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Repository<Budget>().UpdateAsync(budget);
        await _unitOfWork.SaveChangesAsync();
        return _mapper.Map<BudgetDto>(budget);
    }

    public async Task DeleteAsync(Guid userId, Guid id)
    {
        var budget = await _unitOfWork.Repository<Budget>().GetByIdAsync(id);
        if (budget == null || budget.UserId != userId)
            throw new KeyNotFoundException("Budget not found.");
        await _unitOfWork.Repository<Budget>().DeleteAsync(budget);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<BudgetOverviewDto> GetOverviewAsync(Guid userId, int month, int year)
    {
        var budgets = await _unitOfWork.Repository<Budget>().Query()
            .Include(b => b.Category)
            .Where(b => b.UserId == userId && b.Month == month && b.Year == year)
            .ToListAsync();

        var budgetDtos = _mapper.Map<List<BudgetDto>>(budgets);
        return new BudgetOverviewDto(month, year, budgets.Sum(b => b.PlannedAmount), budgets.Sum(b => b.SpentAmount), budgetDtos);
    }
}
