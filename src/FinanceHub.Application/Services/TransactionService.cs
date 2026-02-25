using AutoMapper;
using FinanceHub.Application.DTOs;
using FinanceHub.Application.Interfaces;
using FinanceHub.Domain.Entities;
using FinanceHub.Domain.Enums;
using FinanceHub.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FinanceHub.Application.Services;

public class TransactionService : ITransactionService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public TransactionService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<PagedResultDto<TransactionDto>> GetAllAsync(Guid userId, TransactionFilterDto filter)
    {
        var query = _unitOfWork.Repository<Transaction>().Query()
            .Include(t => t.Account)
            .Include(t => t.Category)
            .Where(t => t.UserId == userId);

        if (filter.DateFrom.HasValue)
            query = query.Where(t => t.Date >= filter.DateFrom.Value);
        if (filter.DateTo.HasValue)
            query = query.Where(t => t.Date <= filter.DateTo.Value);
        if (filter.CategoryId.HasValue)
            query = query.Where(t => t.CategoryId == filter.CategoryId.Value);
        if (filter.AccountId.HasValue)
            query = query.Where(t => t.AccountId == filter.AccountId.Value);
        if (!string.IsNullOrEmpty(filter.Type))
            query = query.Where(t => t.Type == Enum.Parse<TransactionType>(filter.Type, true));
        if (filter.MinAmount.HasValue)
            query = query.Where(t => t.Amount >= filter.MinAmount.Value);
        if (filter.MaxAmount.HasValue)
            query = query.Where(t => t.Amount <= filter.MaxAmount.Value);
        if (!string.IsNullOrEmpty(filter.Search))
            query = query.Where(t => t.Description.Contains(filter.Search) || (t.Tags != null && t.Tags.Contains(filter.Search)));

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(t => t.Date)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        var totalPages = (int)Math.Ceiling(totalCount / (double)filter.PageSize);
        return new PagedResultDto<TransactionDto>(
            _mapper.Map<List<TransactionDto>>(items), totalCount, filter.Page, filter.PageSize, totalPages);
    }

    public async Task<TransactionDto> GetByIdAsync(Guid userId, Guid id)
    {
        var transaction = await _unitOfWork.Repository<Transaction>().Query()
            .Include(t => t.Account)
            .Include(t => t.Category)
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
        if (transaction == null)
            throw new KeyNotFoundException("Transaction not found.");
        return _mapper.Map<TransactionDto>(transaction);
    }

    public async Task<TransactionDto> CreateAsync(Guid userId, CreateTransactionDto dto)
    {
        var transaction = _mapper.Map<Transaction>(dto);
        transaction.UserId = userId;

        await _unitOfWork.Repository<Transaction>().AddAsync(transaction);

        // Update account balance
        var account = await _unitOfWork.Repository<Account>().GetByIdAsync(dto.AccountId);
        if (account != null)
        {
            var type = Enum.Parse<TransactionType>(dto.Type, true);
            account.Balance += type == TransactionType.Income ? dto.Amount : -dto.Amount;
            await _unitOfWork.Repository<Account>().UpdateAsync(account);
        }

        // Update budget spent amount
        var budgets = await _unitOfWork.Repository<Budget>().FindAsync(
            b => b.UserId == userId && b.CategoryId == dto.CategoryId
            && b.Month == dto.Date.Month && b.Year == dto.Date.Year);
        var budget = budgets.FirstOrDefault();
        if (budget != null && Enum.Parse<TransactionType>(dto.Type, true) == TransactionType.Expense)
        {
            budget.SpentAmount += dto.Amount;
            await _unitOfWork.Repository<Budget>().UpdateAsync(budget);
        }

        await _unitOfWork.SaveChangesAsync();

        return await GetByIdAsync(userId, transaction.Id);
    }

    public async Task<TransactionDto> UpdateAsync(Guid userId, Guid id, UpdateTransactionDto dto)
    {
        var transaction = await _unitOfWork.Repository<Transaction>().Query()
            .Include(t => t.Account)
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
        if (transaction == null)
            throw new KeyNotFoundException("Transaction not found.");

        // Reverse old balance
        var oldAccount = transaction.Account;
        oldAccount.Balance += transaction.Type == TransactionType.Income ? -transaction.Amount : transaction.Amount;
        await _unitOfWork.Repository<Account>().UpdateAsync(oldAccount);

        // Apply new values
        transaction.AccountId = dto.AccountId;
        transaction.CategoryId = dto.CategoryId;
        transaction.Type = Enum.Parse<TransactionType>(dto.Type, true);
        transaction.Amount = dto.Amount;
        transaction.Description = dto.Description;
        transaction.Date = dto.Date;
        transaction.IsRecurring = dto.IsRecurring;
        transaction.RecurrenceRule = dto.RecurrenceRule;
        transaction.Tags = dto.Tags;
        transaction.Notes = dto.Notes;
        transaction.UpdatedAt = DateTime.UtcNow;

        // Apply new balance
        var newAccount = await _unitOfWork.Repository<Account>().GetByIdAsync(dto.AccountId);
        if (newAccount != null)
        {
            newAccount.Balance += transaction.Type == TransactionType.Income ? dto.Amount : -dto.Amount;
            await _unitOfWork.Repository<Account>().UpdateAsync(newAccount);
        }

        await _unitOfWork.Repository<Transaction>().UpdateAsync(transaction);
        await _unitOfWork.SaveChangesAsync();

        return await GetByIdAsync(userId, id);
    }

    public async Task DeleteAsync(Guid userId, Guid id)
    {
        var transaction = await _unitOfWork.Repository<Transaction>().Query()
            .Include(t => t.Account)
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
        if (transaction == null)
            throw new KeyNotFoundException("Transaction not found.");

        // Reverse balance
        transaction.Account.Balance += transaction.Type == TransactionType.Income ? -transaction.Amount : transaction.Amount;
        await _unitOfWork.Repository<Account>().UpdateAsync(transaction.Account);

        await _unitOfWork.Repository<Transaction>().DeleteAsync(transaction);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<TransactionSummaryDto> GetSummaryAsync(Guid userId, string period)
    {
        var now = DateTime.UtcNow;
        DateTime startDate;

        if (period.Equals("year", StringComparison.OrdinalIgnoreCase))
            startDate = new DateTime(now.Year, 1, 1);
        else
            startDate = new DateTime(now.Year, now.Month, 1);

        var transactions = await _unitOfWork.Repository<Transaction>()
            .FindAsync(t => t.UserId == userId && t.Date >= startDate);

        var list = transactions.ToList();
        var totalIncome = list.Where(t => t.Type == TransactionType.Income).Sum(t => t.Amount);
        var totalExpense = list.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Amount);

        return new TransactionSummaryDto(totalIncome, totalExpense, totalIncome - totalExpense, list.Count);
    }
}
