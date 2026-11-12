using SimplifySales.Data;
using SimplifySales.Models;
using SimplifySales.Repository.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace SimplifySales.Repository
{
    public class ProductRepository : IProductRepository
    {
        private readonly ApplicationDbContext _context;

        public ProductRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public IQueryable<Product> GetAll()
        {
            return _context.Products.Where(x => x.Active).AsQueryable();
        }

        public async Task<Product> FindById(int id)
        {
            return await _context.Products.FirstAsync(x => x.Active && x.Id == id);
        }

        public async Task Create(Product product)
        {
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
        }

        public async Task Update(Product product)
        {
            _context.Products.Update(product);
            await _context.SaveChangesAsync();
        }

        public async Task Delete(Product product)
        {
            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
        }
    }
}
