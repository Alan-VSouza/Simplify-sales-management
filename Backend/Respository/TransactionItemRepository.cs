using CursoDev2411.Data;
using CursoDev2411.Models;
using CursoDev2411.Respository.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CursoDev2411.Respository
{
    public class TransactionItemRepository : ITransactionItemRepository
    {
        private readonly ApplicationDbContext _context;

        public TransactionItemRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<TransactionItem>> FindByTransaction(int id)
        {
            return await _context.TransactionItems.Where(x => x.Active && x.TransactionId == id).ToListAsync();
        }

        public async Task CreateRange(List<TransactionItem> items)
        {
            _context.TransactionItems.AddRange(items);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateRange(List<TransactionItem> items)
        {
            _context.TransactionItems.UpdateRange(items);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteRange(List<TransactionItem> items)
        {
            _context.TransactionItems.RemoveRange(items);
            await _context.SaveChangesAsync();
        }
        public async Task<Product?> GetProductById(int productId)
        {
            return await _context.Products
                .Where(p => p.Active && p.Id == productId)
                .FirstOrDefaultAsync();
        }

    }
}
