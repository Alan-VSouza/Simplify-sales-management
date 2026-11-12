using SimplifySales.Models;
using SimplifySales.Repository.Interfaces;
using SimplifySales.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace SimplifySales.Services
{
    public class TransactionService : ITransactionService
    {
        private readonly ITransactionRepository _transactionRepository;
        private readonly ITransactionItemRepository _transactionItemRepository;
        private readonly IPeopleService _peopleService;
        private readonly IProductRepository _productRepository;

        public TransactionService(ITransactionRepository transactionRepository,
            ITransactionItemRepository transactionItemRepository,
            IProductRepository productRepository,
            IPeopleService peopleService)
        {
            _transactionRepository = transactionRepository;
            _transactionItemRepository = transactionItemRepository;
            _productRepository = productRepository;
            _peopleService = peopleService;
        }

        public async Task<List<Transaction>> GetAll()
        {
            return await _transactionRepository.GetAll()
                .Include(t => t.TransactionsItems)
                    .ThenInclude(i => i.Product)
                .ToListAsync();
        }

        public async Task<Transaction> FindById(int? id)
        {
            if (id == null)
                throw new Exception("O ID de busca não pode ser nulo.");

            var transaction = await _transactionRepository.FindById(id.Value);
            if (transaction == null)
                throw new Exception($"Transação com ID {id} não encontrada.");

            return transaction;
        }

        public async Task Create(Transaction form)
        {
            form.Person = await _peopleService.FindById(form.PersonId);
            if (form.Person == null)
                throw new Exception("Pessoa associada não encontrada.");

            foreach (var item in form.TransactionsItems)
            {
                var product = await _productRepository.FindById(item.ProductId);
                if (product == null)
                    throw new Exception($"Produto com ID {item.ProductId} não encontrado.");

                if (form.Type == TransactionType.Buy)
                {
                    // Purchases from a supplier add to the stock.
                    product.Quantity += item.Amount;
                }
                else
                {
                    if (product.Quantity < item.Amount)
                        throw new Exception($"Estoque insuficiente para o produto {product.Name}.");

                    product.Quantity -= item.Amount;
                }
                item.Product = product;
                item.Value = product.FactoryValue;
                item.SellValue = product.SalesValue;

                await _productRepository.Update(product);
            }

            await _transactionRepository.Create(form);
        }

        public async Task Update(int id, Transaction form)
        {
            var transaction = await _transactionRepository.FindById(id);
            if (transaction == null)
                throw new Exception($"Transação com ID {id} não encontrada.");

            transaction.Active = form.Active;
            transaction.Type = form.Type;
            transaction.PaymentMethod = form.PaymentMethod;
            transaction.PersonId = form.PersonId;
            transaction.UpdateAt = DateTime.Now;

            await _transactionRepository.Update(transaction);
        }


        public async Task Delete(int id)
        {
            var transaction = await _transactionRepository.FindById(id);
            if (transaction == null)
                throw new Exception($"Transação com ID {id} não encontrada.");

            transaction.Active = !transaction.Active;
            transaction.UpdateAt = DateTime.Now;

            await _transactionRepository.Update(transaction);
        }
    }
}
