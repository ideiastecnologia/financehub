namespace FinanceHub.Domain.Enums;

public enum AccountType
{
    Checking,
    Savings,
    CreditCard,
    Investment,
    Cash
}

public enum TransactionType
{
    Income,
    Expense,
    Transfer
}

public enum CategoryType
{
    Income,
    Expense
}

public enum GoalStatus
{
    Active,
    Completed,
    Cancelled
}
