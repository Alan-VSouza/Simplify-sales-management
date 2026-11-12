using SimplifySales.Data;
using SimplifySales.Models;
using SimplifySales.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace SimplifySales.Services
{
    public class UserService : IUserService
    {
        // PBKDF2 with a per-user salt (ASP.NET Core Identity's default hasher).
        private static readonly PasswordHasher<User> Hasher = new();

        private readonly ApplicationDbContext _context;

        public UserService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<User?> Authenticate(string email, string password)
        {
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == email);
            if (user == null) return null;

            // Accounts created before the PBKDF2 change still use unsalted SHA-256: accept once and upgrade.
            if (user.PasswordHash == LegacySha256(password))
            {
                user.PasswordHash = Hasher.HashPassword(user, password);
                await _context.SaveChangesAsync();
                return user;
            }

            var result = Hasher.VerifyHashedPassword(user, user.PasswordHash, password);
            if (result == PasswordVerificationResult.Failed) return null;

            if (result == PasswordVerificationResult.SuccessRehashNeeded)
            {
                user.PasswordHash = Hasher.HashPassword(user, password);
                await _context.SaveChangesAsync();
            }

            return user;
        }

        public async Task Register(User user)
        {
            if (await _context.Users.AnyAsync(u => u.Email == user.Email))
                throw new Exception("E-mail já registrado.");

            if (await _context.Users.AnyAsync(u => u.Name == user.Name))
                throw new Exception("Nome já registrado.");

            // The request carries the plain password in PasswordHash; store only the hash.
            user.PasswordHash = Hasher.HashPassword(user, user.PasswordHash);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }

        private static string LegacySha256(string password) =>
            Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(password)));
    }
}
