using FinanceHub.Domain.Enums;

namespace FinanceHub.Domain.Entities;

public class Account : BaseEntity
{
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public AccountType Type { get; set; }
    public string Currency { get; set; } = "BRL";
    public decimal Balance { get; set; }
    public string Color { get; set; } = "#4CAF50";
    public string Icon { get; set; } = "account_balance";
    public bool IsActive { get; set; } = true;

    public User User { get; set; } = null!;
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
