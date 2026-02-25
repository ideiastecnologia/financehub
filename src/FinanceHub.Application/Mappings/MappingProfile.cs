using AutoMapper;
using FinanceHub.Domain.Entities;
using FinanceHub.Domain.Enums;
using FinanceHub.Application.DTOs;
using FinanceHub.Application.DTOs.Auth;

namespace FinanceHub.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<User, UserDto>();

        CreateMap<Account, AccountDto>()
            .ForMember(d => d.Type, opt => opt.MapFrom(s => s.Type.ToString()));
        CreateMap<CreateAccountDto, Account>()
            .ForMember(d => d.Type, opt => opt.MapFrom(s => Enum.Parse<AccountType>(s.Type, true)));

        CreateMap<Category, CategoryDto>()
            .ForMember(d => d.Type, opt => opt.MapFrom(s => s.Type.ToString()))
            .ForMember(d => d.SubCategories, opt => opt.MapFrom(s => s.SubCategories));
        CreateMap<CreateCategoryDto, Category>()
            .ForMember(d => d.Type, opt => opt.MapFrom(s => Enum.Parse<CategoryType>(s.Type, true)));

        CreateMap<Transaction, TransactionDto>()
            .ForMember(d => d.Type, opt => opt.MapFrom(s => s.Type.ToString()))
            .ForMember(d => d.AccountName, opt => opt.MapFrom(s => s.Account.Name))
            .ForMember(d => d.CategoryName, opt => opt.MapFrom(s => s.Category.Name))
            .ForMember(d => d.CategoryColor, opt => opt.MapFrom(s => s.Category.Color))
            .ForMember(d => d.CategoryIcon, opt => opt.MapFrom(s => s.Category.Icon));
        CreateMap<CreateTransactionDto, Transaction>()
            .ForMember(d => d.Type, opt => opt.MapFrom(s => Enum.Parse<TransactionType>(s.Type, true)));

        CreateMap<Goal, GoalDto>()
            .ForMember(d => d.Status, opt => opt.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.ProgressPercentage, opt => opt.MapFrom(s => s.TargetAmount > 0 ? Math.Round(s.CurrentAmount / s.TargetAmount * 100, 1) : 0));
        CreateMap<CreateGoalDto, Goal>();

        CreateMap<Budget, BudgetDto>()
            .ForMember(d => d.CategoryName, opt => opt.MapFrom(s => s.Category.Name))
            .ForMember(d => d.CategoryColor, opt => opt.MapFrom(s => s.Category.Color))
            .ForMember(d => d.CategoryIcon, opt => opt.MapFrom(s => s.Category.Icon))
            .ForMember(d => d.ProgressPercentage, opt => opt.MapFrom(s => s.PlannedAmount > 0 ? Math.Round(s.SpentAmount / s.PlannedAmount * 100, 1) : 0));
        CreateMap<CreateBudgetDto, Budget>();
    }
}
