using SimplifySales.Models;

namespace SimplifySales.Services.Interfaces
{
    public interface IUserService
    {
        Task<User?> Authenticate(string email, string password);
        Task Register(User user);
    }
}
