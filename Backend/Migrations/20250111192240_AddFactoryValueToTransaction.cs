using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CursoDev2411.Migrations
{
    /// <inheritdoc />
    public partial class AddFactoryValueToTransaction : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "FactoryValue",
                table: "Products",
                type: "float",
                nullable: false,
                defaultValue: 0.0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FactoryValue",
                table: "Products");
        }
    }
}
