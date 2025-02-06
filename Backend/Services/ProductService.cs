using CursoDev2411.Models;
using CursoDev2411.Respository.Interfaces;
using CursoDev2411.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CursoDev2411.Services
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _productRepository;

        public ProductService(IProductRepository peopleRepository)
        {
            _productRepository = peopleRepository;
        }

        public async Task<List<Product>> GetAll()
        {
            return await _productRepository.GetAll().ToListAsync();
        }

        public async Task Create(Product form)
        {
            await _productRepository.Create(form);
        }

        public async Task<Product> FindById(int? id)
        {
            if (id == null)
                throw new Exception("O Id de busca não pode estar nulo");

            return await _productRepository.FindById(id.Value);
        }

        public async Task Update(int id, Product form)
        {
            Product product = await _productRepository.FindById(id);
            if (product == null)
                throw new Exception("A pessoa requisitada não foi encontrada");

            product.Name = form.Name;
            product.Brand = form.Brand;
            product.Quantity = form.Quantity;
            product.Category = form.Category;
            product.SalesValue = form.SalesValue;
            product.Active = form.Active;

            product.UpdateAt = DateTime.Now;

            await _productRepository.Update(product);
        }

        public async Task Delete(int id)
        {
            Product product = await _productRepository.FindById(id);
            if (product == null)
                throw new Exception("O produto requisitado não foi encontrado");

            product.Active = false;
            product.UpdateAt = DateTime.Now;

            await _productRepository.Update(product);
        }

        public async Task SqlDelete(int id)
        {
            Product product = await _productRepository.FindById(id);
            if (product == null)
                throw new Exception("O produto requisitado não foi encontrado");

            await _productRepository.Delete(product);
        }
    }
}
