using SimplifySales.Models;

namespace SimplifySales.Repository.Interfaces
{
    public interface ITransactionRepository
    {
        IQueryable<Transaction> GetAll();
        Task<Transaction> FindById(int id);
        Task Create(Transaction transaction);
        Task Update(Transaction transaction);
        Task Delete(Transaction transaction);
    }
}
