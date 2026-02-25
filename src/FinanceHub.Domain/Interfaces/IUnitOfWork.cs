namespace FinanceHub.Domain.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IRepository<T> Repository<T>() where T : Entities.BaseEntity;
    Task<int> SaveChangesAsync();
}
