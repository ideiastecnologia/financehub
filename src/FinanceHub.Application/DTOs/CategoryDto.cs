namespace FinanceHub.Application.DTOs;
public record CategoryDto(Guid Id, string Name, string Type, string Color, string Icon, decimal? Budget, Guid? ParentCategoryId, List<CategoryDto>? SubCategories);
public record CreateCategoryDto(string Name, string Type, string Color, string Icon, decimal? Budget, Guid? ParentCategoryId);
public record UpdateCategoryDto(string Name, string Color, string Icon, decimal? Budget);
