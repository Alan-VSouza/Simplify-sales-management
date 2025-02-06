using CursoDev2411.Models;
using CursoDev2411.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CursoDev2411.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _userService.Authenticate(request.Email, request.Password);
            if (user == null)
                return Unauthorized(new { Error = "Email ou senha inválidos." });

            var token = Guid.NewGuid().ToString();
            return Ok(new { Token = token });
        }

        [HttpPost("Register")]
        public async Task<IActionResult> Register([FromBody] User user)
        {
            if (string.IsNullOrWhiteSpace(user.Name) || string.IsNullOrWhiteSpace(user.Email) || string.IsNullOrWhiteSpace(user.PasswordHash))
                return BadRequest(new { Error = "Todos os campos são obrigatórios." });

            try
            {
                await _userService.Register(user);
                return Ok(new { Message = "Usuário registrado com sucesso!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
