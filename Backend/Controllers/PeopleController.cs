using CursoDev2411.Models;
using CursoDev2411.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CursoDev2411.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PeopleController : ControllerBase
    {
        private readonly IPeopleService _peopleService;

        public PeopleController(IPeopleService peopleService)
        {
            _peopleService = peopleService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var peopleList = await _peopleService.GetAll();

            if (peopleList == null || !peopleList.Any())
                return NotFound("Nenhuma pessoa encontrada.");

            return Ok(peopleList);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var person = await _peopleService.FindById(id);

            if (person == null)
                return NotFound($"Pessoa com ID {id} não encontrada.");

            return Ok(person);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Person form)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                if (string.IsNullOrWhiteSpace(form.Name))
                    throw new Exception("O Nome não pode estar vazio.");

                if (string.IsNullOrWhiteSpace(form.Email))
                    throw new Exception("O Email não pode estar vazio.");

                if (string.IsNullOrWhiteSpace(form.PhoneNumber))
                    throw new Exception("O Número de telefone não pode estar vazio.");

                if (string.IsNullOrWhiteSpace(form.Document))
                    throw new Exception("O Documento não pode estar vazio.");

                var existingPerson = await _peopleService.FindByDocument(form.Document, form.Type);

                if (existingPerson != null)
                    throw new Exception($"O documento {form.Document} já está cadastrado como {form.Type}.");

                await _peopleService.Create(form);
                return CreatedAtAction(nameof(GetById), new { id = form.Id }, form);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }



        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Person form)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var existingPerson = await _peopleService.FindById(id);
                if (existingPerson == null)
                    return NotFound($"Pessoa com ID {id} não encontrada.");

                if (string.IsNullOrWhiteSpace(form.Name))
                    throw new Exception("O Nome não pode estar vazio.");

                if (string.IsNullOrWhiteSpace(form.Email))
                    throw new Exception("O Email não pode estar vazio.");

                if (string.IsNullOrWhiteSpace(form.PhoneNumber))
                    throw new Exception("O Número de telefone não pode estar vazio.");

                if (string.IsNullOrWhiteSpace(form.Document))
                    throw new Exception("O Documento não pode estar vazio.");

                await _peopleService.Update(id, form);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var existingPerson = await _peopleService.FindById(id);
                if (existingPerson == null)
                    return NotFound($"Pessoa com ID {id} não encontrada.");

                await _peopleService.Delete(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
