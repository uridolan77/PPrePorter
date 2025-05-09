using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PPrePorter.DailyActionsDB.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DailyActionTransactions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TransactionId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TransactionDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PlayerId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    WhitelabelId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    GameId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    GameName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TransactionType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DailyActionTransactions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WhiteLabels",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WhiteLabels", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DailyActions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WhiteLabelID = table.Column<int>(type: "int", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Registration = table.Column<int>(type: "int", nullable: false),
                    FTD = table.Column<int>(type: "int", nullable: false),
                    Deposits = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    PaidCashouts = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    BetsCasino = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    WinsCasino = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    BetsSport = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    WinsSport = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    BetsLive = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    WinsLive = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    BetsBingo = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    WinsBingo = table.Column<decimal>(type: "decimal(18,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DailyActions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DailyActions_WhiteLabels_WhiteLabelID",
                        column: x => x.WhiteLabelID,
                        principalTable: "WhiteLabels",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DailyActions_Date_WhiteLabelID",
                table: "DailyActions",
                columns: new[] { "Date", "WhiteLabelID" });

            migrationBuilder.CreateIndex(
                name: "IX_DailyActions_WhiteLabelID",
                table: "DailyActions",
                column: "WhiteLabelID");

            migrationBuilder.CreateIndex(
                name: "IX_DailyActionTransactions_TransactionDate",
                table: "DailyActionTransactions",
                column: "TransactionDate");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DailyActions");

            migrationBuilder.DropTable(
                name: "DailyActionTransactions");

            migrationBuilder.DropTable(
                name: "WhiteLabels");
        }
    }
}
