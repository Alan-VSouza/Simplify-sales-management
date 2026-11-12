using SimplifySales.Models;
using SimplifySales.Services;
using SimplifySales.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace SimplifySales.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductController(IProductService productService)
        {
            _productService = productService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var products = await _productService.GetAll();
            return Ok(products);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var product = await _productService.FindById(id);
            if (product == null)
                return NotFound($"Produto com ID {id} não encontrado.");
            return Ok(product);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Product form)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(form.Name))
                    return BadRequest("O Nome do produto é obrigatório.");

                if (form.FactoryValue < 0)
                    return BadRequest("O Valor de custo não pode ser negativo.");

                if (form.SalesValue < 0)
                    return BadRequest("O Valor de venda não pode ser negativo.");

                await _productService.Create(form);
                return CreatedAtAction(nameof(GetById), new { id = form.Id }, form);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Product form)
        {
            try
            {
                var existingProduct = await _productService.FindById(id);
                if (existingProduct == null)
                    return NotFound($"Produto com ID {id} não encontrado.");

                await _productService.Update(id, form);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var existingProduct = await _productService.FindById(id);
                if (existingProduct == null)
                    return NotFound($"Produto com ID {id} não encontrado.");

                await _productService.Delete(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        [HttpPut("update-stock/{id}")]
        public async Task<IActionResult> UpdateStock(int id, [FromBody] int quantityToAdd)
        {
            try
            {
                var product = await _productService.FindById(id);
                if (product == null)
                    return NotFound($"Produto com ID {id} não encontrado.");

                if (product.Quantity + quantityToAdd < 0)
                    return BadRequest(new { Error = "O estoque não pode ficar negativo." });

                product.Quantity += quantityToAdd;
                product.UpdateAt = DateTime.Now;

                await _productService.Update(id, product);

                return Ok(product);
            }
            catch (Exception ex)
            {

                Console.WriteLine($"Erro ao atualizar o estoque: {ex.Message}");
                return BadRequest(new { Error = ex.Message });
            }
        }



    }
}
