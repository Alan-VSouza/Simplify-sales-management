using CursoDev2411.Models;

namespace CursoDev2411.Services.Interfaces
{
    public interface ITransactionService
    {
        public Task<List<Transaction>> GetAll();
        public Task<Transaction> FindById(int? id);
        public Task Create(Transaction form);
        public Task Update(int id, Transaction form);
        public Task Delete(int id);
        public Task<List<Transaction>> GetTransactionsByProductId(int productId);
    }
}
