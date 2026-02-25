namespace FinanceHub.Application.DTOs.Auth;
public record RegisterDto(string Email, string FullName, string Password);
public record LoginDto(string Email, string Password);
public record AuthResponseDto(string Token, string RefreshToken, DateTime Expiration, UserDto User);
public record RefreshTokenDto(string Token, string RefreshToken);
