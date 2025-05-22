using System;
using System.Collections.Generic;

namespace PPrePorter.DailyActionsDB.Models.DTOs
{
    /// <summary>
    /// Extension methods for DailyActionDto
    /// </summary>
    public static class DailyActionDtoExtensions
    {
        /// <summary>
        /// Adds grouping-specific metadata to a DailyActionDto
        /// </summary>
        public static DailyActionDto WithGroupingMetadata(this DailyActionDto dto, 
            string? trackerName = null,
            string? genderName = null, 
            string? platformName = null)
        {
            // Store the metadata in the existing properties or in the GroupData dictionary
            if (dto.GroupData == null)
            {
                dto.GroupData = new Dictionary<string, object>();
            }

            if (!string.IsNullOrEmpty(trackerName))
            {
                dto.GroupData["TrackerName"] = trackerName;
            }

            if (!string.IsNullOrEmpty(genderName))
            {
                dto.GroupData["GenderName"] = genderName;
            }

            if (!string.IsNullOrEmpty(platformName))
            {
                dto.GroupData["PlatformName"] = platformName;
            }

            return dto;
        }

        /// <summary>
        /// Gets a grouping-specific metadata value from a DailyActionDto
        /// </summary>
        public static T? GetGroupingMetadata<T>(this DailyActionDto dto, string key)
        {
            if (dto.GroupData != null && dto.GroupData.TryGetValue(key, out var value))
            {
                if (value is T typedValue)
                {
                    return typedValue;
                }
            }
            return default;
        }

        /// <summary>
        /// Gets the tracker name from a DailyActionDto
        /// </summary>
        public static string GetTrackerName(this DailyActionDto dto)
        {
            return dto.GetGroupingMetadata<string>("TrackerName") ?? "Unknown";
        }

        /// <summary>
        /// Gets the gender name from a DailyActionDto
        /// </summary>
        public static string GetGenderName(this DailyActionDto dto)
        {
            return dto.GetGroupingMetadata<string>("GenderName") ?? "Unknown";
        }

        /// <summary>
        /// Gets the platform name from a DailyActionDto
        /// </summary>
        public static string GetPlatformName(this DailyActionDto dto)
        {
            return dto.GetGroupingMetadata<string>("PlatformName") ?? "Unknown";
        }
    }
}
