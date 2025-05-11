using Microsoft.AspNetCore.Mvc;
using PPrePorter.DailyActionsDB.Models.Players;
using System.Dynamic;

namespace PPrePorter.API.Features.Reports.Controllers.Players
{
    /// <summary>
    /// Partial class for PlayerController containing data retrieval endpoints
    /// </summary>
    public partial class PlayerController
    {
        /// <summary>
        /// Get players data with basic filters
        /// </summary>
        /// <param name="casinoName">Optional casino name filter</param>
        /// <param name="country">Optional country filter</param>
        /// <param name="currency">Optional currency filter</param>
        /// <param name="registrationStartDate">Optional registration start date filter</param>
        /// <param name="registrationEndDate">Optional registration end date filter</param>
        [HttpGet("data")]
        public async Task<IActionResult> GetPlayersData(
            [FromQuery] string? casinoName = null,
            [FromQuery] string? country = null,
            [FromQuery] string? currency = null,
            [FromQuery] DateTime? registrationStartDate = null,
            [FromQuery] DateTime? registrationEndDate = null)
        {
            try
            {
                // Start performance timer
                var startTime = DateTime.UtcNow;
                _logger.LogInformation("PERF [{Timestamp}]: Starting GetPlayersData request",
                    startTime.ToString("HH:mm:ss.fff"));

                // Log the parameters
                _logger.LogInformation("CONTROLLER [{Timestamp}]: Getting players with parameters: casinoName={CasinoName}, country={Country}, currency={Currency}, registrationStartDate={RegistrationStartDate}, registrationEndDate={RegistrationEndDate}",
                    DateTime.UtcNow.ToString("HH:mm:ss.fff"),
                    casinoName, country, currency,
                    registrationStartDate?.ToString("yyyy-MM-dd"),
                    registrationEndDate?.ToString("yyyy-MM-dd"));

                // Calculate expected cache key format for debugging
                string expectedCacheKeyFormat = $"Players_Data_{casinoName ?? "all"}_{country ?? "all"}_{currency ?? "all"}_{registrationStartDate?.ToString("yyyyMMdd") ?? "all"}_{registrationEndDate?.ToString("yyyyMMdd") ?? "all"}";
                _logger.LogInformation("CONTROLLER [{Timestamp}]: Expected cache key format: {ExpectedCacheKeyFormat}",
                    DateTime.UtcNow.ToString("HH:mm:ss.fff"), expectedCacheKeyFormat);

                // Get players data - measure time
                var getDataStartTime = DateTime.UtcNow;

                // Get data based on filters
                IEnumerable<Player> players;

                // GUARDRAIL: Check if at least one filter is provided
                bool hasFilter = !string.IsNullOrEmpty(casinoName) ||
                                !string.IsNullOrEmpty(country) ||
                                !string.IsNullOrEmpty(currency) ||
                                registrationStartDate.HasValue;

                if (!hasFilter)
                {
                    _logger.LogWarning("No filters provided for player query. This could result in a large dataset. Requiring at least one filter.");
                    return BadRequest(new {
                        message = "At least one filter must be provided. Please specify casinoName, country, currency, or registrationStartDate.",
                        totalCount = 0,
                        data = new List<object>()
                    });
                }

                // Apply filters in priority order
                if (!string.IsNullOrEmpty(casinoName))
                {
                    _logger.LogInformation("Filtering players by casino name: {CasinoName}", casinoName);
                    players = await _playerService.GetPlayersByCasinoNameAsync(casinoName);
                }
                else if (!string.IsNullOrEmpty(country))
                {
                    _logger.LogInformation("Filtering players by country: {Country}", country);
                    players = await _playerService.GetPlayersByCountryAsync(country);
                }
                else if (!string.IsNullOrEmpty(currency))
                {
                    _logger.LogInformation("Filtering players by currency: {Currency}", currency);
                    players = await _playerService.GetPlayersByCurrencyAsync(currency);
                }
                else if (registrationStartDate.HasValue)
                {
                    // If only start date is provided, use current date as end date
                    var endDate = registrationEndDate ?? DateTime.UtcNow;
                    _logger.LogInformation("Filtering players by registration date range: {StartDate} to {EndDate}",
                        registrationStartDate.Value, endDate);

                    players = await _playerService.GetPlayersByRegistrationDateRangeAsync(
                        registrationStartDate.Value, endDate);
                }
                else
                {
                    // This should never happen due to the guardrail above, but keeping as a fallback
                    _logger.LogWarning("No valid filters found despite guardrail check. Using default filter (last 7 days)");
                    var defaultStartDate = DateTime.UtcNow.AddDays(-7);
                    var defaultEndDate = DateTime.UtcNow;

                    players = await _playerService.GetPlayersByRegistrationDateRangeAsync(
                        defaultStartDate, defaultEndDate);
                }

                var getDataEndTime = DateTime.UtcNow;
                var getDataElapsedMs = (getDataEndTime - getDataStartTime).TotalMilliseconds;

                _logger.LogInformation("PERF [{Timestamp}]: GetPlayersData completed in {ElapsedMs}ms",
                    getDataEndTime.ToString("HH:mm:ss.fff"), getDataElapsedMs);

                // Limit the number of records to prevent Swagger UI from crashing
                var limitedPlayers = players.Take(100).ToList();
                _logger.LogInformation("Retrieved {TotalCount} players, limiting to {LimitedCount} for the response",
                    players.Count(), limitedPlayers.Count);

                // Create a dynamic object with all properties from Player
                var result = limitedPlayers.Select(player =>
                {
                    // Create a dynamic object to hold all properties
                    var obj = new ExpandoObject() as IDictionary<string, object>;

                    // Add all properties from Player
                    obj["playerId"] = player.PlayerID;
                    obj["casinoName"] = player.CasinoName;
                    obj["alias"] = player.Alias;
                    obj["registeredDate"] = player.RegisteredDate;
                    obj["firstDepositDate"] = player.FirstDepositDate;
                    obj["dateOfBirth"] = player.DateOfBirth;
                    obj["gender"] = player.Gender;
                    obj["country"] = player.Country;
                    obj["currency"] = player.Currency;
                    obj["balance"] = player.Balance ?? 0;
                    obj["originalBalance"] = player.OriginalBalance ?? 0;
                    obj["affiliateId"] = player.AffiliateID;
                    obj["language"] = player.Language;
                    obj["registeredPlatform"] = player.RegisteredPlatform;
                    obj["email"] = player.Email;
                    obj["isOptIn"] = player.IsOptIn ?? false;
                    obj["isBlocked"] = player.IsBlocked ?? false;
                    obj["isTest"] = player.IsTest ?? false;
                    obj["lastLoginDate"] = player.LastLoginDate;
                    obj["vipLevel"] = player.VIPLevel;
                    obj["lastUpdated"] = player.LastUpdated;
                    obj["totalDeposits"] = player.TotalDeposits ?? 0;
                    obj["totalWithdrawals"] = player.TotalWithdrawals ?? 0;
                    obj["firstName"] = player.FirstName;
                    obj["lastName"] = player.LastName;
                    obj["dynamicParameter"] = player.DynamicParameter;
                    obj["clickId"] = player.ClickId;
                    obj["countryCode"] = player.CountryCode;
                    obj["phoneNumber"] = player.PhoneNumber;
                    obj["mobileNumber"] = player.MobileNumber;
                    obj["city"] = player.City;
                    obj["address"] = player.Address;
                    obj["zipCode"] = player.ZipCode;
                    obj["documentsStatus"] = player.DocumentsStatus;
                    obj["platformString"] = player.PlatformString;
                    obj["smsEnabled"] = player.SMSEnabled ?? false;
                    obj["mailEnabled"] = player.MailEnabled ?? false;
                    obj["promotionsEnabled"] = player.PromotionsEnabled ?? false;
                    obj["bonusesEnabled"] = player.BonusesEnabled ?? false;
                    obj["ip"] = player.IP;
                    obj["promotionCode"] = player.PromotionCode;
                    obj["loggedIn"] = player.LoggedIn ?? false;
                    obj["status"] = player.Status;
                    obj["blockDate"] = player.BlockDate;
                    obj["blockReason"] = player.BlockReason;
                    obj["blockReleaseDate"] = player.BlockReleaseDate;
                    obj["boAgent"] = player.BOAgent;
                    obj["lastDepositDate"] = player.LastDepositDate;
                    obj["depositsCount"] = player.DepositsCount ?? 0;
                    obj["welcomeBonus"] = player.WelcomeBonus;
                    obj["blockType"] = player.BlockType;
                    obj["accountBalance"] = player.AccountBalance ?? 0;
                    obj["bonusBalance"] = player.BonusBalance ?? 0;
                    obj["customerClubPoints"] = player.CustomerClubPoints ?? 0;
                    obj["totalChargeBacks"] = player.TotalChargeBacks ?? 0;
                    obj["totalChargebackReverses"] = player.TotalChargebackReverses ?? 0;
                    obj["totalVoids"] = player.TotalVoids ?? 0;
                    obj["totalBonuses"] = player.TotalBonuses ?? 0;
                    obj["totalCustomerClubPoints"] = player.TotalCustomerClubPoints ?? 0;
                    obj["maxBalance"] = player.MaxBalance ?? 0;
                    obj["ranking"] = player.Ranking ?? 0;
                    obj["wagered"] = player.Wagered ?? 0;
                    obj["casinoId"] = player.CasinoID ?? 0;
                    obj["currencySymbol"] = player.CurrencySymbol;
                    obj["revenueEur"] = player.RevenueEUR ?? 0;
                    obj["lastLoginPlatform"] = player.LastLoginPlatform;
                    obj["promotionsMailEnabled"] = player.PromotionsMailEnabled ?? false;
                    obj["promotionsSmsEnabled"] = player.PromotionsSMSEnabled ?? false;
                    obj["promotionsPhoneEnabled"] = player.PromotionsPhoneEnabled ?? false;
                    obj["promotionsPostEnabled"] = player.PromotionsPostEnabled ?? false;
                    obj["promotionsPartnerEnabled"] = player.PromotionsPartnerEnabled ?? false;
                    obj["welcomeBonusCode"] = player.WelcomeBonusCode;
                    obj["welcomeBonusDesc"] = player.WelcomeBonusDesc;
                    obj["welcomeBonusSport"] = player.WelcomeBonusSport;
                    obj["welcomeBonusSportCode"] = player.WelcomeBonusSportCode;
                    obj["welcomeBonusSportDesc"] = player.WelcomeBonusSportDesc;
                    obj["registrationPlayMode"] = player.RegistrationPlayMode;
                    obj["totalBetsCasino"] = player.TotalBetsCasino ?? 0;
                    obj["totalBetsSport"] = player.TotalBetsSport ?? 0;
                    obj["depositsCountCasino"] = player.DepositsCountCasino ?? 0;
                    obj["depositsCountSport"] = player.DepositsCountSport ?? 0;
                    obj["firstDepositMethod"] = player.FirstDepositMethod;
                    obj["lastDepositMethod"] = player.LastDepositMethod;
                    obj["firstBonusId"] = player.FirstBonusID ?? 0;
                    obj["lastBonusId"] = player.LastBonusID ?? 0;
                    obj["bonusBalanceSport"] = player.BonusBalanceSport ?? 0;
                    obj["pushEnabled"] = player.PushEnabled ?? false;
                    obj["promotionsPushEnabled"] = player.PromotionsPushEnabled ?? false;
                    obj["lastUpdate"] = player.LastUpdate;
                    obj["fullMobileNumber"] = player.FullMobileNumber;
                    obj["countryId"] = player.CountryID ?? 0;
                    obj["jurisdictionId"] = player.JurisdictionID ?? 0;
                    obj["locale"] = player.Locale;
                    obj["isActivated"] = player.IsActivated ?? false;
                    obj["affordabilityAttempts"] = player.AffordabilityAttempts;
                    obj["affordabilityTreshold"] = player.AffordabilityTreshold ?? 0;
                    obj["affordabilityBalance"] = player.AffordabilityBalance ?? 0;
                    obj["affordabilityStatus"] = player.AffordabilityStatus;
                    obj["affordabilityIncomeRangeChoice"] = player.AffordabilityIncomeRangeChoice ?? 0;
                    obj["affordabilityLastUpdate"] = player.AffordabilityLastUpdate;
                    obj["winningsRestriction"] = player.WinningsRestriction ?? 0;
                    obj["currentWinnings"] = player.CurrentWinnings ?? 0;
                    obj["winningsRestrictionFailedDate"] = player.WinningsRestrictionFailedDate;
                    obj["pendingWithdrawals"] = player.PendingWithdrawals ?? 0;
                    obj["occupation"] = player.Occupation;
                    obj["ftdAmount"] = player.FTDAmount ?? 0;
                    obj["ftdSettlementCompanyId"] = player.FTDSettlementCompanyID ?? 0;
                    obj["age"] = player.Age ?? 0;
                    obj["occupationId"] = player.OccupationID ?? 0;
                    obj["occupationYearlyIncome"] = player.OccupationYearlyIncome ?? 0;
                    obj["depositsCountLive"] = player.DepositsCountLive ?? 0;
                    obj["depositsCountBingo"] = player.DepositsCountBingo ?? 0;
                    obj["totalBetsLive"] = player.TotalBetsLive ?? 0;
                    obj["totalBetsBingo"] = player.TotalBetsBingo ?? 0;
                    obj["promotionalCasinoEmailEnabled"] = player.PromotionalCasinoEmailEnabled ?? false;
                    obj["promotionalCasinoSmsEnabled"] = player.PromotionalCasinoSMSEnabled ?? false;
                    obj["promotionalBingoEmailEnabled"] = player.PromotionalBingoEmailEnabled ?? false;
                    obj["promotionalBingoSmsEnabled"] = player.PromotionalBingoSMSEnabled ?? false;
                    obj["promotionalSportsEmailEnabled"] = player.PromotionalSportsEmailEnabled ?? false;
                    obj["promotionalSportsSmsEnabled"] = player.PromotionalSportsSMSEnabled ?? false;
                    obj["promotionalPushEnabled"] = player.PromotionalPushEnabled ?? false;
                    obj["promotionalPhoneEnabled"] = player.PromotionalPhoneEnabled ?? false;
                    obj["promotionalPostEnabled"] = player.PromotionalPostEnabled ?? false;
                    obj["promotionalPartnerEnabled"] = player.PromotionalPartnerEnabled ?? false;

                    return obj;
                }).ToList();

                // Prepare response
                var response = new
                {
                    data = result,
                    totalCount = players.Count(),
                    filters = new
                    {
                        casinoName,
                        country,
                        currency,
                        registrationStartDate,
                        registrationEndDate
                    }
                };

                // Log total request time
                var endTime = DateTime.UtcNow;
                var totalElapsedMs = (endTime - startTime).TotalMilliseconds;
                _logger.LogInformation("PERF [{Timestamp}]: Total GetPlayersData request completed in {ElapsedMs}ms",
                    endTime.ToString("HH:mm:ss.fff"), totalElapsedMs);

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving players data: {ErrorMessage}", ex.Message);

                // Return a more informative error response
                var errorResponse = new
                {
                    message = "An error occurred while retrieving players data",
                    error = ex.Message,
                    filters = new
                    {
                        casinoName,
                        country,
                        currency,
                        registrationStartDate = registrationStartDate?.ToString("yyyy-MM-dd"),
                        registrationEndDate = registrationEndDate?.ToString("yyyy-MM-dd")
                    },
                    totalCount = 0,
                    data = new List<object>()
                };

                return StatusCode(500, errorResponse);
            }
        }

        /// <summary>
        /// Get a specific player by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPlayerById(long id)
        {
            try
            {
                var player = await _playerService.GetPlayerByIdAsync(id);

                if (player == null)
                {
                    return NotFound(new { message = $"Player with ID {id} not found" });
                }

                // Create a dynamic object with all properties from Player
                var obj = new ExpandoObject() as IDictionary<string, object>;

                // Add all properties
                obj["playerId"] = player.PlayerID;
                obj["casinoName"] = player.CasinoName;
                obj["alias"] = player.Alias;
                obj["registeredDate"] = player.RegisteredDate;
                obj["firstDepositDate"] = player.FirstDepositDate;
                obj["dateOfBirth"] = player.DateOfBirth;
                obj["gender"] = player.Gender;
                obj["country"] = player.Country;
                obj["currency"] = player.Currency;
                obj["balance"] = player.Balance ?? 0;
                obj["email"] = player.Email;
                obj["isBlocked"] = player.IsBlocked ?? false;
                obj["lastLoginDate"] = player.LastLoginDate;
                obj["totalDeposits"] = player.TotalDeposits ?? 0;
                obj["totalWithdrawals"] = player.TotalWithdrawals ?? 0;
                obj["firstName"] = player.FirstName;
                obj["lastName"] = player.LastName;

                return Ok(obj);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving player with ID {Id}", id);
                return StatusCode(500, new { message = "An error occurred while retrieving the player" });
            }
        }
    }
}
