using System.ComponentModel.DataAnnotations;

namespace CursoDev2411.Models
{
    public class Transaction
    {
        [Key]
        public int Id { get; set; }

        public DateTime TransactionAt { get; set; } = DateTime.Now;

        public int PersonId { get; set; }
        public Person Person { get; set; } = new Person();

        public TransactionType Type { get; set; }

        public double TotalValue { get; set; }
        public double TotalDiscount { get; set; }

        public double FinalValue { get; set; }
        public PaymentMethod PaymentMethod { get; set; }

        public List<TransactionItem> TransactionsItems { get; set; } = new List<TransactionItem>();

        public bool Active { get; set; } = true;
        public DateTime CreateAt { get; set; } = DateTime.Now;
        public DateTime UpdateAt { get; set; } = DateTime.Now;

        public void CalculateValue()
        {
	        FinalValue = TotalValue - TotalDiscount;
		}
    }

    public enum TransactionType
    {
        Buy,
        Sell
    }

    public enum PaymentMethod
    {
        CreditCard,
        DebitCard,
        Money,
        Pix
    }
}
