namespace FinanceHub.Application.DTOs;
public record UserDto(Guid Id, string Email, string FullName, string Currency, string DateFormat, string Theme);
