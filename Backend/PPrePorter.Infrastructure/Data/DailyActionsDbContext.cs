using Microsoft.EntityFrameworkCore;
using PPrePorter.Core.Interfaces;
using PPrePorter.Domain.Entities.DailyActions;

namespace PPrePorter.Infrastructure.Data
{
    public class DailyActionsDbContext : DbContext, IDailyActionsDbContext
    {
        private readonly IConnectionStringResolverService _connectionStringResolver;
        private readonly string _connectionStringTemplate;

        public DailyActionsDbContext(
            DbContextOptions<DailyActionsDbContext> options,
            IConnectionStringResolverService connectionStringResolver,
            string connectionStringTemplate) 
            : base(options)
        {
            _connectionStringResolver = connectionStringResolver;
            _connectionStringTemplate = connectionStringTemplate;
        }

        public DbSet<Transaction> Transactions { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                // We will use this method to dynamically resolve the connection string
                // when needed (lazy initialization)
                optionsBuilder.UseSqlServer(_connectionStringResolver.ResolveConnectionStringAsync(_connectionStringTemplate).Result);
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure entity mappings and relationships for DailyActionsDB
            modelBuilder.Entity<Transaction>(entity =>
            {
                entity.ToTable("Transactions");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.TransactionId).IsRequired().HasMaxLength(50);
                entity.Property(e => e.PlayerId).IsRequired().HasMaxLength(50);
                entity.Property(e => e.WhitelabelId).IsRequired().HasMaxLength(50);
                entity.Property(e => e.GameId).HasMaxLength(50);
                entity.Property(e => e.GameName).HasMaxLength(100);
                entity.Property(e => e.Amount).HasColumnType("decimal(18, 2)");
                entity.Property(e => e.TransactionType).HasMaxLength(50);
                entity.Property(e => e.Currency).HasMaxLength(10);
            });
        }
    }
}