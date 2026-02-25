using FinanceHub.Domain.Entities;
using FinanceHub.Domain.Enums;

namespace FinanceHub.Infrastructure.Data;

public static class SeedData
{
    public static async Task SeedAsync(FinanceHubDbContext context)
    {
        if (context.Users.Any()) return;

        var userId = Guid.NewGuid();
        var user = new User
        {
            Id = userId,
            Email = "demo@financehub.com",
            FullName = "Usuario Demo",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("demo123"),
            Currency = "BRL",
            DateFormat = "dd/MM/yyyy",
            Theme = "light"
        };
        context.Users.Add(user);

        // 3 Accounts
        var checkingId = Guid.NewGuid();
        var savingsId = Guid.NewGuid();
        var creditId = Guid.NewGuid();

        var accounts = new List<Account>
        {
            new() { Id = checkingId, UserId = userId, Name = "Conta Corrente", Type = AccountType.Checking, Balance = 5420.50m, Color = "#4CAF50", Icon = "account_balance" },
            new() { Id = savingsId, UserId = userId, Name = "Poupanca", Type = AccountType.Savings, Balance = 15000.00m, Color = "#2196F3", Icon = "savings" },
            new() { Id = creditId, UserId = userId, Name = "Cartao de Credito", Type = AccountType.CreditCard, Balance = -1250.00m, Color = "#F44336", Icon = "credit_card" }
        };
        context.Accounts.AddRange(accounts);

        // 15 Categories (with some subcategories)
        var salaryId = Guid.NewGuid();
        var freelanceId = Guid.NewGuid();
        var investmentIncId = Guid.NewGuid();
        var foodId = Guid.NewGuid();
        var transportId = Guid.NewGuid();
        var housingId = Guid.NewGuid();
        var healthId = Guid.NewGuid();
        var educationId = Guid.NewGuid();
        var entertainmentId = Guid.NewGuid();
        var shoppingId = Guid.NewGuid();
        var utilitiesId = Guid.NewGuid();
        var personalId = Guid.NewGuid();

        var categories = new List<Category>
        {
            // Income
            new() { Id = salaryId, UserId = userId, Name = "Salario", Type = CategoryType.Income, Color = "#4CAF50", Icon = "work" },
            new() { Id = freelanceId, UserId = userId, Name = "Freelance", Type = CategoryType.Income, Color = "#8BC34A", Icon = "laptop" },
            new() { Id = investmentIncId, UserId = userId, Name = "Rendimentos", Type = CategoryType.Income, Color = "#CDDC39", Icon = "trending_up" },
            // Expense parent categories
            new() { Id = foodId, UserId = userId, Name = "Alimentacao", Type = CategoryType.Expense, Color = "#FF9800", Icon = "restaurant", Budget = 1500 },
            new() { Id = transportId, UserId = userId, Name = "Transporte", Type = CategoryType.Expense, Color = "#03A9F4", Icon = "directions_car", Budget = 800 },
            new() { Id = housingId, UserId = userId, Name = "Moradia", Type = CategoryType.Expense, Color = "#795548", Icon = "home", Budget = 2500 },
            new() { Id = healthId, UserId = userId, Name = "Saude", Type = CategoryType.Expense, Color = "#E91E63", Icon = "local_hospital", Budget = 500 },
            new() { Id = educationId, UserId = userId, Name = "Educacao", Type = CategoryType.Expense, Color = "#9C27B0", Icon = "school", Budget = 600 },
            new() { Id = entertainmentId, UserId = userId, Name = "Lazer", Type = CategoryType.Expense, Color = "#FF5722", Icon = "sports_esports", Budget = 400 },
            new() { Id = shoppingId, UserId = userId, Name = "Compras", Type = CategoryType.Expense, Color = "#607D8B", Icon = "shopping_cart", Budget = 500 },
            new() { Id = utilitiesId, UserId = userId, Name = "Contas", Type = CategoryType.Expense, Color = "#FFC107", Icon = "receipt", Budget = 600 },
            new() { Id = personalId, UserId = userId, Name = "Pessoal", Type = CategoryType.Expense, Color = "#00BCD4", Icon = "person", Budget = 300 },
            // Subcategories
            new() { Id = Guid.NewGuid(), UserId = userId, Name = "Restaurantes", Type = CategoryType.Expense, Color = "#FF9800", Icon = "restaurant_menu", ParentCategoryId = foodId },
            new() { Id = Guid.NewGuid(), UserId = userId, Name = "Supermercado", Type = CategoryType.Expense, Color = "#FF9800", Icon = "local_grocery_store", ParentCategoryId = foodId },
            new() { Id = Guid.NewGuid(), UserId = userId, Name = "Combustivel", Type = CategoryType.Expense, Color = "#03A9F4", Icon = "local_gas_station", ParentCategoryId = transportId },
        };
        context.Categories.AddRange(categories);

        // Expense category IDs for transactions
        var expenseCategoryIds = new[] { foodId, transportId, housingId, healthId, educationId, entertainmentId, shoppingId, utilitiesId, personalId };
        var incomeCategoryIds = new[] { salaryId, freelanceId, investmentIncId };
        var accountIds = new[] { checkingId, savingsId, creditId };

        // Generate 100+ transactions over last 6 months
        var random = new Random(42);
        var transactions = new List<Transaction>();
        var now = DateTime.UtcNow;

        for (int monthOffset = 5; monthOffset >= 0; monthOffset--)
        {
            var monthDate = now.AddMonths(-monthOffset);
            var daysInMonth = DateTime.DaysInMonth(monthDate.Year, monthDate.Month);

            // Monthly salary
            transactions.Add(new Transaction
            {
                Id = Guid.NewGuid(), UserId = userId, AccountId = checkingId, CategoryId = salaryId,
                Type = TransactionType.Income, Amount = 8500,
                Description = "Salario mensal", Date = new DateTime(monthDate.Year, monthDate.Month, 5),
            });

            // Occasional freelance
            if (monthOffset % 2 == 0)
            {
                transactions.Add(new Transaction
                {
                    Id = Guid.NewGuid(), UserId = userId, AccountId = checkingId, CategoryId = freelanceId,
                    Type = TransactionType.Income, Amount = 2000 + random.Next(0, 3000),
                    Description = "Projeto freelance", Date = new DateTime(monthDate.Year, monthDate.Month, 15),
                });
            }

            // Investment returns
            transactions.Add(new Transaction
            {
                Id = Guid.NewGuid(), UserId = userId, AccountId = savingsId, CategoryId = investmentIncId,
                Type = TransactionType.Income, Amount = 150 + random.Next(0, 200),
                Description = "Rendimento poupanca", Date = new DateTime(monthDate.Year, monthDate.Month, 1),
            });

            // 12-18 expenses per month
            int expenseCount = 12 + random.Next(0, 7);
            for (int i = 0; i < expenseCount; i++)
            {
                var catId = expenseCategoryIds[random.Next(expenseCategoryIds.Length)];
                var accId = accountIds[random.Next(accountIds.Length)];
                var day = random.Next(1, daysInMonth + 1);

                decimal amount = catId == housingId ? 2200 + random.Next(0, 300) :
                                 catId == foodId ? 50 + random.Next(0, 200) :
                                 catId == transportId ? 100 + random.Next(0, 300) :
                                 catId == healthId ? 80 + random.Next(0, 400) :
                                 catId == educationId ? 200 + random.Next(0, 400) :
                                 catId == entertainmentId ? 30 + random.Next(0, 200) :
                                 catId == shoppingId ? 50 + random.Next(0, 300) :
                                 catId == utilitiesId ? 100 + random.Next(0, 200) :
                                 30 + random.Next(0, 150);

                var descriptions = new Dictionary<Guid, string[]>
                {
                    { foodId, new[] { "Almoco restaurante", "Supermercado", "Padaria", "Ifood delivery", "Cafe" } },
                    { transportId, new[] { "Combustivel", "Uber", "Estacionamento", "Manutencao carro", "Pedagio" } },
                    { housingId, new[] { "Aluguel", "Condominio", "IPTU" } },
                    { healthId, new[] { "Farmacia", "Consulta medica", "Plano de saude", "Academia" } },
                    { educationId, new[] { "Curso online", "Livros", "Mensalidade" } },
                    { entertainmentId, new[] { "Cinema", "Streaming", "Jogos", "Show" } },
                    { shoppingId, new[] { "Roupas", "Eletronicos", "Presentes" } },
                    { utilitiesId, new[] { "Energia", "Agua", "Internet", "Telefone" } },
                    { personalId, new[] { "Cabeleireiro", "Cosmeticos", "Assinaturas" } },
                };

                var descArray = descriptions.GetValueOrDefault(catId, new[] { "Despesa geral" });
                var desc = descArray[random.Next(descArray.Length)];

                transactions.Add(new Transaction
                {
                    Id = Guid.NewGuid(), UserId = userId, AccountId = accId, CategoryId = catId,
                    Type = TransactionType.Expense, Amount = amount,
                    Description = desc, Date = new DateTime(monthDate.Year, monthDate.Month, Math.Min(day, daysInMonth)),
                });
            }
        }
        context.Transactions.AddRange(transactions);

        // 3 Goals
        var goals = new List<Goal>
        {
            new() { Id = Guid.NewGuid(), UserId = userId, Name = "Fundo de Emergencia", TargetAmount = 30000, CurrentAmount = 15000, Deadline = now.AddMonths(12), Color = "#4CAF50", Icon = "security", Status = GoalStatus.Active },
            new() { Id = Guid.NewGuid(), UserId = userId, Name = "Viagem Europa", TargetAmount = 20000, CurrentAmount = 8500, Deadline = now.AddMonths(8), Color = "#2196F3", Icon = "flight", Status = GoalStatus.Active },
            new() { Id = Guid.NewGuid(), UserId = userId, Name = "Notebook Novo", TargetAmount = 5000, CurrentAmount = 3200, Deadline = now.AddMonths(3), Color = "#FF9800", Icon = "laptop_mac", Status = GoalStatus.Active },
        };
        context.Goals.AddRange(goals);

        // Monthly budgets for current and previous month
        var budgetMonths = new[] { (now.Month, now.Year), (now.AddMonths(-1).Month, now.AddMonths(-1).Year) };
        foreach (var (month, year) in budgetMonths)
        {
            var monthTransactions = transactions.Where(t => t.Date.Month == month && t.Date.Year == year && t.Type == TransactionType.Expense).ToList();
            foreach (var catId in expenseCategoryIds)
            {
                var cat = categories.First(c => c.Id == catId);
                var spent = monthTransactions.Where(t => t.CategoryId == catId).Sum(t => t.Amount);
                context.Budgets.Add(new Budget
                {
                    Id = Guid.NewGuid(), UserId = userId, CategoryId = catId,
                    Month = month, Year = year,
                    PlannedAmount = cat.Budget ?? 500,
                    SpentAmount = spent
                });
            }
        }

        await context.SaveChangesAsync();
    }
}
