using Microsoft.EntityFrameworkCore;
using PPrePorter.Core.Interfaces;
using PPrePorter.Core.Models.Reports;
using PPrePorter.Domain.Entities.PPReporter;
using PPrePorter.Infrastructure.Models.Metadata;
using PPrePorter.Infrastructure.Entities;

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

        // We need explicit implementation for the Metadata property
        // This is configured as a keyless entity type in OnModelCreating
        DbSet<object> IPPRePorterDbContext.Metadata { get => Set<object>("Metadata"); set { } }

        // Actual DbSet properties for use in the context
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }
        public DbSet<Domain.Entities.PPReporter.UserPreference> UserPreferences { get; set; }
        public DbSet<DailyAction> DailyActions { get; set; }
        public DbSet<WhiteLabel> WhiteLabels { get; set; }
        public DbSet<UserWhiteLabel> UserWhiteLabels { get; set; }
        public DbSet<Game> Games { get; set; }
        public DbSet<DailyActionGame> DailyActionsGames { get; set; }
        public DbSet<Player> Players { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<ReportTemplate> ReportTemplates { get; set; }
        public DbSet<GeneratedReport> GeneratedReports { get; set; }
        public DbSet<ReportExport> ReportExports { get; set; }
        public DbSet<MetadataItem> Metadata { get; set; }

        // Dashboard insights related entities
        public DbSet<Annotation> Annotations { get; set; }
        public DbSet<SharedAnnotation> SharedAnnotations { get; set; }
        public DbSet<UserInteraction> UserInteractions { get; set; }

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

            modelBuilder.Entity<Annotation>(entity =>
            {
                entity.ToTable("Annotations");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.Type).HasMaxLength(50);
                entity.Property(e => e.RelatedDimension).HasMaxLength(50);
                entity.Property(e => e.RelatedMetric).HasMaxLength(50);
                entity.Property(e => e.CreatedBy).HasMaxLength(100);
                entity.Property(e => e.UserId).HasMaxLength(50);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.ModifiedAt).HasDefaultValueSql("GETUTCDATE()");
            });

            modelBuilder.Entity<SharedAnnotation>(entity =>
            {
                entity.ToTable("SharedAnnotations");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.AnnotationId).IsRequired();
                entity.Property(e => e.SharedWithUserId).IsRequired().HasMaxLength(50);
                entity.Property(e => e.SharedAt).HasDefaultValueSql("GETUTCDATE()");

                // Relationship with Annotation
                entity.HasOne(sa => sa.Annotation)
                      .WithMany()
                      .HasForeignKey(sa => sa.AnnotationId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<UserInteraction>(entity =>
            {
                entity.ToTable("UserInteractions");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ComponentId).IsRequired().HasMaxLength(100);
                entity.Property(e => e.InteractionType).IsRequired().HasMaxLength(50);
                entity.Property(e => e.MetricKey).HasMaxLength(50);
                entity.Property(e => e.Timestamp).HasDefaultValueSql("GETUTCDATE()");

                // Remove the relationship with UserPreference to avoid ambiguity
                entity.HasOne<Domain.Entities.PPReporter.UserPreference>()
                      .WithMany()
                      .HasForeignKey(ui => ui.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
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
        }
    }
}