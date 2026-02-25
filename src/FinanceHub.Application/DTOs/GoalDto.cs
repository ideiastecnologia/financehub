namespace FinanceHub.Application.DTOs;
public record GoalDto(Guid Id, string Name, decimal TargetAmount, decimal CurrentAmount, DateTime Deadline, string Color, string Icon, string Status, decimal ProgressPercentage);
public record CreateGoalDto(string Name, decimal TargetAmount, DateTime Deadline, string Color, string Icon);
public record UpdateGoalDto(string Name, decimal TargetAmount, DateTime Deadline, string Color, string Icon);
public record ContributeGoalDto(decimal Amount);
