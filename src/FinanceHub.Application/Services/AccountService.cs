using AutoMapper;
using FinanceHub.Application.DTOs;
using FinanceHub.Application.Interfaces;
using FinanceHub.Domain.Entities;
using FinanceHub.Domain.Enums;
using FinanceHub.Domain.Interfaces;

namespace FinanceHub.Application.Services;

public class AccountService : IAccountService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public AccountService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<List<AccountDto>> GetAllAsync(Guid userId)
    {
        var accounts = await _unitOfWork.Repository<Account>().FindAsync(a => a.UserId == userId);
        return _mapper.Map<List<AccountDto>>(accounts);
    }

    public async Task<AccountDto> GetByIdAsync(Guid userId, Guid id)
    {
        var account = await _unitOfWork.Repository<Account>().GetByIdAsync(id);
        if (account == null || account.UserId != userId)
            throw new KeyNotFoundException("Account not found.");
        return _mapper.Map<AccountDto>(account);
    }

    public async Task<AccountDto> CreateAsync(Guid userId, CreateAccountDto dto)
    {
        var account = _mapper.Map<Account>(dto);
        account.UserId = userId;
        await _unitOfWork.Repository<Account>().AddAsync(account);
        await _unitOfWork.SaveChangesAsync();
        return _mapper.Map<AccountDto>(account);
    }

    public async Task<AccountDto> UpdateAsync(Guid userId, Guid id, UpdateAccountDto dto)
    {
        var account = await _unitOfWork.Repository<Account>().GetByIdAsync(id);
        if (account == null || account.UserId != userId)
            throw new KeyNotFoundException("Account not found.");

        account.Name = dto.Name;
        account.Type = Enum.Parse<AccountType>(dto.Type, true);
        account.Currency = dto.Currency;
        account.Color = dto.Color;
        account.Icon = dto.Icon;
        account.IsActive = dto.IsActive;
        account.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Repository<Account>().UpdateAsync(account);
        await _unitOfWork.SaveChangesAsync();
        return _mapper.Map<AccountDto>(account);
    }

    public async Task DeleteAsync(Guid userId, Guid id)
    {
        var account = await _unitOfWork.Repository<Account>().GetByIdAsync(id);
        if (account == null || account.UserId != userId)
            throw new KeyNotFoundException("Account not found.");
        await _unitOfWork.Repository<Account>().DeleteAsync(account);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<AccountSummaryDto> GetSummaryAsync(Guid userId)
    {
        var accounts = await _unitOfWork.Repository<Account>().FindAsync(a => a.UserId == userId && a.IsActive);
        var accountList = _mapper.Map<List<AccountDto>>(accounts);
        return new AccountSummaryDto(accountList.Sum(a => a.Balance), accountList.Count, accountList);
    }
}
