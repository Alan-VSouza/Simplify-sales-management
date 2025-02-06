using System.ComponentModel.DataAnnotations;

namespace CursoDev2411.Models
{
    public class Product
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Category { get;set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public double FactoryValue { get; set; }
        public double SalesValue { get; set; }
        public int Quantity { get; set; }
        public bool Active { get; set; } = true;
        public DateTime CreateAt { get; set; } = DateTime.Now;
        public DateTime UpdateAt { get; set; } = DateTime.Now;
    }
}
