using Microsoft.Extensions.Logging;
using PPrePorter.DailyActionsDB.Models.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;

namespace PPrePorter.DailyActionsDB.Services
{
    /// <summary>
    /// Partial class for DailyActionsService - Grouping-related methods
    /// </summary>
    public partial class DailyActionsService
    {
        /// <summary>
        /// Groups daily actions by day
        /// </summary>
        private List<DailyActionDto> GroupByDay(List<DailyActionDto> dailyActions)
        {
            _logger.LogInformation("Grouping by day with {Count} records", dailyActions.Count);

            // Log unique dates in the input data
            var uniqueDates = dailyActions.Select(da => da.Date.Date).Distinct().OrderBy(d => d).ToList();
            _logger.LogInformation("Found {Count} unique dates in the input data: {Dates}",
                uniqueDates.Count,
                string.Join(", ", uniqueDates.Select(d => d.ToString("yyyy-MM-dd"))));

            // Ensure we have at least one record for each date
            if (uniqueDates.Count == 0)
            {
                _logger.LogWarning("No dates found in the input data. Returning empty list.");
                return new List<DailyActionDto>();
            }

            // Group by date
            var result = dailyActions
                .GroupBy(da => da.Date.Date)
                .Select(group =>
                {
                    var date = group.Key;
                    var dateString = date.ToString("yyyy-MM-dd");

                    return new DailyActionDto
                    {
                        Id = 0, // Not applicable for grouped data
                        Date = date,
                        WhiteLabelId = 0, // Not applicable for grouped data
                        WhiteLabelName = "All White Labels",
                        GroupKey = "Day",
                        GroupValue = dateString,
                        
                        // Aggregate metrics
                        Registrations = group.Sum(da => da.Registrations),
                        FTD = group.Sum(da => da.FTD),
                        FTDA = group.Sum(da => da.FTDA),
                        
                        // Deposit metrics
                        Deposits = group.Sum(da => da.Deposits),
                        DepositsCreditCard = group.Sum(da => da.DepositsCreditCard),
                        DepositsNeteller = group.Sum(da => da.DepositsNeteller),
                        DepositsMoneyBookers = group.Sum(da => da.DepositsMoneyBookers),
                        DepositsOther = group.Sum(da => da.DepositsOther),
                        DepositsFee = group.Sum(da => da.DepositsFee),
                        DepositsSport = group.Sum(da => da.DepositsSport),
                        DepositsLive = group.Sum(da => da.DepositsLive),
                        DepositsBingo = group.Sum(da => da.DepositsBingo),
                        
                        // Cashout metrics
                        CashoutRequests = group.Sum(da => da.CashoutRequests),
                        PaidCashouts = group.Sum(da => da.PaidCashouts),
                        Chargebacks = group.Sum(da => da.Chargebacks),
                        Voids = group.Sum(da => da.Voids),
                        ReverseChargebacks = group.Sum(da => da.ReverseChargebacks),
                        
                        // Bonus metrics
                        Bonuses = group.Sum(da => da.Bonuses),
                        BonusesSport = group.Sum(da => da.BonusesSport),
                        BonusesLive = group.Sum(da => da.BonusesLive),
                        BonusesBingo = group.Sum(da => da.BonusesBingo),
                        CollectedBonuses = group.Sum(da => da.CollectedBonuses),
                        ExpiredBonuses = group.Sum(da => da.ExpiredBonuses),
                        BonusConverted = group.Sum(da => da.BonusConverted),
                        
                        // Casino metrics
                        BetsCasino = group.Sum(da => da.BetsCasino),
                        BetsCasinoReal = group.Sum(da => da.BetsCasinoReal),
                        BetsCasinoBonus = group.Sum(da => da.BetsCasinoBonus),
                        RefundsCasino = group.Sum(da => da.RefundsCasino),
                        RefundsCasinoReal = group.Sum(da => da.RefundsCasinoReal),
                        RefundsCasinoBonus = group.Sum(da => da.RefundsCasinoBonus),
                        WinsCasino = group.Sum(da => da.WinsCasino),
                        WinsCasinoReal = group.Sum(da => da.WinsCasinoReal),
                        WinsCasinoBonus = group.Sum(da => da.WinsCasinoBonus),
                        
                        // Sport metrics
                        BetsSport = group.Sum(da => da.BetsSport),
                        BetsSportReal = group.Sum(da => da.BetsSportReal),
                        BetsSportBonus = group.Sum(da => da.BetsSportBonus),
                        RefundsSport = group.Sum(da => da.RefundsSport),
                        RefundsSportReal = group.Sum(da => da.RefundsSportReal),
                        RefundsSportBonus = group.Sum(da => da.RefundsSportBonus),
                        WinsSport = group.Sum(da => da.WinsSport),
                        WinsSportReal = group.Sum(da => da.WinsSportReal),
                        WinsSportBonus = group.Sum(da => da.WinsSportBonus),
                        
                        // Live metrics
                        BetsLive = group.Sum(da => da.BetsLive),
                        BetsLiveReal = group.Sum(da => da.BetsLiveReal),
                        BetsLiveBonus = group.Sum(da => da.BetsLiveBonus),
                        RefundsLive = group.Sum(da => da.RefundsLive),
                        RefundsLiveReal = group.Sum(da => da.RefundsLiveReal),
                        RefundsLiveBonus = group.Sum(da => da.RefundsLiveBonus),
                        WinsLive = group.Sum(da => da.WinsLive),
                        WinsLiveReal = group.Sum(da => da.WinsLiveReal),
                        WinsLiveBonus = group.Sum(da => da.WinsLiveBonus),
                        
                        // Bingo metrics
                        BetsBingo = group.Sum(da => da.BetsBingo),
                        BetsBingoReal = group.Sum(da => da.BetsBingoReal),
                        BetsBingoBonus = group.Sum(da => da.BetsBingoBonus),
                        RefundsBingo = group.Sum(da => da.RefundsBingo),
                        RefundsBingoReal = group.Sum(da => da.RefundsBingoReal),
                        RefundsBingoBonus = group.Sum(da => da.RefundsBingoBonus),
                        WinsBingo = group.Sum(da => da.WinsBingo),
                        WinsBingoReal = group.Sum(da => da.WinsBingoReal),
                        WinsBingoBonus = group.Sum(da => da.WinsBingoBonus),
                        
                        // Side games metrics
                        SideGamesBets = group.Sum(da => da.SideGamesBets),
                        SideGamesRefunds = group.Sum(da => da.SideGamesRefunds),
                        SideGamesWins = group.Sum(da => da.SideGamesWins),
                        SideGamesTableGamesBets = group.Sum(da => da.SideGamesTableGamesBets),
                        SideGamesTableGamesWins = group.Sum(da => da.SideGamesTableGamesWins),
                        SideGamesCasualGamesBets = group.Sum(da => da.SideGamesCasualGamesBets),
                        SideGamesCasualGamesWins = group.Sum(da => da.SideGamesCasualGamesWins),
                        SideGamesSlotsBets = group.Sum(da => da.SideGamesSlotsBets),
                        SideGamesSlotsWins = group.Sum(da => da.SideGamesSlotsWins),
                        SideGamesJackpotsBets = group.Sum(da => da.SideGamesJackpotsBets),
                        SideGamesJackpotsWins = group.Sum(da => da.SideGamesJackpotsWins),
                        SideGamesFeaturedBets = group.Sum(da => da.SideGamesFeaturedBets),
                        SideGamesFeaturedWins = group.Sum(da => da.SideGamesFeaturedWins),
                        
                        // Lotto metrics
                        LottoBets = group.Sum(da => da.LottoBets),
                        LottoAdvancedBets = group.Sum(da => da.LottoAdvancedBets),
                        LottoWins = group.Sum(da => da.LottoWins),
                        LottoAdvancedWins = group.Sum(da => da.LottoAdvancedWins),
                        
                        // App metrics
                        AppBets = group.Sum(da => da.AppBets),
                        AppRefunds = group.Sum(da => da.AppRefunds),
                        AppWins = group.Sum(da => da.AppWins),
                        AppBetsCasino = group.Sum(da => da.AppBetsCasino),
                        AppRefundsCasino = group.Sum(da => da.AppRefundsCasino),
                        AppWinsCasino = group.Sum(da => da.AppWinsCasino),
                        AppBetsSport = group.Sum(da => da.AppBetsSport),
                        AppRefundsSport = group.Sum(da => da.AppRefundsSport),
                        AppWinsSport = group.Sum(da => da.AppWinsSport),
                        
                        // Other financial metrics
                        ClubPointsConversion = group.Sum(da => da.ClubPointsConversion),
                        BankRoll = group.Sum(da => da.BankRoll),
                        JackpotContribution = group.Sum(da => da.JackpotContribution),
                        InsuranceContribution = group.Sum(da => da.InsuranceContribution),
                        Adjustments = group.Sum(da => da.Adjustments),
                        AdjustmentsAdd = group.Sum(da => da.AdjustmentsAdd),
                        ClearedBalance = group.Sum(da => da.ClearedBalance),
                        RevenueAdjustments = group.Sum(da => da.RevenueAdjustments),
                        RevenueAdjustmentsAdd = group.Sum(da => da.RevenueAdjustmentsAdd),
                        AdministrativeFee = group.Sum(da => da.AdministrativeFee),
                        AdministrativeFeeReturn = group.Sum(da => da.AdministrativeFeeReturn),
                        BetsReal = group.Sum(da => da.BetsReal),
                        BetsBonus = group.Sum(da => da.BetsBonus),
                        RefundsReal = group.Sum(da => da.RefundsReal),
                        RefundsBonus = group.Sum(da => da.RefundsBonus),
                        WinsReal = group.Sum(da => da.WinsReal),
                        WinsBonus = group.Sum(da => da.WinsBonus),
                        EUR2GBP = group.Sum(da => da.EUR2GBP),
                        
                        // Calculate GGR values
                        GGRCasino = group.Sum(da => da.BetsCasino) - group.Sum(da => da.WinsCasino),
                        GGRSport = group.Sum(da => da.BetsSport) - group.Sum(da => da.WinsSport),
                        GGRLive = group.Sum(da => da.BetsLive) - group.Sum(da => da.WinsLive),
                        GGRBingo = group.Sum(da => da.BetsBingo) - group.Sum(da => da.WinsBingo),
                        TotalGGR = group.Sum(da => da.TotalGGR)
                    };
                })
                .OrderBy(da => da.Date)
                .ToList();

            _logger.LogInformation("Grouped by day: returning {Count} day groups", result.Count);
            return result;
        }

        /// <summary>
        /// Groups daily actions by month
        /// </summary>
        private List<DailyActionDto> GroupByMonth(List<DailyActionDto> dailyActions)
        {
            return dailyActions
                .GroupBy(da => new { Year = da.Date.Year, Month = da.Date.Month })
                .Select(group =>
                {
                    var firstItem = group.First();
                    var monthName = new DateTime(group.Key.Year, group.Key.Month, 1).ToString("MMMM yyyy");

                    return new DailyActionDto
                    {
                        Id = 0, // Not applicable for grouped data
                        Date = new DateTime(group.Key.Year, group.Key.Month, 1),
                        WhiteLabelId = 0, // Not applicable for grouped data
                        WhiteLabelName = "All White Labels",
                        GroupKey = "Month",
                        GroupValue = monthName,
                        
                        // Aggregate metrics
                        Registrations = group.Sum(da => da.Registrations),
                        FTD = group.Sum(da => da.FTD),
                        FTDA = group.Sum(da => da.FTDA),
                        
                        // Deposit metrics
                        Deposits = group.Sum(da => da.Deposits),
                        DepositsCreditCard = group.Sum(da => da.DepositsCreditCard),
                        DepositsNeteller = group.Sum(da => da.DepositsNeteller),
                        DepositsMoneyBookers = group.Sum(da => da.DepositsMoneyBookers),
                        DepositsOther = group.Sum(da => da.DepositsOther),
                        DepositsFee = group.Sum(da => da.DepositsFee),
                        DepositsSport = group.Sum(da => da.DepositsSport),
                        DepositsLive = group.Sum(da => da.DepositsLive),
                        DepositsBingo = group.Sum(da => da.DepositsBingo),
                        
                        // Cashout metrics
                        CashoutRequests = group.Sum(da => da.CashoutRequests),
                        PaidCashouts = group.Sum(da => da.PaidCashouts),
                        Chargebacks = group.Sum(da => da.Chargebacks),
                        Voids = group.Sum(da => da.Voids),
                        ReverseChargebacks = group.Sum(da => da.ReverseChargebacks),
                        
                        // Bonus metrics
                        Bonuses = group.Sum(da => da.Bonuses),
                        BonusesSport = group.Sum(da => da.BonusesSport),
                        BonusesLive = group.Sum(da => da.BonusesLive),
                        BonusesBingo = group.Sum(da => da.BonusesBingo),
                        CollectedBonuses = group.Sum(da => da.CollectedBonuses),
                        ExpiredBonuses = group.Sum(da => da.ExpiredBonuses),
                        BonusConverted = group.Sum(da => da.BonusConverted),
                        
                        // Casino metrics
                        BetsCasino = group.Sum(da => da.BetsCasino),
                        WinsCasino = group.Sum(da => da.WinsCasino),
                        
                        // Sport metrics
                        BetsSport = group.Sum(da => da.BetsSport),
                        WinsSport = group.Sum(da => da.WinsSport),
                        
                        // Live metrics
                        BetsLive = group.Sum(da => da.BetsLive),
                        WinsLive = group.Sum(da => da.WinsLive),
                        
                        // Bingo metrics
                        BetsBingo = group.Sum(da => da.BetsBingo),
                        WinsBingo = group.Sum(da => da.WinsBingo),
                        
                        // Calculate GGR values
                        GGRCasino = group.Sum(da => da.BetsCasino) - group.Sum(da => da.WinsCasino),
                        GGRSport = group.Sum(da => da.BetsSport) - group.Sum(da => da.WinsSport),
                        GGRLive = group.Sum(da => da.BetsLive) - group.Sum(da => da.WinsLive),
                        GGRBingo = group.Sum(da => da.BetsBingo) - group.Sum(da => da.WinsBingo),
                        TotalGGR = group.Sum(da => da.TotalGGR)
                    };
                })
                .OrderBy(da => da.Date)
                .ToList();
        }
    }
}
