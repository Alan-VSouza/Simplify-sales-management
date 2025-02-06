using CursoDev2411.Models;

namespace CursoDev2411.Services.Interfaces
{
    public interface IPeopleService
    {
        public Task<List<Person>> GetAll();
        public Task<Person> FindById(int id);
        Task<Person> FindByDocument(string document, PersonType type);
        public Task Create(Person form);
        public Task Update(int id, Person form);
        public Task Delete(int id);
    }
}
