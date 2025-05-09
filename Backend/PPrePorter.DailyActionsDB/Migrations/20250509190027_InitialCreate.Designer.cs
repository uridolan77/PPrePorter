﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using PPrePorter.DailyActionsDB.Data;

#nullable disable

namespace PPrePorter.DailyActionsDB.Migrations
{
    [DbContext(typeof(DailyActionsDbContext))]
    [Migration("20250509190027_InitialCreate")]
    partial class InitialCreate
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "9.0.4")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

            modelBuilder.Entity("PPrePorter.DailyActionsDB.Models.DailyAction", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<decimal?>("BetsBingo")
                        .HasColumnType("decimal(18, 2)");

                    b.Property<decimal?>("BetsCasino")
                        .HasColumnType("decimal(18, 2)");

                    b.Property<decimal?>("BetsLive")
                        .HasColumnType("decimal(18, 2)");

                    b.Property<decimal?>("BetsSport")
                        .HasColumnType("decimal(18, 2)");

                    b.Property<DateTime>("Date")
                        .HasColumnType("datetime2");

                    b.Property<decimal?>("Deposits")
                        .HasColumnType("decimal(18, 2)");

                    b.Property<int>("FTD")
                        .HasColumnType("int");

                    b.Property<decimal?>("PaidCashouts")
                        .HasColumnType("decimal(18, 2)");

                    b.Property<int>("Registration")
                        .HasColumnType("int");

                    b.Property<int>("WhiteLabelID")
                        .HasColumnType("int");

                    b.Property<decimal?>("WinsBingo")
                        .HasColumnType("decimal(18, 2)");

                    b.Property<decimal?>("WinsCasino")
                        .HasColumnType("decimal(18, 2)");

                    b.Property<decimal?>("WinsLive")
                        .HasColumnType("decimal(18, 2)");

                    b.Property<decimal?>("WinsSport")
                        .HasColumnType("decimal(18, 2)");

                    b.HasKey("Id");

                    b.HasIndex("WhiteLabelID");

                    b.HasIndex("Date", "WhiteLabelID");

                    b.ToTable("DailyActions", (string)null);
                });

            modelBuilder.Entity("PPrePorter.DailyActionsDB.Models.Transaction", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<decimal>("Amount")
                        .HasColumnType("decimal(18, 2)");

                    b.Property<string>("Currency")
                        .IsRequired()
                        .HasMaxLength(10)
                        .HasColumnType("nvarchar(10)");

                    b.Property<string>("GameId")
                        .HasMaxLength(50)
                        .HasColumnType("nvarchar(50)");

                    b.Property<string>("GameName")
                        .HasMaxLength(100)
                        .HasColumnType("nvarchar(100)");

                    b.Property<string>("PlayerId")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("nvarchar(50)");

                    b.Property<DateTime>("TransactionDate")
                        .HasColumnType("datetime2");

                    b.Property<string>("TransactionId")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("nvarchar(50)");

                    b.Property<string>("TransactionType")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("nvarchar(50)");

                    b.Property<string>("WhitelabelId")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("nvarchar(50)");

                    b.HasKey("Id");

                    b.HasIndex("TransactionDate");

                    b.ToTable("DailyActionTransactions", (string)null);
                });

            modelBuilder.Entity("PPrePorter.DailyActionsDB.Models.WhiteLabel", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("Description")
                        .HasMaxLength(200)
                        .HasColumnType("nvarchar(200)");

                    b.Property<bool>("IsActive")
                        .HasColumnType("bit");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("nvarchar(100)");

                    b.HasKey("Id");

                    b.ToTable("WhiteLabels", (string)null);
                });

            modelBuilder.Entity("PPrePorter.DailyActionsDB.Models.DailyAction", b =>
                {
                    b.HasOne("PPrePorter.DailyActionsDB.Models.WhiteLabel", "WhiteLabel")
                        .WithMany("DailyActions")
                        .HasForeignKey("WhiteLabelID")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("WhiteLabel");
                });

            modelBuilder.Entity("PPrePorter.DailyActionsDB.Models.WhiteLabel", b =>
                {
                    b.Navigation("DailyActions");
                });
#pragma warning restore 612, 618
        }
    }
}
