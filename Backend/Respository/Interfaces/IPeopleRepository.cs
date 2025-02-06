using CursoDev2411.Models;

namespace CursoDev2411.Respository.Interfaces
{
    public interface IPeopleRepository
    {
        public IQueryable<Person> GetAll();
        public Task Create(Person person);
        Task<Person> FindByDocument(string document, PersonType type);
        public Task<Person> FindById(int id);
        public Task Update(Person person);
        public Task Delete(Person person);
    }
}
