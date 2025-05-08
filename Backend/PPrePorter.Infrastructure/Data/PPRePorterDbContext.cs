using Microsoft.EntityFrameworkCore;
using PPrePorter.Core.Interfaces;
using PPrePorter.Domain.Entities.PPReporter;

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

        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }
        public DbSet<UserPreference> UserPreferences { get; set; }

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
                entity.Property(e => e.PermissionName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.IsAllowed).HasDefaultValue(false);

                // Relationship with Role
                entity.HasOne(rp => rp.Role)
                      .WithMany(r => r.Permissions)
                      .HasForeignKey(rp => rp.RoleId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<UserPreference>(entity =>
            {
                entity.ToTable("UserPreferences");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.PreferenceKey).IsRequired().HasMaxLength(100);
                entity.Property(e => e.PreferenceValue).IsRequired();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");

                // Relationship with User
                entity.HasOne(up => up.User)
                      .WithMany(u => u.Preferences)
                      .HasForeignKey(up => up.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}