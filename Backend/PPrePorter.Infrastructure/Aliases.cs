using System;

namespace PPrePorter.Infrastructure
{
    /// <summary>
    /// This file contains aliases for types that are used in multiple projects.
    /// This helps avoid ambiguous reference errors.
    /// </summary>
    public static class Aliases
    {
        // Domain.Common
        public static readonly Type BaseEntityType = typeof(PPrePorter.Domain.Common.BaseEntity);
        public static readonly Type UserType = typeof(PPrePorter.Domain.Entities.PPReporter.User);
        public static readonly Type RoleType = typeof(PPrePorter.Domain.Entities.PPReporter.Role);
        public static readonly Type RolePermissionType = typeof(PPrePorter.Domain.Entities.PPReporter.RolePermission);
        public static readonly Type UserPreferenceType = typeof(PPrePorter.Domain.Entities.PPReporter.UserPreference);
        public static readonly Type WhiteLabelType = typeof(PPrePorter.Domain.Entities.PPReporter.WhiteLabel);
        public static readonly Type UserWhiteLabelType = typeof(PPrePorter.Domain.Entities.PPReporter.UserWhiteLabel);
        public static readonly Type GameType = typeof(PPrePorter.Domain.Entities.PPReporter.Game);
        public static readonly Type DailyActionGameType = typeof(PPrePorter.Domain.Entities.PPReporter.DailyActionGame);
        public static readonly Type DailyActionType = typeof(PPrePorter.Core.Models.Entities.DailyAction);
        public static readonly Type PlayerType = typeof(PPrePorter.Core.Models.Entities.Player);
        public static readonly Type TransactionType = typeof(PPrePorter.Domain.Entities.PPReporter.Transaction);

        // Domain.Entities.PPReporter.Dashboard
        public static readonly Type DataAnnotationType = typeof(PPrePorter.Domain.Entities.PPReporter.Dashboard.DataAnnotation);
        public static readonly Type SharedAnnotationType = typeof(PPrePorter.Domain.Entities.PPReporter.Dashboard.SharedAnnotation);
        public static readonly Type UserInteractionType = typeof(PPrePorter.Domain.Entities.PPReporter.Dashboard.UserInteraction);
        public static readonly Type ContextualDataExplorerRequestType = typeof(PPrePorter.Domain.Entities.PPReporter.Dashboard.ContextualDataExplorerRequest);
        public static readonly Type ContextualDataExplorerResultType = typeof(PPrePorter.Domain.Entities.PPReporter.Dashboard.ContextualDataExplorerResult);
        public static readonly Type DashboardPreferencesType = typeof(PPrePorter.Domain.Entities.PPReporter.Dashboard.DashboardPreferences);
        public static readonly Type CasinoRevenueItemType = typeof(PPrePorter.Domain.Entities.PPReporter.Dashboard.CasinoRevenueItem);
    }
}
