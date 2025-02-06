using System.ComponentModel.DataAnnotations;

namespace CursoDev2411.Models
{
    public class Person
    {
        [Key]
        public int Id { get; set; }
        public PersonType Type { get; set; }
        public string Name { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Document { get; set; } = string.Empty;
        public bool Active { get; set; } = true;
        public DateTime CreateAt { get; set; } = DateTime.Now;
        public DateTime UpdateAt { get; set; } = DateTime.Now;
    }

    public enum PersonType
    {
        Client = 0,
        Supplier = 1
    }
}
