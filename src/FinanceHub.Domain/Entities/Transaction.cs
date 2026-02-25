using FinanceHub.Domain.Enums;

namespace FinanceHub.Domain.Entities;

public class Transaction : BaseEntity
{
    public Guid AccountId { get; set; }
    public Guid CategoryId { get; set; }
    public Guid UserId { get; set; }
    public TransactionType Type { get; set; }
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public bool IsRecurring { get; set; }
    public string? RecurrenceRule { get; set; }
    public string? Tags { get; set; }
    public string? Notes { get; set; }
    public string? AttachmentUrl { get; set; }

    public Account Account { get; set; } = null!;
    public Category Category { get; set; } = null!;
    public User User { get; set; } = null!;
}
