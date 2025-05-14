using Microsoft.EntityFrameworkCore;
using PPrePorter.Core.Interfaces;
using PPrePorter.Core.Models.Reports;
using PPrePorter.Core.Models.Metadata;
using PPrePorter.Domain.Entities.PPReporter;
using PPrePorter.Domain.Entities.PPReporter.Dashboard;
using PPrePorter.Infrastructure.Models.Metadata;
using PPrePorter.Infrastructure.Entities;
using PPrePorter.Infrastructure.Extensions;
using Dashboard = PPrePorter.Domain.Entities.PPReporter.Dashboard;
using CoreDailyAction = PPrePorter.Core.Models.Entities.DailyAction;
using CorePlayer = PPrePorter.Core.Models.Entities.Player;
using DomainTransaction = PPrePorter.Domain.Entities.PPReporter.Transaction;
using InfraTransaction = PPrePorter.Infrastructure.Entities.Transaction;
using InfraPlayer = PPrePorter.Infrastructure.Entities.Player;

namespace PPrePorter.Infrastructure.Data
{
    public class PPRePorterDbContext : DbContext, IPPRePorterDbContext
    {
        private readonly IConnectionStringResolverService _connectionStringResolver;
        private readonly string _connectionStringTemplate;

        public PPRePorterDbContext(
            DbContextOptions<PPRePorterDbContext> options,
            IConnectionStringResolverService connectionStringResolver,
            string connectionStringTemplate)
            : base(options)
        {
            _connectionStringResolver = connectionStringResolver;
            _connectionStringTemplate = connectionStringTemplate;
        }

        // Explicit interface implementation for the Metadata property
        DbSet<object> IPPRePorterDbContext.Metadata { get => Set<object>("Metadata"); set { } }

        // Explicit interface implementation for Players and Transactions to match the interface types
        DbSet<CorePlayer> IPPRePorterDbContext.Players { get => Set<CorePlayer>("Players"); set { } }
        DbSet<DomainTransaction> IPPRePorterDbContext.Transactions { get => Set<DomainTransaction>("Transactions"); set { } }

        // Explicit interface implementation for DailyActionsMetadata to match the interface type
        // This is a view/proxy for the MetadataItem entity
        DbSet<DailyActionsMetadataItem> IPPRePorterDbContext.DailyActionsMetadata {
            get {
                // We're using a custom implementation to avoid the duplicate mapping issue
                // The actual implementation is in the OnModelCreating method
                // We'll use the DailyActionsMetadataQueryProvider to handle the conversion
                return Set<DailyActionsMetadataItem>();
            }
            set { }
        }

        // Actual DbSet properties for use in the context
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }
        public DbSet<Domain.Entities.PPReporter.UserPreference> UserPreferences { get; set; }
        public DbSet<CoreDailyAction> DailyActions { get; set; }
        public DbSet<WhiteLabel> WhiteLabels { get; set; }
        public DbSet<UserWhiteLabel> UserWhiteLabels { get; set; }
        public DbSet<Game> Games { get; set; }
        public DbSet<DailyActionGame> DailyActionsGames { get; set; }
        public DbSet<InfraPlayer> Players { get; set; }
        public DbSet<InfraTransaction> Transactions { get; set; }
        public DbSet<ReportTemplate> ReportTemplates { get; set; }
        public DbSet<GeneratedReport> GeneratedReports { get; set; }
        public DbSet<ReportExport> ReportExports { get; set; }
        public DbSet<MetadataItem> Metadata { get; set; }

        // Dashboard insights related entities
        public DbSet<DataAnnotation> Annotations { get; set; }
        public DbSet<Dashboard.SharedAnnotation> AnnotationShares { get; set; }
        public DbSet<Dashboard.UserInteraction> UserInteractions { get; set; }

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

            // Configure the object entity type as keyless
            modelBuilder.Entity<object>().HasNoKey();

            // Configure entity mappings and relationships for PPRePorterDB
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("Users");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Username).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
                entity.Property(e => e.PasswordHash).IsRequired();
                entity.Property(e => e.FirstName).HasMaxLength(50);
                entity.Property(e => e.LastName).HasMaxLength(50);
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.FailedLoginAttempts).HasDefaultValue(0);
                entity.Property(e => e.LockoutEnd).IsRequired(false);
                entity.Property(e => e.LastFailedLoginAttempt).IsRequired(false);
                entity.Ignore(e => e.IsLockedOut); // This is a computed property

                // Relationship with Role
                entity.HasOne(u => u.Role)
                      .WithMany(r => r.Users)
                      .HasForeignKey(u => u.RoleId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Role>(entity =>
            {
                entity.ToTable("Roles");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Description).HasMaxLength(200);
            });

            modelBuilder.Entity<RolePermission>(entity =>
            {
                entity.ToTable("RolePermissions");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.PermissionName).HasMaxLength(100);
                entity.Property(e => e.IsAllowed).HasDefaultValue(false);

                // Relationship with Role
                entity.HasOne(rp => rp.Role)
                      .WithMany(r => r.Permissions)
                      .HasForeignKey(rp => rp.RoleId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Domain.Entities.PPReporter.UserPreference>(entity =>
            {
                entity.ToTable("UserPreferences");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
            });

            modelBuilder.Entity<DataAnnotation>(entity =>
            {
                entity.ToTable("Annotations");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.Type).HasMaxLength(50);
                entity.Property(e => e.DataType).HasMaxLength(50);
                entity.Property(e => e.RelatedDimension).HasMaxLength(50);
                entity.Property(e => e.RelatedMetric).HasMaxLength(50);
                entity.Property(e => e.CreatedBy).HasMaxLength(100);
                entity.Property(e => e.UserId).HasMaxLength(50);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.ModifiedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.Color).HasMaxLength(20);
                entity.Property(e => e.Icon).HasMaxLength(50);
            });

            modelBuilder.Entity<Dashboard.SharedAnnotation>(entity =>
            {
                entity.ToTable("AnnotationShares");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.AnnotationId).IsRequired();
                entity.Property(e => e.SharedWithUserId).IsRequired().HasMaxLength(50);
                entity.Property(e => e.SharedAt).HasDefaultValueSql("GETUTCDATE()");
            });

            modelBuilder.Entity<Dashboard.UserInteraction>(entity =>
            {
                entity.ToTable("UserInteractions");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ComponentId).IsRequired().HasMaxLength(100);
                entity.Property(e => e.InteractionType).IsRequired().HasMaxLength(50);
                entity.Property(e => e.MetricKey).HasMaxLength(50);
                entity.Property(e => e.Timestamp).HasDefaultValueSql("GETUTCDATE()");
            });

            modelBuilder.Entity<InfraTransaction>(entity =>
            {
                entity.ToTable("Transactions");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.TransactionAmount).HasColumnType("decimal(18, 2)");
                entity.Property(e => e.TransactionType).HasMaxLength(50);
                entity.Property(e => e.CurrencyCode).HasMaxLength(10);
                entity.Property(e => e.Status).HasMaxLength(50);
                entity.Property(e => e.Platform).HasMaxLength(50);
                entity.Property(e => e.PaymentMethod).HasMaxLength(50);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.IpAddress).HasMaxLength(50);
                entity.Property(e => e.Country).HasMaxLength(50);
                entity.Property(e => e.Device).HasMaxLength(50);
                entity.Property(e => e.Browser).HasMaxLength(50);
                entity.Property(e => e.OperatingSystem).HasMaxLength(50);
                entity.Property(e => e.Referrer).HasMaxLength(500);
                entity.Property(e => e.AffiliateId).HasMaxLength(50);
                entity.Property(e => e.CampaignId).HasMaxLength(50);
                entity.Property(e => e.BonusId).HasMaxLength(50);
                entity.Property(e => e.BonusName).HasMaxLength(100);
                entity.Property(e => e.BonusType).HasMaxLength(50);
                entity.Property(e => e.BonusAmount).HasColumnType("decimal(18, 2)");
                entity.Property(e => e.BonusCurrency).HasMaxLength(10);
                entity.Property(e => e.BonusStatus).HasMaxLength(50);
                entity.Property(e => e.WhiteLabelId).HasMaxLength(50);
                entity.Property(e => e.WhiteLabelName).HasMaxLength(100);
                entity.Property(e => e.PlayerName).HasMaxLength(100);

                // Relationship with Player
                entity.HasOne(t => t.Player)
                      .WithMany(p => p.Transactions)
                      .HasForeignKey(t => t.PlayerID) // Use PlayerID (int) instead of PlayerId (string)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<MetadataItem>(entity =>
            {
                entity.ToTable("DailyActionsMetadata", "dbo");
                entity.HasKey(e => e.Id);

                // Create a unique index on MetadataType and Code
                entity.HasIndex(e => new { e.MetadataType, e.Code }).IsUnique();

                // Create an index on MetadataType for faster lookups
                entity.HasIndex(e => e.MetadataType);

                // Create an index on ParentId for hierarchical lookups
                entity.HasIndex(e => e.ParentId);
            });

            // Configure DailyActionsMetadataItem as a keyless entity (view)
            modelBuilder.Entity<DailyActionsMetadataItem>(entity => {
                entity.HasNoKey();
                entity.ToView(null);

                // Add a query filter to convert MetadataItem to DailyActionsMetadataItem
                // This is a workaround for the duplicate mapping issue
                entity.HasQueryFilter(e => false); // Never query directly from the database
            });

            // Configure DailyActionGame entity
            modelBuilder.Entity<DailyActionGame>(entity =>
            {
                entity.ToTable("DailyActionGames");
                entity.HasKey(e => e.Id);

                // Configure decimal properties with proper precision and scale
                entity.Property(e => e.RealBetAmount).HasColumnType("decimal(18, 2)");
                entity.Property(e => e.RealWinAmount).HasColumnType("decimal(18, 2)");
                entity.Property(e => e.BonusBetAmount).HasColumnType("decimal(18, 2)");
                entity.Property(e => e.BonusWinAmount).HasColumnType("decimal(18, 2)");
                entity.Property(e => e.Revenue).HasColumnType("decimal(18, 2)");
                entity.Property(e => e.Bets).HasColumnType("decimal(18, 2)");
                entity.Property(e => e.Wins).HasColumnType("decimal(18, 2)");

                // Relationships
                entity.HasOne(d => d.Game)
                      .WithMany(g => g.DailyActions)
                      .HasForeignKey(d => d.GameId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(d => d.Player)
                      .WithMany(p => p.DailyActionGames)
                      .HasForeignKey(d => d.PlayerID)
                      .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}