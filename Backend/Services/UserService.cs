using CursoDev2411.Data;
using CursoDev2411.Models;
using CursoDev2411.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace CursoDev2411.Services
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;

        public UserService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<User?> Authenticate(string email, string password)
        {
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == email);
            if (user == null) return null;

            using var sha256 = SHA256.Create();
            var passwordHash = Convert.ToBase64String(sha256.ComputeHash(Encoding.UTF8.GetBytes(password)));

            return user.PasswordHash == passwordHash ? user : null;
        }

        public async Task Register(User user)
        {
            if (await _context.Users.AnyAsync(u => u.Email == user.Email))
                throw new Exception("E-mail já registrado.");

            if (await _context.Users.AnyAsync(u => u.Name == user.Name))
                throw new Exception("Nome já registrado.");

            using var sha256 = SHA256.Create();
            user.PasswordHash = Convert.ToBase64String(sha256.ComputeHash(Encoding.UTF8.GetBytes(user.PasswordHash)));

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }
    }
}
