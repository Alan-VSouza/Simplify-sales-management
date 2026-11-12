using SimplifySales.Data;
using SimplifySales.Repository;
using SimplifySales.Repository.Interfaces;
using SimplifySales.Services;
using SimplifySales.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

namespace SimplifySales
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Banco de dados: "Sqlite" (padrão, roda sem instalar nada) ou "SqlServer".
            var provider = builder.Configuration["DatabaseProvider"] ?? "Sqlite";
            var connectionString = builder.Configuration.GetConnectionString(provider)
                ?? throw new InvalidOperationException($"Connection string '{provider}' não encontrada.");

            builder.Services.AddDbContext<ApplicationDbContext>(options =>
            {
                if (provider.Equals("SqlServer", StringComparison.OrdinalIgnoreCase))
                    options.UseSqlServer(connectionString);
                else
                    options.UseSqlite(connectionString);
            });

            // Repositórios e serviços
            builder.Services.AddScoped<IPeopleRepository, PeopleRepository>();
            builder.Services.AddScoped<IPeopleService, PeopleService>();

            builder.Services.AddScoped<IProductRepository, ProductRepository>();
            builder.Services.AddScoped<IProductService, ProductService>();
            builder.Services.AddScoped<IUserService, UserService>();
            builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();
            builder.Services.AddScoped<ITransactionItemRepository, TransactionItemRepository>();
            builder.Services.AddScoped<ITransactionService, TransactionService>();

            // CORS liberado para o front-end em desenvolvimento
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", policy =>
                {
                    policy.AllowAnyOrigin()
                          .AllowAnyMethod()
                          .AllowAnyHeader();
                });
            });

            // Controladores da API e serialização JSON
            builder.Services.AddControllers().AddNewtonsoftJson(x =>
                x.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore);

            builder.Services.AddProblemDetails();
            builder.Services.AddSwaggerGen();

            var app = builder.Build();

            // As migrations do projeto são específicas do SQL Server (aplique com `dotnet ef database update`).
            // No SQLite o schema é criado a partir do modelo na primeira execução.
            if (!provider.Equals("SqlServer", StringComparison.OrdinalIgnoreCase))
            {
                using var scope = app.Services.CreateScope();
                scope.ServiceProvider.GetRequiredService<ApplicationDbContext>().Database.EnsureCreated();
            }

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI(options =>
                {
                    options.SwaggerEndpoint("/swagger/v1/swagger.json", "v1");
                    options.RoutePrefix = string.Empty;
                });
            }
            else
            {
                app.UseExceptionHandler();
                app.UseHsts();
            }

            app.UseHttpsRedirection();

            app.UseCors("AllowAll");

            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
