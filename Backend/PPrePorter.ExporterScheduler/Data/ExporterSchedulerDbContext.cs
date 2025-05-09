using System;
using System.Collections.Generic;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using PPrePorter.ExporterScheduler.Models;

namespace PPrePorter.ExporterScheduler.Data
{
    /// <summary>
    /// Database context for exporter scheduler data
    /// </summary>
    public class ExporterSchedulerDbContext : DbContext
    {
        public ExporterSchedulerDbContext(DbContextOptions<ExporterSchedulerDbContext> options)
            : base(options)
        {
        }
        
        public DbSet<ScheduleConfiguration> Schedules { get; set; }
        public DbSet<NotificationConfiguration> NotificationConfigurations { get; set; }
        public DbSet<ExecutionHistory> ExecutionHistories { get; set; }
        public DbSet<NotificationHistory> NotificationHistories { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Configure ScheduleConfiguration entity
            modelBuilder.Entity<ScheduleConfiguration>(entity =>
            {
                entity.ToTable("Schedules");
                entity.HasKey(e => e.Id);
                  // Configure complex type properties using JSON serialization
                entity.Property(e => e.Filters)
                    .HasConversion(
                        v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                        v => JsonSerializer.Deserialize<Dictionary<string, object>>(v, (JsonSerializerOptions)null))
                    .HasColumnType("nvarchar(max)");
                
                entity.Property(e => e.SelectedColumns)
                    .HasConversion(
                        v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                        v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null))
                    .HasColumnType("nvarchar(max)");
                
                // Configure enum conversion
                entity.Property(e => e.Frequency)
                    .HasConversion(new EnumToStringConverter<ScheduleFrequency>());
                
                entity.Property(e => e.Format)
                    .HasConversion(new EnumToStringConverter<ExportFormat>());
                
                // Configure one-to-many relationship with NotificationConfiguration
                entity.HasMany(e => e.Notifications)
                    .WithOne()
                    .HasForeignKey("ScheduleId")
                    .OnDelete(DeleteBehavior.Cascade);
            });
            
            // Configure NotificationConfiguration entity
            modelBuilder.Entity<NotificationConfiguration>(entity =>
            {
                entity.ToTable("NotificationConfigurations");
                entity.HasKey(e => e.Id);
                
                // Configure enum conversion
                entity.Property(e => e.Channel)
                    .HasConversion(new EnumToStringConverter<NotificationChannel>());
            });
            
            // Configure ExecutionHistory entity
            modelBuilder.Entity<ExecutionHistory>(entity =>
            {
                entity.ToTable("ExecutionHistories");
                entity.HasKey(e => e.Id);
                
                // Configure relationship with ScheduleConfiguration
                entity.HasOne<ScheduleConfiguration>()
                    .WithMany()
                    .HasForeignKey(e => e.ScheduleId)
                    .OnDelete(DeleteBehavior.Cascade);
                
                // Configure one-to-many relationship with NotificationHistory
                entity.HasMany(e => e.Notifications)
                    .WithOne()
                    .HasForeignKey(e => e.ExecutionId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
            
            // Configure NotificationHistory entity
            modelBuilder.Entity<NotificationHistory>(entity =>
            {
                entity.ToTable("NotificationHistories");
                entity.HasKey(e => e.Id);
                
                // Configure enum conversion
                entity.Property(e => e.Channel)
                    .HasConversion(new EnumToStringConverter<NotificationChannel>());
            });
        }
    }
}