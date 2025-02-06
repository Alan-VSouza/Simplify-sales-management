using CursoDev2411.Models;
using CursoDev2411.Respository.Interfaces;
using CursoDev2411.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CursoDev2411.Services
{
    public class PeopleService : IPeopleService
    {
        private readonly IPeopleRepository _peopleRepository;

        public PeopleService(IPeopleRepository peopleRepository)
        {
            _peopleRepository = peopleRepository;
        }

        public async Task<List<Person>> GetAll()
        {
	        var peopleList = await _peopleRepository.GetAll().ToListAsync();

	        return peopleList ?? new List<Person>();
        }

        public async Task Create(Person form)
        {
            await _peopleRepository.Create(form);
        }
        public async Task<Person> FindByDocument(string document, PersonType type)
        {
            return await _peopleRepository.FindByDocument(document, type);
        }

        public async Task<Person> FindById(int id)
        {
            return await _peopleRepository.FindById(id)
                   ?? throw new Exception($"Pessoa com ID {id} não encontrada.");
        }

        public async Task Update(int id, Person form)
        {
            Person person = await _peopleRepository.FindById(id);
            if (person == null)
                throw new Exception("A pessoa requisitada não foi encontrada");

            person.Type = form.Type;
            person.Name = form.Name;
            person.Email = form.Email;
            person.PhoneNumber = form.PhoneNumber;
            person.Document = form.Document;
            person.Active = form.Active;

            person.UpdateAt = DateTime.Now;

            await _peopleRepository.Update(person);
        }

        public async Task Delete(int id)
        {
            Person person = await _peopleRepository.FindById(id);
            if (person == null)
                throw new Exception("A pessoa requisitada não foi encontrada");

            person.Active = false;
            person.UpdateAt = DateTime.Now;

            await _peopleRepository.Update(person);
        }

        public async Task SqlDelete(int id)
        {
            Person person = await _peopleRepository.FindById(id);
            if (person == null)
                throw new Exception("A pessoa requisitada não foi encontrada");

            await _peopleRepository.Delete(person);
        }
    }
}
