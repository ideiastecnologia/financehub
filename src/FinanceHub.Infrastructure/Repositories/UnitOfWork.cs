using FinanceHub.Domain.Entities;
using FinanceHub.Domain.Interfaces;
using FinanceHub.Infrastructure.Data;

namespace FinanceHub.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly FinanceHubDbContext _context;
    private readonly Dictionary<Type, object> _repositories = new();

    public UnitOfWork(FinanceHubDbContext context)
    {
        _context = context;
    }

    public IRepository<T> Repository<T>() where T : BaseEntity
    {
        var type = typeof(T);
        if (!_repositories.ContainsKey(type))
        {
            _repositories[type] = new Repository<T>(_context);
        }
        return (IRepository<T>)_repositories[type];
    }

    public async Task<int> SaveChangesAsync() => await _context.SaveChangesAsync();

    public void Dispose() => _context.Dispose();
}
