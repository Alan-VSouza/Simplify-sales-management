using System.ComponentModel.DataAnnotations;
using CursoDev2411.Models;

public class TransactionItem
{
    [Key]
    public int Id { get; set; }

    public int TransactionId { get; set; }
    public Transaction? Transaction { get; set; } 
    public int ProductId { get; set; }
    public Product? Product { get; set; } 
    public int Amount { get; set; }
    public double Value { get; set; }
    public double SellValue { get; set; }
    public double Discount { get; set; }
    public bool Active { get; set; } = true;
    public DateTime CreateAt { get; set; } = DateTime.Now;
    public DateTime UpdateAt { get; set; } = DateTime.Now;
}