using SimplifySales.Models;

namespace SimplifySales.Repository.Interfaces
{
    public interface IProductRepository
    {
        public IQueryable<Product> GetAll();
        public Task Create(Product product);

        public Task<Product> FindById(int id);
        public Task Update(Product product);
        public Task Delete(Product product);
    }
}
