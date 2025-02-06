using CursoDev2411.Models;

namespace CursoDev2411.Services.Interfaces
{
    public interface IProductService
    {
        public Task<List<Product>> GetAll();
        public Task<Product> FindById(int? id);
        public Task Create(Product form);
        public Task Update(int id, Product form);
        public Task Delete(int id);
    }
}
