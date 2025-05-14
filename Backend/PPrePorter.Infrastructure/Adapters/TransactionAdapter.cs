using PPrePorter.Core.Models.DTOs;
using CoreTransaction = PPrePorter.Core.Models.Entities.Transaction;
using DbTransaction = PPrePorter.DailyActionsDB.Models.Transactions.Transaction;
using InfraTransaction = PPrePorter.Infrastructure.Entities.Transaction;

namespace PPrePorter.Infrastructure.Adapters
{
    /// <summary>
    /// Adapter for converting between different Transaction models
    /// </summary>
    public static class TransactionAdapter
    {
        /// <summary>
        /// Converts a DailyActionsDB.Models.Transactions.Transaction to Core.Models.Entities.Transaction
        /// </summary>
        public static CoreTransaction ToCore(this DbTransaction dbTransaction)
        {
            return new CoreTransaction
            {
                Id = dbTransaction.Id,
                TransactionDate = dbTransaction.TransactionDate,
                PlayerId = dbTransaction.PlayerId,
                TransactionType = dbTransaction.TransactionType,
                Amount = dbTransaction.Amount,
                OriginalAmount = dbTransaction.OriginalAmount,
                Details = dbTransaction.Details,
                Platform = dbTransaction.Platform,
                Status = dbTransaction.Status,
                Currency = dbTransaction.Currency,
                LastUpdated = dbTransaction.LastUpdated,
                OriginalTransactionId = dbTransaction.OriginalTransactionId,
                SubDetails = dbTransaction.SubDetails,
                Comments = dbTransaction.Comments,
                PaymentMethod = dbTransaction.PaymentMethod,
                PaymentProvider = dbTransaction.PaymentProvider,
                TransactionInfoId = dbTransaction.TransactionInfoId
            };
        }

        /// <summary>
        /// Converts a Core.Models.Entities.Transaction to DailyActionsDB.Models.Transactions.Transaction
        /// </summary>
        public static DbTransaction ToDb(this CoreTransaction coreTransaction)
        {
            return new DbTransaction
            {
                Id = coreTransaction.Id,
                TransactionDate = coreTransaction.TransactionDate,
                PlayerId = coreTransaction.PlayerId,
                TransactionType = coreTransaction.TransactionType,
                Amount = coreTransaction.Amount,
                OriginalAmount = coreTransaction.OriginalAmount,
                Details = coreTransaction.Details,
                Platform = coreTransaction.Platform,
                Status = coreTransaction.Status,
                Currency = coreTransaction.Currency,
                LastUpdated = coreTransaction.LastUpdated,
                OriginalTransactionId = coreTransaction.OriginalTransactionId,
                SubDetails = coreTransaction.SubDetails,
                Comments = coreTransaction.Comments,
                PaymentMethod = coreTransaction.PaymentMethod,
                PaymentProvider = coreTransaction.PaymentProvider,
                TransactionInfoId = coreTransaction.TransactionInfoId
            };
        }

        /// <summary>
        /// Converts a DailyActionsDB.Models.Transactions.Transaction to Core.Models.DTOs.TransactionDto
        /// </summary>
        public static TransactionDto ToDto(this DbTransaction dbTransaction, string playerName = "", string whiteLabelId = "", string whiteLabelName = "")
        {
            return new TransactionDto
            {
                Id = dbTransaction.Id,
                TransactionId = dbTransaction.TransactionId,
                TransactionInfoId = dbTransaction.TransactionInfoId?.ToString() ?? string.Empty,
                PlayerId = dbTransaction.PlayerId,
                PlayerName = playerName,
                WhiteLabelId = whiteLabelId,
                WhiteLabelName = whiteLabelName,
                TransactionDate = dbTransaction.TransactionDate,
                TransactionType = dbTransaction.TransactionType,
                Amount = dbTransaction.Amount,
                Currency = dbTransaction.Currency,
                Status = dbTransaction.Status ?? string.Empty,
                PaymentMethod = dbTransaction.PaymentMethod ?? string.Empty,
                Description = dbTransaction.Details ?? string.Empty,
                Platform = dbTransaction.Platform ?? string.Empty,
                // The following properties are not available in the DbTransaction model
                // They would need to be populated from other sources
                IpAddress = string.Empty,
                Country = string.Empty,
                Device = string.Empty,
                Browser = string.Empty,
                OperatingSystem = string.Empty,
                Referrer = string.Empty,
                AffiliateId = string.Empty,
                CampaignId = string.Empty,
                BonusId = string.Empty,
                BonusName = string.Empty,
                BonusType = string.Empty,
                BonusAmount = null,
                BonusCurrency = string.Empty,
                BonusStatus = string.Empty,
                BonusExpiryDate = null
            };
        }

        /// <summary>
        /// Converts a Infrastructure.Entities.Transaction to Core.Models.DTOs.TransactionDto
        /// </summary>
        public static TransactionDto ToDto(this InfraTransaction infraTransaction)
        {
            return new TransactionDto
            {
                Id = infraTransaction.Id,
                TransactionId = infraTransaction.TransactionId,
                TransactionInfoId = string.Empty, // Not available in InfraTransaction
                PlayerId = infraTransaction.PlayerId,
                PlayerName = infraTransaction.PlayerName,
                WhiteLabelId = infraTransaction.WhiteLabelId,
                WhiteLabelName = infraTransaction.WhiteLabelName,
                TransactionDate = infraTransaction.TransactionDate,
                TransactionType = infraTransaction.TransactionType,
                Amount = infraTransaction.TransactionAmount,
                Currency = infraTransaction.CurrencyCode,
                Status = infraTransaction.Status,
                PaymentMethod = infraTransaction.PaymentMethod,
                Description = infraTransaction.Description,
                Platform = infraTransaction.Platform,
                IpAddress = infraTransaction.IpAddress,
                Country = infraTransaction.Country,
                Device = infraTransaction.Device,
                Browser = infraTransaction.Browser,
                OperatingSystem = infraTransaction.OperatingSystem,
                Referrer = infraTransaction.Referrer,
                AffiliateId = infraTransaction.AffiliateId,
                CampaignId = infraTransaction.CampaignId,
                BonusId = infraTransaction.BonusId,
                BonusName = infraTransaction.BonusName,
                BonusType = infraTransaction.BonusType,
                BonusAmount = infraTransaction.BonusAmount,
                BonusCurrency = infraTransaction.BonusCurrency,
                BonusStatus = infraTransaction.BonusStatus,
                BonusExpiryDate = infraTransaction.BonusExpiryDate
            };
        }

        /// <summary>
        /// Converts a Core.Models.Entities.Transaction to Infrastructure.Entities.Transaction
        /// </summary>
        public static InfraTransaction ToInfra(this CoreTransaction coreTransaction)
        {
            return new InfraTransaction
            {
                Id = coreTransaction.Id,
                TransactionDate = coreTransaction.TransactionDate,
                PlayerId = coreTransaction.PlayerId,
                TransactionAmount = coreTransaction.Amount,
                TransactionType = coreTransaction.TransactionType,
                CurrencyCode = coreTransaction.Currency,
                Status = coreTransaction.Status ?? string.Empty,
                Platform = coreTransaction.Platform ?? string.Empty,
                PaymentMethod = coreTransaction.PaymentMethod ?? string.Empty,
                Description = coreTransaction.Details ?? string.Empty
                // Other properties are not available in CoreTransaction
            };
        }
    }
}
