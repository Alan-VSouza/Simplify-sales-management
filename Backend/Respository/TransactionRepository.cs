using CursoDev2411.Data;
using CursoDev2411.Models;
using CursoDev2411.Respository.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CursoDev2411.Respository
{
    public class TransactionRepository : ITransactionRepository
    {
        private readonly ApplicationDbContext _context;

        public TransactionRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public IQueryable<Transaction> GetAll()
        {
            return _context.Transactions
                .Include(t => t.Person) 
                .Include(t => t.TransactionsItems) 
                .ThenInclude(i => i.Product); 
        }


        public async Task<Transaction> FindById(int id)
        {
            return await _context.Transactions
                .AsNoTracking()
                .Include(t => t.TransactionsItems) 
                .ThenInclude(i => i.Product)       
                .Include(t => t.Person)           
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task Create(Transaction transaction)
        {
            try
            {
                _context.Transactions.Add(transaction);
                await _context.SaveChangesAsync();
                Console.WriteLine("Transação salva com sucesso.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao salvar transação: {ex.Message}");
                throw;
            }
        }

        public async Task Update(Transaction transaction)
        {
            var existingTransaction = await _context.Transactions
                .FirstOrDefaultAsync(t => t.Id == transaction.Id);

            if (existingTransaction == null)
                throw new Exception($"Transação com ID {transaction.Id} não encontrada.");

            existingTransaction.Type = transaction.Type;
            existingTransaction.PaymentMethod = transaction.PaymentMethod;
            existingTransaction.PersonId = transaction.PersonId;
            existingTransaction.Active = transaction.Active;
            existingTransaction.UpdateAt = transaction.UpdateAt;

            await _context.SaveChangesAsync();
        }


        public async Task Delete(Transaction transaction)
        {
            _context.Transactions.Remove(transaction);
            await _context.SaveChangesAsync();
        }
    }
}
