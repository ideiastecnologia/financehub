using FinanceHub.Application.DTOs;
namespace FinanceHub.Application.Interfaces;
public interface ICategoryService
{
    Task<List<CategoryDto>> GetAllAsync(Guid userId);
    Task<CategoryDto> GetByIdAsync(Guid userId, Guid id);
    Task<CategoryDto> CreateAsync(Guid userId, CreateCategoryDto dto);
    Task<CategoryDto> UpdateAsync(Guid userId, Guid id, UpdateCategoryDto dto);
    Task DeleteAsync(Guid userId, Guid id);
    Task<List<CategoryDto>> GetTreeAsync(Guid userId);
}
