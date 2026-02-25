using AutoMapper;
using FinanceHub.Application.DTOs;
using FinanceHub.Application.Interfaces;
using FinanceHub.Domain.Entities;
using FinanceHub.Domain.Interfaces;

namespace FinanceHub.Application.Services;

public class CategoryService : ICategoryService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CategoryService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<List<CategoryDto>> GetAllAsync(Guid userId)
    {
        var categories = await _unitOfWork.Repository<Category>().FindAsync(c => c.UserId == userId);
        return _mapper.Map<List<CategoryDto>>(categories);
    }

    public async Task<CategoryDto> GetByIdAsync(Guid userId, Guid id)
    {
        var category = await _unitOfWork.Repository<Category>().GetByIdAsync(id);
        if (category == null || category.UserId != userId)
            throw new KeyNotFoundException("Category not found.");
        return _mapper.Map<CategoryDto>(category);
    }

    public async Task<CategoryDto> CreateAsync(Guid userId, CreateCategoryDto dto)
    {
        var category = _mapper.Map<Category>(dto);
        category.UserId = userId;
        await _unitOfWork.Repository<Category>().AddAsync(category);
        await _unitOfWork.SaveChangesAsync();
        return _mapper.Map<CategoryDto>(category);
    }

    public async Task<CategoryDto> UpdateAsync(Guid userId, Guid id, UpdateCategoryDto dto)
    {
        var category = await _unitOfWork.Repository<Category>().GetByIdAsync(id);
        if (category == null || category.UserId != userId)
            throw new KeyNotFoundException("Category not found.");

        category.Name = dto.Name;
        category.Color = dto.Color;
        category.Icon = dto.Icon;
        category.Budget = dto.Budget;
        category.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Repository<Category>().UpdateAsync(category);
        await _unitOfWork.SaveChangesAsync();
        return _mapper.Map<CategoryDto>(category);
    }

    public async Task DeleteAsync(Guid userId, Guid id)
    {
        var category = await _unitOfWork.Repository<Category>().GetByIdAsync(id);
        if (category == null || category.UserId != userId)
            throw new KeyNotFoundException("Category not found.");
        await _unitOfWork.Repository<Category>().DeleteAsync(category);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<List<CategoryDto>> GetTreeAsync(Guid userId)
    {
        var categories = await _unitOfWork.Repository<Category>().FindAsync(c => c.UserId == userId && c.ParentCategoryId == null);
        var allCategories = await _unitOfWork.Repository<Category>().FindAsync(c => c.UserId == userId);

        var categoryList = categories.ToList();
        foreach (var cat in categoryList)
        {
            cat.SubCategories = allCategories.Where(c => c.ParentCategoryId == cat.Id).ToList();
        }

        return _mapper.Map<List<CategoryDto>>(categoryList);
    }
}
