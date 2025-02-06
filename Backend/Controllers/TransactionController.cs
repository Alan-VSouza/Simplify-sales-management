using CursoDev2411.Models;
using CursoDev2411.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CursoDev2411.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TransactionController : ControllerBase
    {
        private readonly ITransactionService _transactionService;
        private readonly IPeopleService _personService;
        private readonly IProductService _productService;

        public TransactionController(ITransactionService transactionService, IPeopleService personService, IProductService productService)
        {
            _transactionService = transactionService;
            _personService = personService;
            _productService = productService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _transactionService.GetAll());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var transaction = await _transactionService.FindById(id);
            if (transaction == null)
                return NotFound($"Transação com ID {id} não encontrada.");

            return Ok(transaction);
        }


        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Transaction form)
        {
            try
            {
                if (form.TransactionAt == DateTime.MinValue)
                    return BadRequest("A data da transação é obrigatória.");

                if (form.TransactionsItems == null || !form.TransactionsItems.Any())
                    return BadRequest("A transação deve conter pelo menos um item.");

                var person = await _personService.FindById(form.PersonId);
                if (person == null)
                    return BadRequest($"Pessoa com ID {form.PersonId} não encontrada.");

                form.Person = person;

                foreach (var item in form.TransactionsItems)
                {
                    var product = await _productService.FindById(item.ProductId);
                    if (product == null)
                        return BadRequest($"Produto com ID {item.ProductId} não encontrado.");

                    item.Product = product;
                }

                await _transactionService.Create(form);

                var createdTransaction = await _transactionService.FindById(form.Id);
                return CreatedAtAction(nameof(GetById), new { id = form.Id }, createdTransaction);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Transaction form)
        {
            try
            {
                if (form.TransactionAt == DateTime.MinValue)
                    return BadRequest("A data da transação é obrigatória.");

                if (form.TransactionsItems == null || !form.TransactionsItems.Any())
                    return BadRequest("A transação deve conter pelo menos um item.");

                var existingTransaction = await _transactionService.FindById(id);
                if (existingTransaction == null)
                    return NotFound($"Transação com ID {id} não encontrada.");

                await _transactionService.Update(id, form);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        [HttpPut("toggle-status/{id}")]
        public async Task<IActionResult> ToggleStatus(int id)
        {
            try
            {
                var transaction = await _transactionService.FindById(id);
                if (transaction == null)
                {
                    return NotFound(new { Error = $"Transação com ID {id} não encontrada." });
                }

                transaction.Active = !transaction.Active;

                await _transactionService.Update(transaction.Id, transaction);

                return Ok(new { Id = transaction.Id, Active = transaction.Active });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao alternar status da transação {id}: {ex.Message}");
                return BadRequest(new { Error = $"Erro ao alternar status: {ex.Message}" });
            }
        }

    }
}
