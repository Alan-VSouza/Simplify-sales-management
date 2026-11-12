using SimplifySales.Models;

namespace SimplifySales.Repository.Interfaces
{
    public interface ITransactionItemRepository
    {
        public Task<List<TransactionItem>> FindByTransaction(int id);
        public Task CreateRange(List<TransactionItem> items);
        public Task UpdateRange(List<TransactionItem> items);
        public Task DeleteRange(List<TransactionItem> items);
        public Task<Product?> GetProductById(int productId);
    }
}
