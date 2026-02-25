using FinanceHub.Application.DTOs.Auth;
using FinanceHub.Application.DTOs;
namespace FinanceHub.Application.Interfaces;
public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
    Task<AuthResponseDto> RefreshTokenAsync(RefreshTokenDto dto);
    Task<UserDto> GetCurrentUserAsync(Guid userId);
}
