using CursoDev2411.Data;
using CursoDev2411.Models;
using CursoDev2411.Respository.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CursoDev2411.Respository
{
    public class PeopleRepository : IPeopleRepository
    {
        private readonly ApplicationDbContext _context;

        public PeopleRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Person> FindByDocument(string document, PersonType type)
        {
            return await _context.People
                .FirstOrDefaultAsync(p => p.Document == document && p.Type == type);
        }


        public IQueryable<Person> GetAll()
        {
            return _context.People.Where(x => x.Active).AsQueryable();
        }

        public async Task<Person?> FindById(int id)
        {
            return await _context.People
                .FirstOrDefaultAsync(x => x.Active && x.Id == id);
        }

        public async Task Create(Person person)
        {
            person.CreateAt = DateTime.Now;
            person.UpdateAt = DateTime.Now;
            person.Active = true;

            _context.People.Add(person);
            await _context.SaveChangesAsync();
        }

        public async Task Update(Person person)
        {
            person.UpdateAt = DateTime.Now;

            _context.People.Update(person);
            await _context.SaveChangesAsync();
        }

        public async Task Delete(Person person)
        {
            person.Active = false;
            person.UpdateAt = DateTime.Now;

            _context.People.Update(person);
            await _context.SaveChangesAsync();
        }

        public async Task SqlDelete(Person person)
        {
            _context.People.Remove(person);
            await _context.SaveChangesAsync();
        }
    }
}