using FinanceHub.Domain.Enums;

namespace FinanceHub.Domain.Entities;

public class Goal : BaseEntity
{
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal TargetAmount { get; set; }
    public decimal CurrentAmount { get; set; }
    public DateTime Deadline { get; set; }
    public string Color { get; set; } = "#FF9800";
    public string Icon { get; set; } = "flag";
    public GoalStatus Status { get; set; } = GoalStatus.Active;

    public User User { get; set; } = null!;
}
