using CursoDev2411.Models;

namespace CursoDev2411.Services.Interfaces
{
    public interface IUserService
    {
        Task<User?> Authenticate(string email, string password);
        Task Register(User user);
    }
}
