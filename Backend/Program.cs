using CursoDev2411.Data;
using CursoDev2411.Respository;
using CursoDev2411.Respository.Interfaces;
using CursoDev2411.Services;
using CursoDev2411.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

namespace CursoDev2411
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Adicionar serviço do banco de dados.
            builder.Services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection") ??
                                     throw new InvalidOperationException("Chave de conexão 'DefaultConnection' não encontrada.")));

            // Repositórios e serviços
            builder.Services.AddScoped<IPeopleRepository, PeopleRepository>();
            builder.Services.AddScoped<IPeopleService, PeopleService>();

            builder.Services.AddScoped<IProductRepository, ProductRepository>();
            builder.Services.AddScoped<IProductService, ProductService>();
            builder.Services.AddScoped<IUserService, UserService>();
            builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();
            builder.Services.AddScoped<ITransactionItemRepository, TransactionItemRepository>();
            builder.Services.AddScoped<ITransactionService, TransactionService>();

            // Adicionar CORS
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", policy =>
                {
                    policy.AllowAnyOrigin()    // Permitir qualquer origem
                          .AllowAnyMethod()    // Permitir qualquer método HTTP (GET, POST, PUT, DELETE)
                          .AllowAnyHeader();   // Permitir qualquer cabeçalho
                });
            });

            // Adicionar mapeamento dos controladores e JSON
            builder.Services.AddControllers().AddNewtonsoftJson(x =>
                x.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore);

            builder.Services.AddSwaggerGen();

            var app = builder.Build();

            // Configurar os requests HTTP para a pipeline
            if (!app.Environment.IsDevelopment())
            {
                app.UseExceptionHandler("/Home/Error");
                app.UseHsts();
            }
            else
            {
                app.UseSwagger();
                app.UseSwaggerUI(options =>
                {
                    options.SwaggerEndpoint("/swagger/v1/swagger.json", "v1");
                    options.RoutePrefix = string.Empty;
                });
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();

            app.UseRouting();

            // Habilitar o CORS
            app.UseCors("AllowAll");

            app.UseAuthorization();

            // Mapear a rota padrão a ser seguida nos controladores
            app.MapControllerRoute(
                name: "default",
                pattern: "{controller=Home}/{action=Index}/{id?}");

            app.Run();
        }
    }
}
