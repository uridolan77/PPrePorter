-- Database Views and Stored Procedures for ProgressPlay Reporting Platform

-- --------------------------------------------------------
-- 1. Core Reporting Views
-- --------------------------------------------------------

-- Player Summary Reporting View
CREATE VIEW [dbo].[vw_PlayerSummaryReport]
AS
SELECT
    p.PlayerID,
    p.CasinoID,
    wl.LabelName AS WhiteLabel,
    p.Alias,
    p.FirstName,
    p.LastName,
    CASE WHEN p.IsTest = 1 THEN 'Test' ELSE 'Real' END AS PlayerType,
    p.RegisteredDate,
    p.FirstDepositDate,
    p.LastLoginDate,
    p.LastDepositDate,
    p.Country,
    p.Currency,
    p.CurrencySymbol,
    p.Email,
    p.Status,
    p.RegisteredPlatform,
    p.LastLoginPlatform,
    p.VIPLevel,
    p.TotalDeposits,
    p.TotalWithdrawals,
    p.TotalBetsCasino,
    p.TotalBetsSport,
    p.TotalBetsLive,
    p.TotalBetsBingo,
    p.DepositsCount,
    p.DepositsCountCasino,
    p.DepositsCountSport,
    p.DepositsCountLive,
    p.DepositsCountBingo,
    p.AffiliateID,
    p.DynamicParameter AS Tracker,
    p.ClickId,
    p.Wagered,
    p.RevenueEUR,
    p.Language
FROM
    common.tbl_Daily_actions_players p
LEFT JOIN
    common.tbl_White_labels wl ON p.CasinoID = wl.LabelID
GO

-- Player Games Reporting View
CREATE VIEW [dbo].[vw_PlayerGamesReport]
AS
SELECT
    p.PlayerID,
    p.CasinoID,
    wl.LabelName AS WhiteLabel,
    p.Alias,
    p.FirstName,
    p.LastName,
    CASE WHEN p.IsTest = 1 THEN 'Test' ELSE 'Real' END AS PlayerType,
    g.GameDate,
    ga.GameName,
    ga.Provider,
    ga.SubProvider,
    ga.GameType,
    ga.GameID,
    g.Platform,
    g.RealBetAmount,
    g.RealWinAmount,
    g.BonusBetAmount,
    g.BonusWinAmount,
    g.RealBetAmount + g.BonusBetAmount - g.RealWinAmount - g.BonusWinAmount AS GGR,
    g.NumberofRealBets,
    g.NumberofRealWins,
    g.NumberofBonusBets,
    g.NumberofBonusWins,
    g.NumberofSessions
FROM
    common.tbl_Daily_actions_games g
INNER JOIN
    common.tbl_Daily_actions_players p ON g.PlayerID = p.PlayerID
INNER JOIN
    dbo.Games ga ON g.GameID = ga.GameID
LEFT JOIN
    common.tbl_White_labels wl ON p.CasinoID = wl.LabelID
GO

-- Transactions Reporting View
CREATE VIEW [dbo].[vw_TransactionsReport]
AS
SELECT
    t.TransactionID,
    t.PlayerID,
    p.CasinoID,
    wl.LabelName AS WhiteLabel,
    p.Alias,
    p.FirstName,
    p.LastName,
    CASE WHEN p.IsTest = 1 THEN 'Test' ELSE 'Real' END AS PlayerType,
    t.TransactionDate,
    t.TransactionType,
    t.TransactionAmount,
    t.TransactionOriginalAmount,
    t.CurrencyCode,
    p.CurrencySymbol,
    t.Status,
    t.Platform,
    t.PaymentMethod,
    t.PaymentProvider,
    t.TransactionDetails,
    t.TransactionSubDetails,
    t.TransactionComments,
    t.OriginalTransactionID,
    p.AffiliateID,
    p.DynamicParameter AS Tracker
FROM
    common.tbl_Daily_actions_transactions t
INNER JOIN
    common.tbl_Daily_actions_players p ON t.PlayerID = p.PlayerID
LEFT JOIN
    common.tbl_White_labels wl ON p.CasinoID = wl.LabelID
GO

-- Bonuses Reporting View
CREATE VIEW [dbo].[vw_BonusesReport]
AS
SELECT
    bb.BonusBalanceID,
    bb.PlayerID,
    p.CasinoID,
    wl.LabelName AS WhiteLabel,
    p.Alias,
    p.FirstName,
    p.LastName,
    CASE WHEN p.IsTest = 1 THEN 'Test' ELSE 'Real' END AS PlayerType,
    b.BonusID,
    b.BonusName,
    b.InternalName,
    b.BonusType,
    CASE WHEN b.IsSportBonus = 1 THEN 'Sport' ELSE 'Casino' END AS BonusCategory,
    bb.Amount,
    bb.Balance,
    bb.WagerLeft,
    bb.OriginalDepositAmount,
    bb.MaxCashableWinnings,
    bb.AmountConverted,
    CASE WHEN bb.IsSportBonus = 1 THEN 'Sport' ELSE 'Casino' END AS BonusBalanceCategory,
    bb.Status,
    bb.CreationDate,
    bb.UpdatedDate,
    bb.FreeSpinsOffer,
    bb.FreeSpinsAmount,
    bb.FreeSpinsLeft,
    bb.DepositCode,
    cu.CurrencyCode,
    cu.CurrencySymbol,
    p.AffiliateID,
    p.DynamicParameter AS Tracker
FROM
    common.tbl_Bonus_balances bb
INNER JOIN
    common.tbl_Daily_actions_players p ON bb.PlayerID = p.PlayerID
LEFT JOIN
    common.tbl_Bonuses b ON bb.BonusID = b.BonusID
LEFT JOIN
    common.tbl_Currencies cu ON bb.CurrencyID = cu.CurrencyID
LEFT JOIN
    common.tbl_White_labels wl ON p.CasinoID = wl.LabelID
GO

-- Games Reporting View
CREATE VIEW [dbo].[vw_GamesReport]
AS
SELECT
    g.GameID,
    g.GameName,
    g.Provider,
    g.SubProvider,
    g.GameType,
    g.ServerGameID,
    g.ProviderTitle,
    g.ReleaseDate,
    g.UpdatedDate,
    g.PayoutLow,
    g.PayoutHigh,
    g.Volatility,
    g.WagerPercent,
    g.JackpotContribution,
    g.GameOrder,
    g.GameFilters,
    CASE WHEN g.IsActive = 1 THEN 'Active' ELSE 'Inactive' END AS Status,
    CASE WHEN g.DemoEnabled = 1 THEN 'Yes' ELSE 'No' END AS DemoEnabled,
    CASE WHEN g.UKCompliant = 1 THEN 'Yes' ELSE 'No' END AS UKCompliant,
    CASE WHEN g.IsDesktop = 1 THEN 'Yes' ELSE 'No' END AS IsDesktop,
    CASE WHEN g.IsMobile = 1 THEN 'Yes' ELSE 'No' END AS IsMobile,
    CASE WHEN g.HideInLobby = 1 THEN 'Yes' ELSE 'No' END AS HideInLobby
FROM
    dbo.Games g
GO

-- Daily Summary Reporting View
CREATE VIEW [dbo].[vw_DailySummaryReport]
AS
SELECT
    CAST(da.Date AS DATE) AS ActivityDate,
    wl.LabelID AS WhiteLabelID,
    wl.LabelName AS WhiteLabel,
    COUNT(DISTINCT CASE WHEN da.Registration = 1 THEN da.PlayerID END) AS Registrations,
    COUNT(DISTINCT CASE WHEN da.FTD = 1 THEN da.PlayerID END) AS FirstTimeDepositors,
    SUM(da.Deposits) AS TotalDeposits,
    SUM(da.DepositsCreditCard) AS CreditCardDeposits,
    SUM(da.DepositsNeteller) AS NetellerDeposits,
    SUM(da.DepositsMoneyBookers) AS SkrillDeposits,
    SUM(da.DepositsOther) AS OtherDeposits,
    SUM(da.PaidCashouts) AS TotalWithdrawals,
    SUM(da.Chargebacks) AS Chargebacks,
    SUM(da.Voids) AS Voids,
    SUM(da.ReverseChargebacks) AS ReverseChargebacks,
    SUM(da.Bonuses) AS Bonuses,
    SUM(da.BonusesSport) AS BonusesSport,
    SUM(da.CollectedBonuses) AS CollectedBonuses,
    SUM(da.ExpiredBonuses) AS ExpiredBonuses,
    SUM(da.BetsCasino) AS BetsCasino,
    SUM(da.WinsCasino) AS WinsCasino,
    SUM(da.BetsCasino - da.WinsCasino) AS GGRCasino,
    SUM(da.BetsSport) AS BetsSport,
    SUM(da.WinsSport) AS WinsSport,
    SUM(da.BetsSport - da.WinsSport) AS GGRSport,
    SUM(da.BetsLive) AS BetsLive,
    SUM(da.WinsLive) AS WinsLive,
    SUM(da.BetsLive - da.WinsLive) AS GGRLive,
    SUM(da.BetsBingo) AS BetsBingo,
    SUM(da.WinsBingo) AS WinsBingo,
    SUM(da.BetsBingo - da.WinsBingo) AS GGRBingo,
    SUM(da.AppBets) AS AppBets,
    SUM(da.AppWins) AS AppWins,
    SUM(da.AppBets - da.AppWins) AS GGRApp,
    SUM(
        (da.BetsCasino - da.WinsCasino) +
        (da.BetsSport - da.WinsSport) +
        (da.BetsLive - da.WinsLive) +
        (da.BetsBingo - da.WinsBingo)
    ) AS TotalGGR,
    SUM(da.JackpotContribution) AS JackpotContribution
FROM
    common.tbl_Daily_actions da
LEFT JOIN
    common.tbl_White_labels wl ON da.WhiteLabelID = wl.LabelID
GROUP BY
    CAST(da.Date AS DATE),
    wl.LabelID,
    wl.LabelName
GO

-- Sport Bets Reporting View
CREATE VIEW [dbo].[vw_SportBetsReport]
AS
SELECT
    sb.PlayerId,
    p.Alias,
    p.FirstName,
    p.LastName,
    wl.LabelName AS WhiteLabel,
    sr.RegionName,
    ss.SportName,
    sc.CompetitionName,
    sm.MatchName,
    sb.IsLive,
    sm2.MarketName,
    sbt.BetTypeName,
    sot.OddTypeName,
    sbs.BetStateName,
    sb.RelativeBet AS BetAmount,
    sb.RelativeWin AS WinAmount,
    sb.RelativeBet - sb.RelativeWin AS GGR,
    sb.UpdatedDate
FROM
    dbo.SportBetsEnhanced sb
INNER JOIN
    common.tbl_Daily_actions_players p ON sb.PlayerId = p.PlayerID
LEFT JOIN
    common.tbl_White_labels wl ON p.CasinoID = wl.LabelID
LEFT JOIN
    dbo.SportRegions sr ON sb.RegionId = sr.RegionID
LEFT JOIN
    dbo.SportSports ss ON sb.SportId = ss.SportID
LEFT JOIN
    dbo.SportCompetitions sc ON sb.CompetitionId = sc.CompetitionID
LEFT JOIN
    dbo.SportMatches sm ON sb.MatchId = sm.MatchID
LEFT JOIN
    dbo.SportMarkets sm2 ON sb.MarketId = sm2.MarketTypeID
LEFT JOIN
    dbo.SportBetTypes sbt ON sb.BetType = sbt.BetTypeID
LEFT JOIN
    dbo.SportOddsTypes sot ON sb.OddTypeId = sot.OddTypeID
LEFT JOIN
    dbo.SportBetStates sbs ON sb.BetState = sbs.BetStateID
GO

-- Big Winners Reporting View (Enhanced)
CREATE VIEW [dbo].[vw_BigWinnersReport]
AS
SELECT
    bw.TransactionID,
    bw.PlayerID,
    p.Alias,
    CONCAT(p.FirstName, ' ', LEFT(p.LastName, 1), '.') AS PlayerName,
    p.CasinoID,
    wl.LabelName AS WhiteLabel,
    p.Country,
    p.Currency,
    p.CurrencySymbol,
    bw.GameID,
    g.GameName,
    g.Provider,
    g.SubProvider,
    g.GameType,
    g.ServerGameID,
    bw.Amount,
    p.CurrencySymbol + CAST(CONVERT(varchar(20), bw.Amount, 1) AS nvarchar(50)) AS AmountFormatted,
    bw.Date AS WinDate,
    CASE WHEN p.IsTest = 1 THEN 'Test' ELSE 'Real' END AS PlayerType,
    p.AffiliateID,
    p.DynamicParameter AS Tracker
FROM
    dbo.BigWinners bw
INNER JOIN
    common.tbl_Daily_actions_players p ON bw.PlayerID = p.PlayerID
INNER JOIN
    dbo.Games g ON bw.GameID = g.GameID
LEFT JOIN
    common.tbl_White_labels wl ON p.CasinoID = wl.LabelID
GO

-- --------------------------------------------------------
-- 2. Stored Procedures for Advanced Reporting
-- --------------------------------------------------------

-- Procedure for Advanced Reporting with dynamic grouping and filtering
CREATE PROCEDURE [dbo].[sp_GenerateAdvancedReport]
    @StartDate DATETIME = NULL,
    @EndDate DATETIME = NULL,
    @WhiteLabelIds NVARCHAR(MAX) = NULL,
    @Countries NVARCHAR(MAX) = NULL,
    @PlayModes NVARCHAR(MAX) = NULL,
    @PlayerTypes NVARCHAR(MAX) = NULL,
    @Affiliates NVARCHAR(MAX) = NULL,
    @Trackers NVARCHAR(MAX) = NULL,
    @GroupBy NVARCHAR(100) = NULL,
    @OrderBy NVARCHAR(100) = NULL,
    @OrderDirection NVARCHAR(4) = 'ASC',
    @PageNumber INT = 1,
    @PageSize INT = 50
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @SQL NVARCHAR(MAX);
    DECLARE @ParamDefinition NVARCHAR(1000);
    DECLARE @GroupByClause NVARCHAR(1000) = '';
    DECLARE @OrderByClause NVARCHAR(1000) = '';
    DECLARE @WhereClause NVARCHAR(MAX) = '';
    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;
    
    -- Build WHERE clause based on parameters
    IF @StartDate IS NOT NULL
    BEGIN
        SET @WhereClause = @WhereClause + ' AND p.RegisteredDate >= @StartDate';
    END
    
    IF @EndDate IS NOT NULL
    BEGIN
        SET @WhereClause = @WhereClause + ' AND p.RegisteredDate <= @EndDate';
    END
    
    IF @WhiteLabelIds IS NOT NULL AND @WhiteLabelIds <> ''
    BEGIN
        SET @WhereClause = @WhereClause + ' AND p.CasinoID IN (SELECT value FROM STRING_SPLIT(@WhiteLabelIds, '',''))';
    END
    
    IF @Countries IS NOT NULL AND @Countries <> ''
    BEGIN
        SET @WhereClause = @WhereClause + ' AND p.Country IN (SELECT value FROM STRING_SPLIT(@Countries, '',''))';
    END
    
    IF @PlayModes IS NOT NULL AND @PlayModes <> ''
    BEGIN
        SET @WhereClause = @WhereClause + ' AND p.RegisteredPlatform IN (SELECT value FROM STRING_SPLIT(@PlayModes, '',''))';
    END
    
    IF @PlayerTypes IS NOT NULL AND @PlayerTypes <> ''
    BEGIN
        IF @PlayerTypes = 'Real'
            SET @WhereClause = @WhereClause + ' AND p.IsTest = 0';
        ELSE IF @PlayerTypes = 'Test'
            SET @WhereClause = @WhereClause + ' AND p.IsTest = 1';
    END
    
    IF @Affiliates IS NOT NULL AND @Affiliates <> ''
    BEGIN
        SET @WhereClause = @WhereClause + ' AND p.AffiliateID IN (SELECT value FROM STRING_SPLIT(@Affiliates, '',''))';
    END
    
    IF @Trackers IS NOT NULL AND @Trackers <> ''
    BEGIN
        SET @WhereClause = @WhereClause + ' AND p.DynamicParameter IN (SELECT value FROM STRING_SPLIT(@Trackers, '',''))';
    END
    
    -- Build GROUP BY clause
    IF @GroupBy IS NOT NULL AND @GroupBy <> ''
    BEGIN
        CASE @GroupBy
            WHEN 'Date' THEN 
                SET @GroupByClause = ' GROUP BY CAST(p.RegisteredDate AS DATE)';
                SET @SQL = 'SELECT CAST(p.RegisteredDate AS DATE) AS RegistrationDate, 
                    COUNT(*) AS TotalPlayers,
                    COUNT(CASE WHEN p.FirstDepositDate IS NOT NULL THEN 1 END) AS Depositors,
                    SUM(p.TotalDeposits) AS TotalDeposits,
                    SUM(p.TotalWithdrawals) AS TotalWithdrawals,
                    SUM(p.TotalBetsCasino) AS TotalBetsCasino,
                    SUM(p.TotalBetsSport) AS TotalBetsSport,
                    SUM(p.TotalBetsLive) AS TotalBetsLive,
                    SUM(p.TotalBetsBingo) AS TotalBetsBingo,
                    SUM(p.TotalBetsCasino + p.TotalBetsSport + p.TotalBetsLive + p.TotalBetsBingo) AS TotalBets,
                    SUM(p.RevenueEUR) AS TotalRevenue';
                    
            WHEN 'WhiteLabel' THEN 
                SET @GroupByClause = ' GROUP BY p.CasinoID, wl.LabelName';
                SET @SQL = 'SELECT p.CasinoID, wl.LabelName AS WhiteLabel, 
                    COUNT(*) AS TotalPlayers,
                    COUNT(CASE WHEN p.FirstDepositDate IS NOT NULL THEN 1 END) AS Depositors,
                    SUM(p.TotalDeposits) AS TotalDeposits,
                    SUM(p.TotalWithdrawals) AS TotalWithdrawals,
                    SUM(p.TotalBetsCasino) AS TotalBetsCasino,
                    SUM(p.TotalBetsSport) AS TotalBetsSport,
                    SUM(p.TotalBetsLive) AS TotalBetsLive,
                    SUM(p.TotalBetsBingo) AS TotalBetsBingo,
                    SUM(p.TotalBetsCasino + p.TotalBetsSport + p.TotalBetsLive + p.TotalBetsBingo) AS TotalBets,
                    SUM(p.RevenueEUR) AS TotalRevenue';
                    
            WHEN 'Country' THEN 
                SET @GroupByClause = ' GROUP BY p.Country';
                SET @SQL = 'SELECT p.Country, 
                    COUNT(*) AS TotalPlayers,
                    COUNT(CASE WHEN p.FirstDepositDate IS NOT NULL THEN 1 END) AS Depositors,
                    SUM(p.TotalDeposits) AS TotalDeposits,
                    SUM(p.TotalWithdrawals) AS TotalWithdrawals,
                    SUM(p.TotalBetsCasino) AS TotalBetsCasino,
                    SUM(p.TotalBetsSport) AS TotalBetsSport,
                    SUM(p.TotalBetsLive) AS TotalBetsLive,
                    SUM(p.TotalBetsBingo) AS TotalBetsBingo,
                    SUM(p.TotalBetsCasino + p.TotalBetsSport + p.TotalBetsLive + p.TotalBetsBingo) AS TotalBets,
                    SUM(p.RevenueEUR) AS TotalRevenue';
                    
            WHEN 'PlayMode' THEN 
                SET @GroupByClause = ' GROUP BY p.RegisteredPlatform';
                SET @SQL = 'SELECT p.RegisteredPlatform AS PlayMode, 
                    COUNT(*) AS TotalPlayers,
                    COUNT(CASE WHEN p.FirstDepositDate IS NOT NULL THEN 1 END) AS Depositors,
                    SUM(p.TotalDeposits) AS TotalDeposits,
                    SUM(p.TotalWithdrawals) AS TotalWithdrawals,
                    SUM(p.TotalBetsCasino) AS TotalBetsCasino,
                    SUM(p.TotalBetsSport) AS TotalBetsSport,
                    SUM(p.TotalBetsLive) AS TotalBetsLive,
                    SUM(p.TotalBetsBingo) AS TotalBetsBingo,
                    SUM(p.TotalBetsCasino + p.TotalBetsSport + p.TotalBetsLive + p.TotalBetsBingo) AS TotalBets,
                    SUM(p.RevenueEUR) AS TotalRevenue';
                    
            WHEN 'Currency' THEN 
                SET @GroupByClause = ' GROUP BY p.Currency';
                SET @SQL = 'SELECT p.Currency, 
                    COUNT(*) AS TotalPlayers,
                    COUNT(CASE WHEN p.FirstDepositDate IS NOT NULL THEN 1 END) AS Depositors,
                    SUM(p.TotalDeposits) AS TotalDeposits,
                    SUM(p.TotalWithdrawals) AS TotalWithdrawals,
                    SUM(p.TotalBetsCasino) AS TotalBetsCasino,
                    SUM(p.TotalBetsSport) AS TotalBetsSport,
                    SUM(p.TotalBetsLive) AS TotalBetsLive,
                    SUM(p.TotalBetsBingo) AS TotalBetsBingo,
                    SUM(p.TotalBetsCasino + p.TotalBetsSport + p.TotalBetsLive + p.TotalBetsBingo) AS TotalBets,
                    SUM(p.RevenueEUR) AS TotalRevenue';
                    
            WHEN 'AffiliateID' THEN 
                SET @GroupByClause = ' GROUP BY p.AffiliateID';
                SET @SQL = 'SELECT p.AffiliateID, 
                    COUNT(*) AS TotalPlayers,
                    COUNT(CASE WHEN p.FirstDepositDate IS NOT NULL THEN 1 END) AS Depositors,
                    SUM(p.TotalDeposits) AS TotalDeposits,
                    SUM(p.TotalWithdrawals) AS TotalWithdrawals,
                    SUM(p.TotalBetsCasino) AS TotalBetsCasino,
                    SUM(p.TotalBetsSport) AS TotalBetsSport,
                    SUM(p.TotalBetsLive) AS TotalBetsLive,
                    SUM(p.TotalBetsBingo) AS TotalBetsBingo,
                    SUM(p.TotalBetsCasino + p.TotalBetsSport + p.TotalBetsLive + p.TotalBetsBingo) AS TotalBets,
                    SUM(p.RevenueEUR) AS TotalRevenue';
                    
            WHEN 'Tracker' THEN 
                SET @GroupByClause = ' GROUP BY p.DynamicParameter';
                SET @SQL = 'SELECT p.DynamicParameter AS Tracker, 
                    COUNT(*) AS TotalPlayers,
                    COUNT(CASE WHEN p.FirstDepositDate IS NOT NULL THEN 1 END) AS Depositors,
                    SUM(p.TotalDeposits) AS TotalDeposits,
                    SUM(p.TotalWithdrawals) AS TotalWithdrawals,
                    SUM(p.TotalBetsCasino) AS TotalBetsCasino,
                    SUM(p.TotalBetsSport) AS TotalBetsSport,
                    SUM(p.TotalBetsLive) AS TotalBetsLive,
                    SUM(p.TotalBetsBingo) AS TotalBetsBingo,
                    SUM(p.TotalBetsCasino + p.TotalBetsSport + p.TotalBetsLive + p.TotalBetsBingo) AS TotalBets,
                    SUM(p.RevenueEUR) AS TotalRevenue';
                    
            ELSE
                SET @GroupByClause = '';
                SET @SQL = 'SELECT p.PlayerID, p.Alias, p.FirstName, p.LastName, 
                    wl.LabelName AS WhiteLabel, 
                    p.Country, p.Currency, p.RegisteredDate, p.FirstDepositDate,
                    p.LastLoginDate, p.TotalDeposits, p.TotalWithdrawals,
                    p.TotalBetsCasino, p.TotalBetsSport, p.TotalBetsLive, p.TotalBetsBingo,
                    p.TotalBetsCasino + p.TotalBetsSport + p.TotalBetsLive + p.TotalBetsBingo AS TotalBets,
                    p.RevenueEUR, p.AffiliateID, p.DynamicParameter AS Tracker';
        END;
    END
    ELSE
    BEGIN
        -- Default query without grouping
        SET @SQL = 'SELECT p.PlayerID, p.Alias, p.FirstName, p.LastName, 
            wl.LabelName AS WhiteLabel, 
            p.Country, p.Currency, p.RegisteredDate, p.FirstDepositDate,
            p.LastLoginDate, p.TotalDeposits, p.TotalWithdrawals,
            p.TotalBetsCasino, p.TotalBetsSport, p.TotalBetsLive, p.TotalBetsBingo,
            p.TotalBetsCasino + p.TotalBetsSport + p.TotalBetsLive + p.TotalBetsBingo AS TotalBets,
            p.RevenueEUR, p.AffiliateID, p.DynamicParameter AS Tracker';
    END
    
    -- Build ORDER BY clause
    IF @OrderBy IS NOT NULL AND @OrderBy <> ''
    BEGIN
        SET @OrderByClause = ' ORDER BY ' + @OrderBy + ' ' + @OrderDirection;
    END
    ELSE
    BEGIN
        -- Default ordering
        IF @GroupBy IS NULL OR @GroupBy = ''
            SET @OrderByClause = ' ORDER BY p.RegisteredDate DESC';
        ELSE
            -- Default ordering for grouped data
            SET @OrderByClause = ' ORDER BY COUNT(*) DESC';
    END
    
    -- Complete the SQL statement
    SET @SQL = @SQL + ' FROM common.tbl_Daily_actions_players p
        LEFT JOIN common.tbl_White_labels wl ON p.CasinoID = wl.LabelID 
        WHERE 1=1' + @WhereClause + @GroupByClause + @OrderByClause + '
        OFFSET @Offset ROWS
        FETCH NEXT @PageSize ROWS ONLY';
    
    -- Set up parameters
    SET @ParamDefinition = N'@StartDate DATETIME, @EndDate DATETIME, 
        @WhiteLabelIds NVARCHAR(MAX), @Countries NVARCHAR(MAX), 
        @PlayModes NVARCHAR(MAX), @PlayerTypes NVARCHAR(MAX), 
        @Affiliates NVARCHAR(MAX), @Trackers NVARCHAR(MAX),
        @Offset INT, @PageSize INT';
    
    -- Execute dynamic SQL
    EXEC sp_executesql @SQL, @ParamDefinition, 
        @StartDate = @StartDate, 
        @EndDate = @EndDate, 
        @WhiteLabelIds = @WhiteLabelIds,
        @Countries = @Countries,
        @PlayModes = @PlayModes,
        @PlayerTypes = @PlayerTypes,
        @Affiliates = @Affiliates,
        @Trackers = @Trackers,
        @Offset = @Offset,
        @PageSize = @PageSize;
        
    -- Get total count for pagination
    DECLARE @CountSQL NVARCHAR(MAX);
    IF @GroupBy IS NULL OR @GroupBy = ''
    BEGIN
        SET @CountSQL = 'SELECT COUNT(*) FROM common.tbl_Daily_actions_players p 
            LEFT JOIN common.tbl_White_labels wl ON p.CasinoID = wl.LabelID 
            WHERE 1=1' + @WhereClause;
    END
    ELSE
    BEGIN
        SET @CountSQL = 'SELECT COUNT(*) FROM (
            SELECT 1 AS DummyCol FROM common.tbl_Daily_actions_players p 
            LEFT JOIN common.tbl_White_labels wl ON p.CasinoID = wl.LabelID 
            WHERE 1=1' + @WhereClause + @GroupByClause + ') AS CountTable';
    END
    
    EXEC sp_executesql @CountSQL, @ParamDefinition, 
        @StartDate = @StartDate, 
        @EndDate = @EndDate, 
        @WhiteLabelIds = @WhiteLabelIds,
        @Countries = @Countries,
        @PlayModes = @PlayModes,
        @PlayerTypes = @PlayerTypes,
        @Affiliates = @Affiliates,
        @Trackers = @Trackers,
        @Offset = @Offset,
        @PageSize = @PageSize;
END
GO

-- --------------------------------------------------------
-- 3. Stored Procedures for Player Reports
-- --------------------------------------------------------

-- Procedure for Player Details Report
CREATE PROCEDURE [dbo].[sp_GetPlayerDetailsReport]
    @PlayerID BIGINT = NULL,
    @Alias NVARCHAR(500) = NULL,
    @WhiteLabelId INT = NULL,
    @StartDate DATETIME = NULL,
    @EndDate DATETIME = NULL,
    @AffiliateId NVARCHAR(10) = NULL,
    @Tracker NVARCHAR(500) = NULL,
    @PageNumber INT = 1,
    @PageSize INT = 50
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @WhereClause NVARCHAR(MAX) = '';
    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;
    
    -- Build WHERE clause based on parameters
    IF @PlayerID IS NOT NULL
    BEGIN
        SET @WhereClause = @WhereClause + ' AND p.PlayerID = @PlayerID';
    END
    
    IF @Alias IS NOT NULL AND @Alias <> ''
    BEGIN
        SET @WhereClause = @WhereClause + ' AND p.Alias LIKE ''%'' + @Alias + ''%''';
    END
    
    IF @WhiteLabelId IS NOT NULL
    BEGIN
        SET @WhereClause = @WhereClause + ' AND p.CasinoID = @WhiteLabelId';
    END
    
    IF @StartDate IS NOT NULL
    BEGIN
        SET @WhereClause = @WhereClause + ' AND p.RegisteredDate >= @StartDate';
    END
    
    IF @EndDate IS NOT NULL
    BEGIN
        SET @WhereClause = @WhereClause + ' AND p.RegisteredDate <= @EndDate';
    END
    
    IF @AffiliateId IS NOT NULL AND @AffiliateId <> ''
    BEGIN
        SET @WhereClause = @WhereClause + ' AND p.AffiliateID = @AffiliateId';
    END
    
    IF @Tracker IS NOT NULL AND @Tracker <> ''
    BEGIN
        SET @WhereClause = @WhereClause + ' AND p.DynamicParameter = @Tracker';
    END
    
    -- Get player details
    DECLARE @SQL NVARCHAR(MAX) = '
        SELECT 
            p.PlayerID,
            p.Alias,
            p.FirstName,
            p.LastName,
            p.Email,
            p.MobileNumber,
            p.Country,
            p.CountryCode,
            p.Currency,
            p.CurrencySymbol,
            p.Language,
            p.RegisteredDate,
            p.FirstDepositDate,
            p.LastDepositDate,
            p.LastLoginDate,
            p.RegisteredPlatform,
            p.LastLoginPlatform,
            CASE WHEN p.IsTest = 1 THEN ''Test'' ELSE ''Real'' END AS PlayerType,
            p.Status,
            p.IsBlocked,
            p.BlockReason,
            p.BlockDate,
            p.BlockReleaseDate,
            p.IsOptIn,
            p.TotalDeposits,
            p.TotalWithdrawals,
            p.TotalBetsCasino,
            p.TotalBetsSport,
            p.TotalBetsLive,
            p.TotalBetsBingo,
            p.DepositsCount,
            p.DepositsCountCasino,
            p.DepositsCountSport,
            p.DepositsCountLive,
            p.DepositsCountBingo,
            p.MailEnabled,
            p.SMSEnabled,
            p.PushEnabled,
            p.BonusesEnabled,
            p.PromotionsEnabled,
            p.AffiliateID,
            p.DynamicParameter AS Tracker,
            p.ClickId,
            wl.LabelName AS WhiteLabel,
            wl.LabelID AS WhiteLabelID
        FROM 
            common.tbl_Daily_actions_players p
        LEFT JOIN 
            common.tbl_White_labels wl ON p.CasinoID = wl.LabelID
        WHERE 
            1=1' + @WhereClause + '
        ORDER BY 
            p.RegisteredDate DESC
        OFFSET @Offset ROWS
        FETCH NEXT @PageSize ROWS ONLY';
    
    EXEC sp_executesql @SQL, 
        N'@PlayerID BIGINT, @Alias NVARCHAR(500), @WhiteLabelId INT, 
        @StartDate DATETIME, @EndDate DATETIME, @AffiliateId NVARCHAR(10), 
        @Tracker NVARCHAR(500), @Offset INT, @PageSize INT',
        @PlayerID = @PlayerID,
        @Alias = @Alias,
        @WhiteLabelId = @WhiteLabelId,
        @StartDate = @StartDate,
        @EndDate = @EndDate,
        @AffiliateId = @AffiliateId,
        @Tracker = @Tracker,
        @Offset = @Offset,
        @PageSize = @PageSize;
        
    -- Get total count for pagination
    DECLARE @CountSQL NVARCHAR(MAX) = '
        SELECT COUNT(*)
        FROM common.tbl_Daily_actions_players p
        LEFT JOIN common.tbl_White_labels wl ON p.CasinoID = wl.LabelID
        WHERE 1=1' + @WhereClause;
    
    EXEC sp_executesql @CountSQL, 
        N'@PlayerID BIGINT, @Alias NVARCHAR(500), @WhiteLabelId INT, 
        @StartDate DATETIME, @EndDate DATETIME, @AffiliateId NVARCHAR(10), 
        @Tracker NVARCHAR(500)',
        @PlayerID = @PlayerID,
        @Alias = @Alias,
        @WhiteLabelId = @WhiteLabelId,
        @StartDate = @StartDate,
        @EndDate = @EndDate,
        @AffiliateId = @AffiliateId,
        @Tracker = @Tracker;
END
GO

-- Procedure for Player Games Report
CREATE PROCEDURE [dbo].[sp_GetPlayerGamesReport]
    @PlayerID BIGINT = NULL,
    @WhiteLabelId INT = NULL,
    @StartDate DATETIME = NULL,
    @EndDate DATETIME = NULL,
    @GameProvider NVARCHAR(50) = NULL,
    @GameType NVARCHAR(50) = NULL,
    @Platform NVARCHAR(50) = NULL,
    @PageNumber INT = 1,
    @PageSize INT = 50
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @WhereClause NVARCHAR(MAX) = '';
    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;
    
    -- Build WHERE clause based on parameters
    IF @PlayerID IS NOT NULL
    BEGIN
        SET @WhereClause = @WhereClause + ' AND g.PlayerID = @PlayerID';
    END
    
    IF @WhiteLabelId IS NOT NULL
    BEGIN
        SET @WhereClause = @WhereClause + ' AND p.CasinoID = @WhiteLabelId';
    END
    
    IF @StartDate IS NOT NULL
    BEGIN
        SET @WhereClause = @WhereClause + ' AND g.GameDate >= @StartDate';
    END
    
    IF @EndDate IS NOT NULL
    BEGIN
        SET @WhereClause = @WhereClause + ' AND g.GameDate <= @EndDate';
    END
    
    IF @GameProvider IS NOT NULL AND @GameProvider <> ''
    BEGIN
        SET @WhereClause = @WhereClause + ' AND ga.Provider = @GameProvider';
    END
    
    IF @GameType IS NOT NULL AND @GameType <> ''
    BEGIN
        SET @WhereClause = @WhereClause + ' AND ga.GameType = @GameType';
    END
    
    IF @Platform IS NOT NULL AND @Platform <> ''
    BEGIN
        SET @WhereClause = @WhereClause + ' AND g.Platform = @Platform';
    END
    
    -- Get player games
    DECLARE @SQL NVARCHAR(MAX) = '
        SELECT 
            g.PlayerID,
            p.Alias,
            p.FirstName,
            p.LastName,
            wl.LabelName AS WhiteLabel,
            ga.GameID,
            ga.GameName,
            ga.Provider,
            ga.SubProvider,
            ga.GameType,
            g.GameDate,
            g.Platform,
            g.RealBetAmount,
            g.RealWinAmount,
            g.BonusBetAmount,
            g.BonusWinAmount,
            g.RealBetAmount + g.BonusBetAmount - g.RealWinAmount - g.BonusWinAmount AS NetGamingRevenue,
            g.NumberofRealBets,
            g.NumberofRealWins,
            g.NumberofBonusBets,
            g.NumberofBonusWins,
            g.NumberofSessions
        FROM 
            common.tbl_Daily_actions_games g
        INNER JOIN 
            common.tbl_Daily_actions_players p ON g.PlayerID = p.PlayerID
        INNER JOIN 
            dbo.Games ga ON g.GameID = ga.GameID
        LEFT JOIN 
            common.tbl_White_labels wl ON p.CasinoID = wl.LabelID
        WHERE 
            1=1' + @WhereClause + '
        ORDER BY 
            g.GameDate DESC
        OFFSET @Offset ROWS
        FETCH NEXT @PageSize ROWS ONLY';
    
    EXEC sp_executesql @SQL, 
        N'@PlayerID BIGINT, @WhiteLabelId INT, @StartDate DATETIME, @EndDate DATETIME, 
        @GameProvider NVARCHAR(50), @GameType NVARCHAR(50), @Platform NVARCHAR(50), 
        @Offset INT, @PageSize INT',
        @PlayerID = @PlayerID,
        @WhiteLabelId = @WhiteLabelId,
        @StartDate = @StartDate,
        @EndDate = @EndDate,
        @GameProvider = @GameProvider,
        @GameType = @GameType,
        @Platform = @Platform,
        @Offset = @Offset,
        @PageSize = @PageSize;
        
    -- Get total count for pagination
    DECLARE @CountSQL NVARCHAR(MAX) = '
        SELECT COUNT(*)
        FROM common.tbl_Daily_actions_games g
        INNER JOIN common.tbl_Daily_actions_players p ON g.PlayerID = p.PlayerID
        INNER JOIN dbo.Games ga ON g.GameID = ga.GameID
        LEFT JOIN common.tbl_White_labels wl ON p.CasinoID = wl.LabelID
        WHERE 1=1' + @WhereClause;
    
    EXEC sp_executesql @CountSQL, 
        N'@PlayerID BIGINT, @WhiteLabelId INT, @StartDate DATETIME, @EndDate DATETIME, 
        @GameProvider NVARCHAR(50), @GameType NVARCHAR(50), @Platform NVARCHAR(50)',
        @PlayerID = @PlayerID,
        @WhiteLabelId = @WhiteLabelId,
        @StartDate = @StartDate,
        @EndDate = @EndDate,
        @GameProvider = @GameProvider,
        @GameType = @GameType,
        @Platform = @Platform;
END
GO

-- --------------------------------------------------------
-- 4. Stored Procedures for Dashboard
-- --------------------------------------------------------

-- Procedure for Today Summary Dashboard
CREATE PROCEDURE [dbo].[sp_GetTodaySummaryDashboard]
    @WhiteLabelId INT = NULL,
    @PlayMode NVARCHAR(10) = NULL -- 'Casino', 'Sport', 'Live', 'Bingo', or NULL for all
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Today DATE = CAST(GETDATE() AS DATE);
    DECLARE @Yesterday DATE = DATEADD(DAY, -1, @Today);
    DECLARE @LastMonth DATE = DATEADD(MONTH, -1, @Today);
    
    DECLARE @WhereClause NVARCHAR(MAX) = '';
    
    -- Build WHERE clause based on parameters
    IF @WhiteLabelId IS NOT NULL
    BEGIN
        SET @WhereClause = @WhereClause + ' AND da.WhiteLabelID = @WhiteLabelId';
    END
    
    -- Summary statistics for today
    DECLARE @SQL NVARCHAR(MAX) = '
        SELECT 
            ''Today'' AS Period,
            COUNT(DISTINCT CASE WHEN da.Registration = 1 AND CAST(da.Date AS DATE) = @Today THEN da.PlayerID END) AS Registrations,
            COUNT(DISTINCT CASE WHEN da.FTD = 1 AND CAST(da.Date AS DATE) = @Today THEN da.PlayerID END) AS FTD,
            SUM(CASE WHEN CAST(da.Date AS DATE) = @Today THEN da.Deposits ELSE 0 END) AS Deposits,
            SUM(CASE WHEN CAST(da.Date AS DATE) = @Today THEN da.PaidCashouts ELSE 0 END) AS Cashouts';
            
    -- Add specific play mode metrics if provided
    IF @PlayMode IS NOT NULL
    BEGIN
        CASE @PlayMode
            WHEN 'Casino' THEN 
                SET @SQL = @SQL + ',
                    SUM(CASE WHEN CAST(da.Date AS DATE) = @Today THEN da.BetsCasino ELSE 0 END) AS Bets,
                    SUM(CASE WHEN CAST(da.Date AS DATE) = @Today THEN da.WinsCasino ELSE 0 END) AS Wins,
                    SUM(CASE WHEN CAST(da.Date AS DATE) = @Today THEN (da.BetsCasino - da.WinsCasino) ELSE 0 END) AS Revenue'
            WHEN 'Sport' THEN 
                SET @SQL = @SQL + ',
                    SUM(CASE WHEN CAST(da.Date AS DATE) = @Today THEN da.BetsSport ELSE 0 END) AS Bets,
                    SUM(CASE WHEN CAST(da.Date AS DATE) = @Today THEN da.WinsSport ELSE 0 END) AS Wins,
                    SUM(CASE WHEN CAST(da.Date AS DATE) = @Today THEN (da.BetsSport - da.WinsSport) ELSE 0 END) AS Revenue'
            WHEN 'Live' THEN 
                SET @SQL = @SQL + ',
                    SUM(CASE WHEN CAST(da.Date AS DATE) = @Today THEN da.BetsLive ELSE 0 END) AS Bets,
                    SUM(CASE WHEN CAST(da.Date AS DATE) = @Today THEN da.WinsLive ELSE 0 END) AS Wins,
                    SUM(CASE WHEN CAST(da.Date AS DATE) = @Today THEN (da.BetsLive - da.WinsLive) ELSE 0 END) AS Revenue'
            WHEN 'Bingo' THEN 
                SET @SQL = @SQL + ',
                    SUM(CASE WHEN CAST(da.Date AS DATE) = @Today THEN da.BetsBingo ELSE 0 END) AS Bets,
                    SUM(CASE WHEN CAST(da.Date AS DATE) = @Today THEN da.WinsBingo ELSE 0 END) AS Wins,
                    SUM(CASE WHEN CAST(da.Date AS DATE) = @Today THEN (da.BetsBingo - da.WinsBingo) ELSE 0 END) AS Revenue'
            ELSE
                SET @SQL = @SQL + ',
                    SUM(CASE WHEN CAST(da.Date AS DATE) = @Today THEN 
                        (da.BetsCasino + da.BetsSport + da.BetsLive + da.BetsBingo) ELSE 0 END) AS Bets,
                    SUM(CASE WHEN CAST(da.Date AS DATE) = @Today THEN 
                        (da.WinsCasino + da.WinsSport + da.WinsLive + da.WinsBingo) ELSE 0 END) AS Wins,
                    SUM(CASE WHEN CAST(da.Date AS DATE) = @Today THEN 
                        ((da.BetsCasino - da.WinsCasino) + 
                         (da.BetsSport - da.WinsSport) + 
                         (da.BetsLive - da.WinsLive) + 
                         (da.BetsBingo - da.WinsBingo)) ELSE 0 END) AS Revenue'
        END;
    END
    ELSE
    BEGIN
        -- Default metrics for all play modes
        SET @SQL = @SQL + ',
            SUM(CASE WHEN CAST(da.Date AS DATE) = @Today THEN 
                (da.BetsCasino + da.BetsSport + da.BetsLive + da.BetsBingo) ELSE 0 END) AS Bets,
            SUM(CASE WHEN CAST(da.Date AS DATE) = @Today THEN 
                (da.WinsCasino + da.WinsSport + da.WinsLive + da.WinsBingo) ELSE 0 END) AS Wins,
            SUM(CASE WHEN CAST(da.Date AS DATE) = @Today THEN 
                ((da.BetsCasino - da.WinsCasino) + 
                 (da.BetsSport - da.WinsSport) + 
                 (da.BetsLive - da.WinsLive) + 
                 (da.BetsBingo - da.WinsBingo)) ELSE 0 END) AS Revenue'
    END;
    
    SET @SQL = @SQL + '
        FROM 
            common.tbl_Daily_actions da
        WHERE 
            CAST(da.Date AS DATE) = @Today' + @WhereClause + '
            
        UNION ALL
        
        SELECT 
            ''Yesterday'' AS Period,
            COUNT(DISTINCT CASE WHEN da.Registration = 1 AND CAST(da.Date AS DATE) = @Yesterday THEN da.PlayerID END) AS Registrations,
            COUNT(DISTINCT CASE WHEN da.FTD = 1 AND CAST(da.Date AS DATE) = @Yesterday THEN da.PlayerID END) AS FTD,
            SUM(CASE WHEN CAST(da.Date AS DATE) = @Yesterday THEN da.Deposits ELSE 0 END) AS Deposits,
            SUM(CASE WHEN CAST(da.Date AS DATE) = @Yesterday THEN da.PaidCashouts ELSE 0 END) AS Cashouts';
            
    -- Add specific play mode metrics for Yesterday
    IF @PlayMode IS NOT NULL
    BEGIN
        CASE @PlayMode
            WHEN 'Casino' THEN 
                SET @SQL = @SQL + ',
                    SUM(CASE WHEN CAST(da.Date AS DATE) = @Yesterday THEN da.BetsCasino ELSE 0 END) AS Bets,
                    SUM(CASE WHEN CAST(da.Date AS DATE) = @Yesterday THEN da.WinsCasino ELSE 0 END) AS Wins,
                    SUM(CASE WHEN CAST(da.Date AS DATE) = @Yesterday THEN (da.BetsCasino - da.WinsCasino) ELSE 0 END) AS Revenue'
            WHEN 'Sport' THEN 
                SET @SQL = @SQL + ',
                    SUM(CASE WHEN CAST(da.Date AS DATE) = @Yesterday THEN da.BetsSport ELSE 0 END) AS Bets,
                    SUM(CASE WHEN CAST(da.Date AS DATE) = @Yesterday THEN da.WinsSport ELSE 0 END) AS Wins,
                    SUM(CASE WHEN CAST(da.Date AS DATE) = @Yesterday THEN (da.BetsSport - da.WinsSport) ELSE 0 END) AS Revenue'
            WHEN 'Live' THEN 
                SET @SQL = @SQL + ',
                    SUM(CASE WHEN CAST(da.Date AS DATE) = @Yesterday THEN da.BetsLive ELSE 0 END) AS Bets,
                    SUM(CASE WHEN CAST(da.Date AS DATE) = @Yesterday THEN da.WinsLive ELSE 0 END) AS Wins,
                    SUM(CASE WHEN CAST(da.Date AS DATE) = @Yesterday THEN (da.BetsLive - da.WinsLive) ELSE 0 END) AS Revenue'
            WHEN 'Bingo' THEN 
                SET @SQL = @SQL + ',
                    SUM(CASE WHEN CAST(da.Date AS DATE) = @Yesterday THEN da.BetsBingo ELSE 0 END) AS Bets,
                    SUM(CASE WHEN CAST(da.Date AS DATE) = @Yesterday THEN da.WinsBingo ELSE 0 END) AS Wins,
                    SUM(CASE WHEN CAST(da.Date AS DATE) = @Yesterday THEN (da.BetsBingo - da.WinsBingo) ELSE 0 END) AS Revenue'
            ELSE
                SET @SQL = @SQL + ',
                    SUM(CASE WHEN CAST(da.Date AS DATE) = @Yesterday THEN 
                        (da.BetsCasino + da.BetsSport + da.BetsLive + da.BetsBingo) ELSE 0 END) AS Bets,
                    SUM(CASE WHEN CAST(da.Date AS DATE) = @Yesterday THEN 
                        (da.WinsCasino + da.WinsSport + da.WinsLive + da.WinsBingo) ELSE 0 END) AS Wins,
                    SUM(CASE WHEN CAST(da.Date AS DATE) = @Yesterday THEN 
                        ((da.BetsCasino - da.WinsCasino) + 
                         (da.BetsSport - da.WinsSport) + 
                         (da.BetsLive - da.WinsLive) + 
                         (da.BetsBingo - da.WinsBingo)) ELSE 0 END) AS Revenue'
        END;
    END
    ELSE
    BEGIN
        -- Default metrics for all play modes
        SET @SQL = @SQL + ',
            SUM(CASE WHEN CAST(da.Date AS DATE) = @Yesterday THEN 
                (da.BetsCasino + da.BetsSport + da.BetsLive + da.BetsBingo) ELSE 0 END) AS Bets,
            SUM(CASE WHEN CAST(da.Date AS DATE) = @Yesterday THEN 
                (da.WinsCasino + da.WinsSport + da.WinsLive + da.WinsBingo) ELSE 0 END) AS Wins,
            SUM(CASE WHEN CAST(da.Date AS DATE) = @Yesterday THEN 
                ((da.BetsCasino - da.WinsCasino) + 
                 (da.BetsSport - da.WinsSport) + 
                 (da.BetsLive - da.WinsLive) + 
                 (da.BetsBingo - da.WinsBingo)) ELSE 0 END) AS Revenue'
    END;
    
    SET @SQL = @SQL + '
        FROM 
            common.tbl_Daily_actions da
        WHERE 
            CAST(da.Date AS DATE) = @Yesterday' + @WhereClause + '
            
        UNION ALL
        
        SELECT 
            ''Last Month'' AS Period,
            COUNT(DISTINCT CASE WHEN da.Registration = 1 AND CAST(da.Date AS DATE) >= @LastMonth AND CAST(da.Date AS DATE) < @Today THEN da.PlayerID END) AS Registrations,
            COUNT(DISTINCT CASE WHEN da.FTD = 1 AND CAST(da.Date AS DATE) >= @LastMonth AND CAST(da.Date AS DATE) < @Today THEN da.PlayerID END) AS FTD,
            SUM(CASE WHEN CAST(da.Date AS DATE) >= @LastMonth AND CAST(da.Date AS DATE) < @Today THEN da.Deposits ELSE 0 END) AS Deposits,
            SUM(CASE WHEN CAST(da.Date AS DATE) >= @LastMonth AND CAST(da.Date AS DATE) < @Today THEN da.PaidCashouts ELSE 0 END) AS Cashouts';
            
    -- Add specific play mode metrics for Last Month
    IF @PlayMode IS NOT NULL
    BEGIN
        CASE @PlayMode
            WHEN 'Casino' THEN 
                SET @SQL = @SQL + ',
                    SUM(CASE WHEN CAST(da.Date AS DATE) >= @LastMonth AND CAST(da.Date AS DATE) < @Today THEN da.BetsCasino ELSE 0 END) AS Bets,
                    SUM(CASE WHEN CAST(da.Date AS DATE) >= @LastMonth AND CAST(da.Date AS DATE) < @Today THEN da.WinsCasino ELSE 0 END) AS Wins,
                    SUM(CASE WHEN CAST(da.Date AS DATE) >= @LastMonth AND CAST(da.Date AS DATE) < @Today THEN (da.BetsCasino - da.WinsCasino) ELSE 0 END) AS Revenue'
            WHEN 'Sport' THEN 
                SET @SQL = @SQL + ',
                    SUM(CASE WHEN CAST(da.Date AS DATE) >= @LastMonth AND CAST(da.Date AS DATE) < @Today THEN da.BetsSport ELSE 0 END) AS Bets,
                    SUM(CASE WHEN CAST(da.Date AS DATE) >= @LastMonth AND CAST(da.Date AS DATE) < @Today THEN da.WinsSport ELSE 0 END) AS Wins,
                    SUM(CASE WHEN CAST(da.Date AS DATE) >= @LastMonth AND CAST(da.Date AS DATE) < @Today THEN (da.BetsSport - da.WinsSport) ELSE 0 END) AS Revenue'
            WHEN 'Live' THEN 
                SET @SQL = @SQL + ',
                    SUM(CASE WHEN CAST(da.Date AS DATE) >= @LastMonth AND CAST(da.Date AS DATE) < @Today THEN da.BetsLive ELSE 0 END) AS Bets,
                    SUM(CASE WHEN CAST(da.Date AS DATE) >= @LastMonth AND CAST(da.Date AS DATE) < @Today THEN da.WinsLive ELSE 0 END) AS Wins,
                    SUM(CASE WHEN CAST(da.Date AS DATE) >= @LastMonth AND CAST(da.Date AS DATE) < @Today THEN (da.BetsLive - da.WinsLive) ELSE 0 END) AS Revenue'
            WHEN 'Bingo' THEN 
                SET @SQL = @SQL + ',
                    SUM(CASE WHEN CAST(da.Date AS DATE) >= @LastMonth AND CAST(da.Date AS DATE) < @Today THEN da.BetsBingo ELSE 0 END) AS Bets,
                    SUM(CASE WHEN CAST(da.Date AS DATE) >= @LastMonth AND CAST(da.Date AS DATE) < @Today THEN da.WinsBingo ELSE 0 END) AS Wins,
                    SUM(CASE WHEN CAST(da.Date AS DATE) >= @LastMonth AND CAST(da.Date AS DATE) < @Today THEN (da.BetsBingo - da.WinsBingo) ELSE 0 END) AS Revenue'
            ELSE
                SET @SQL = @SQL + ',
                    SUM(CASE WHEN CAST(da.Date AS DATE) >= @LastMonth AND CAST(da.Date AS DATE) < @Today THEN 
                        (da.BetsCasino + da.BetsSport + da.BetsLive + da.BetsBingo) ELSE 0 END) AS Bets,
                    SUM(CASE WHEN CAST(da.Date AS DATE) >= @LastMonth AND CAST(da.Date AS DATE) < @Today THEN 
                        (da.WinsCasino + da.WinsSport + da.WinsLive + da.WinsBingo) ELSE 0 END) AS Wins,
                    SUM(CASE WHEN CAST(da.Date AS DATE) >= @LastMonth AND CAST(da.Date AS DATE) < @Today THEN 
                        ((da.BetsCasino - da.WinsCasino) + 
                         (da.BetsSport - da.WinsSport) + 
                         (da.BetsLive - da.WinsLive) + 
                         (da.BetsBingo - da.WinsBingo)) ELSE 0 END) AS Revenue'
        END;
    END
    ELSE
    BEGIN
        -- Default metrics for all play modes
        SET @SQL = @SQL + ',
            SUM(CASE WHEN CAST(da.Date AS DATE) >= @LastMonth AND CAST(da.Date AS DATE) < @Today THEN 
                (da.BetsCasino + da.BetsSport + da.BetsLive + da.BetsBingo) ELSE 0 END) AS Bets,
            SUM(CASE WHEN CAST(da.Date AS DATE) >= @LastMonth AND CAST(da.Date AS DATE) < @Today THEN 
                (da.WinsCasino + da.WinsSport + da.WinsLive + da.WinsBingo) ELSE 0 END) AS Wins,
            SUM(CASE WHEN CAST(da.Date AS DATE) >= @LastMonth AND CAST(da.Date AS DATE) < @Today THEN 
                ((da.BetsCasino - da.WinsCasino) + 
                 (da.BetsSport - da.WinsSport) + 
                 (da.BetsLive - da.WinsLive) + 
                 (da.BetsBingo - da.WinsBingo)) ELSE 0 END) AS Revenue'
    END;
    
    SET @SQL = @SQL + '
        FROM 
            common.tbl_Daily_actions da
        WHERE 
            CAST(da.Date AS DATE) >= @LastMonth AND CAST(da.Date AS DATE) < @Today' + @WhereClause;
    
    EXEC sp_executesql @SQL, 
        N'@Today DATE, @Yesterday DATE, @LastMonth DATE, @WhiteLabelId INT',
        @Today = @Today,
        @Yesterday = @Yesterday,
        @LastMonth = @LastMonth,
        @WhiteLabelId = @WhiteLabelId;
    
    -- Get top games revenue
    DECLARE @TopGamesSQL NVARCHAR(MAX) = '
        SELECT TOP 10
            g.GameID,
            ga.GameName,
            ga.Provider,
            ga.GameType,
            SUM(g.RealBetAmount + g.BonusBetAmount) AS TotalBets,
            SUM(g.RealWinAmount + g.BonusWinAmount) AS TotalWins,
            SUM(g.RealBetAmount + g.BonusBetAmount - g.RealWinAmount - g.BonusWinAmount) AS GGR
        FROM 
            common.tbl_Daily_actions_games g
        INNER JOIN 
            dbo.Games ga ON g.GameID = ga.GameID
        INNER JOIN 
            common.tbl_Daily_actions_players p ON g.PlayerID = p.PlayerID
        WHERE 
            CAST(g.GameDate AS DATE) = @Today';
            
    -- Add specific play mode filter if provided
    IF @PlayMode IS NOT NULL AND @PlayMode = 'Casino'
    BEGIN
        SET @TopGamesSQL = @TopGamesSQL + ' AND ga.GameType IN (''Slots'', ''Table Games'', ''Casual Games'', ''Jackpots'', ''Featured'')';
    END
    ELSE IF @PlayMode IS NOT NULL AND @PlayMode = 'Live'
    BEGIN
        SET @TopGamesSQL = @TopGamesSQL + ' AND ga.GameType = ''Live''';
    END
    ELSE IF @PlayMode IS NOT NULL AND @PlayMode = 'Sport'
    BEGIN
        SET @TopGamesSQL = @TopGamesSQL + ' AND ga.GameType = ''Sport''';
    END
    ELSE IF @PlayMode IS NOT NULL AND @PlayMode = 'Bingo'
    BEGIN
        SET @TopGamesSQL = @TopGamesSQL + ' AND ga.GameType = ''Bingo''';
    END
    
    -- Add WhiteLabel filter if provided
    IF @WhiteLabelId IS NOT NULL
    BEGIN
        SET @TopGamesSQL = @TopGamesSQL + ' AND p.CasinoID = @WhiteLabelId';
    END
    
    SET @TopGamesSQL = @TopGamesSQL + '
        GROUP BY 
            g.GameID, ga.GameName, ga.Provider, ga.GameType
        ORDER BY 
            GGR DESC';
    
    EXEC sp_executesql @TopGamesSQL, 
        N'@Today DATE, @WhiteLabelId INT',
        @Today = @Today,
        @WhiteLabelId = @WhiteLabelId;
    
    -- Get recent transactions
    DECLARE @TransactionsSQL NVARCHAR(MAX) = '
        SELECT TOP 20
            t.TransactionID,
            t.PlayerID,
            p.Alias,
            wl.LabelName AS WhiteLabel,
            t.TransactionDate,
            t.TransactionType,
            t.TransactionAmount,
            t.CurrencyCode,
            t.Status,
            t.Platform,
            t.PaymentMethod
        FROM 
            common.tbl_Daily_actions_transactions t
        INNER JOIN 
            common.tbl_Daily_actions_players p ON t.PlayerID = p.PlayerID
        LEFT JOIN 
            common.tbl_White_labels wl ON p.CasinoID = wl.LabelID
        WHERE 
            CAST(t.TransactionDate AS DATE) = @Today';
            
    -- Add specific transaction type filter based on play mode
    IF @PlayMode IS NOT NULL
    BEGIN
        CASE @PlayMode
            WHEN 'Casino' THEN 
                SET @TransactionsSQL = @TransactionsSQL + ' AND t.TransactionSubDetails LIKE ''%Casino%''';
            WHEN 'Sport' THEN 
                SET @TransactionsSQL = @TransactionsSQL + ' AND t.TransactionSubDetails LIKE ''%Sport%''';
            WHEN 'Live' THEN 
                SET @TransactionsSQL = @TransactionsSQL + ' AND t.TransactionSubDetails LIKE ''%Live%''';
            WHEN 'Bingo' THEN 
                SET @TransactionsSQL = @TransactionsSQL + ' AND t.TransactionSubDetails LIKE ''%Bingo%''';
        END;
    END
    
    -- Add WhiteLabel filter if provided
    IF @WhiteLabelId IS NOT NULL
    BEGIN
        SET @TransactionsSQL = @TransactionsSQL + ' AND p.CasinoID = @WhiteLabelId';
    END
    
    SET @TransactionsSQL = @TransactionsSQL + '
        ORDER BY 
            t.TransactionDate DESC';
    
    EXEC sp_executesql @TransactionsSQL, 
        N'@Today DATE, @WhiteLabelId INT',
        @Today = @Today,
        @WhiteLabelId = @WhiteLabelId;
END
GO

-- --------------------------------------------------------
-- 5. Additional Stored Procedures for Specific Reports
-- --------------------------------------------------------

-- Procedure for Transactions Report
CREATE PROCEDURE [dbo].[sp_GetTransactionsReport]
    @StartDate DATETIME = NULL,
    @EndDate DATETIME = NULL,
    @WhiteLabelId INT = NULL,
    @PlayerID BIGINT = NULL,
    @TransactionType NVARCHAR(100) = NULL,
    @PaymentMethod NVARCHAR(500) = NULL,
    @Status NVARCHAR(25) = NULL,
    @MinAmount MONEY = NULL,
    @MaxAmount MONEY = NULL,
    @PageNumber INT = 1,
    @PageSize INT = 50
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @WhereClause NVARCHAR(MAX) = '';
    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;
    
    -- Build WHERE clause based on parameters
    IF @StartDate IS NOT NULL
    BEGIN
        SET @WhereClause = @WhereClause + ' AND t.TransactionDate >= @StartDate';
    END
    
    IF @EndDate IS NOT NULL
    BEGIN
        SET @WhereClause = @WhereClause + ' AND t.TransactionDate <= @EndDate';
    END
    
    IF @WhiteLabelId IS NOT NULL
    BEGIN
        SET @WhereClause = @WhereClause + ' AND p.CasinoID = @WhiteLabelId';
    END
    
    IF @PlayerID IS NOT NULL
    BEGIN
        SET @WhereClause = @WhereClause + ' AND t.PlayerID = @PlayerID';
    END
    
    IF @TransactionType IS NOT NULL AND @TransactionType <> ''
    BEGIN
        SET @WhereClause = @WhereClause + ' AND t.TransactionType = @TransactionType';
    END
    
    IF @PaymentMethod IS NOT NULL AND @PaymentMethod <> ''
    BEGIN
        SET @WhereClause = @WhereClause + ' AND t.PaymentMethod = @PaymentMethod';
    END
    
    IF @Status IS NOT NULL AND @Status <> ''
    BEGIN
        SET @WhereClause = @WhereClause + ' AND t.Status = @Status';
    END
    
    IF @MinAmount IS NOT NULL
    BEGIN
        SET @WhereClause = @WhereClause + ' AND t.TransactionAmount >= @MinAmount';
    END
    
    IF @MaxAmount IS NOT NULL
    BEGIN
        SET @WhereClause = @WhereClause + ' AND t.TransactionAmount <= @MaxAmount';
    END
    
    -- Get transactions
    DECLARE @SQL NVARCHAR(MAX) = '
        SELECT 
            t.TransactionID,
            t.PlayerID,
            p.Alias,
            p.FirstName,
            p.LastName,
            wl.LabelName AS WhiteLabel,
            t.TransactionDate,
            t.TransactionType,
            t.TransactionAmount,
            t.TransactionOriginalAmount,
            t.CurrencyCode,
            p.CurrencySymbol,
            t.Status,
            t.Platform,
            t.PaymentMethod,
            t.PaymentProvider,
            t.TransactionDetails,
            t.TransactionSubDetails,
            t.TransactionComments,
            t.OriginalTransactionID,
            p.AffiliateID,
            p.DynamicParameter AS Tracker
        FROM 
            common.tbl_Daily_actions_transactions t
        INNER JOIN 
            common.tbl_Daily_actions_players p ON t.PlayerID = p.PlayerID
        LEFT JOIN 
            common.tbl_White_labels wl ON p.CasinoID = wl.LabelID
        WHERE 
            1=1' + @WhereClause + '
        ORDER BY 
            t.TransactionDate DESC
        OFFSET @Offset ROWS
        FETCH NEXT @PageSize ROWS ONLY';
    
    EXEC sp_executesql @SQL, 
        N'@StartDate DATETIME, @EndDate DATETIME, @WhiteLabelId INT, 
        @PlayerID BIGINT, @TransactionType NVARCHAR(100), @PaymentMethod NVARCHAR(500), 
        @Status NVARCHAR(25), @MinAmount MONEY, @MaxAmount MONEY, 
        @Offset INT, @PageSize INT',
        @StartDate = @StartDate,
        @EndDate = @EndDate,
        @WhiteLabelId = @WhiteLabelId,
        @PlayerID = @PlayerID,
        @TransactionType = @TransactionType,
        @PaymentMethod = @PaymentMethod,
        @Status = @Status,
        @MinAmount = @MinAmount,
        @MaxAmount = @MaxAmount,
        @Offset = @Offset,
        @PageSize = @PageSize;
        
    -- Get total count for pagination
    DECLARE @CountSQL NVARCHAR(MAX) = '
        SELECT COUNT(*)
        FROM common.tbl_Daily_actions_transactions t
        INNER JOIN common.tbl_Daily_actions_players p ON t.PlayerID = p.PlayerID
        LEFT JOIN common.tbl_White_labels wl ON p.CasinoID = wl.LabelID
        WHERE 1=1' + @WhereClause;
    
    EXEC sp_executesql @CountSQL, 
        N'@StartDate DATETIME, @EndDate DATETIME, @WhiteLabelId INT, 
        @PlayerID BIGINT, @TransactionType NVARCHAR(100), @PaymentMethod NVARCHAR(500), 
        @Status NVARCHAR(25), @MinAmount MONEY, @MaxAmount MONEY',
        @StartDate = @StartDate,
        @EndDate = @EndDate,
        @WhiteLabelId = @WhiteLabelId,
        @PlayerID = @PlayerID,
        @TransactionType = @TransactionType,
        @PaymentMethod = @PaymentMethod,
        @Status = @Status,
        @MinAmount = @MinAmount,
        @MaxAmount = @MaxAmount;
END
GO

-- Procedure for Bonuses Report
CREATE PROCEDURE [dbo].[sp_GetBonusesReport]
    @StartDate DATETIME = NULL,
    @EndDate DATETIME = NULL,
    @WhiteLabelId INT = NULL,
    @PlayerID BIGINT = NULL,
    @BonusType NVARCHAR(50) = NULL,
    @BonusStatus NVARCHAR(50) = NULL,
    @BonusCategory NVARCHAR(10) = NULL, -- 'Casino' or 'Sport'
    @PageNumber INT = 1,
    @PageSize INT = 50
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @WhereClause NVARCHAR(MAX) = '';
    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;
    
    -- Build WHERE clause based on parameters
    IF @StartDate IS NOT NULL
    BEGIN
        SET @WhereClause = @WhereClause + ' AND bb.CreationDate >= @StartDate';
    END
    
    IF @EndDate IS NOT NULL
    BEGIN
        SET @WhereClause = @WhereClause + ' AND bb.CreationDate <= @EndDate';
    END
    
    IF @WhiteLabelId IS NOT NULL
    BEGIN
        SET @WhereClause = @WhereClause + ' AND p.CasinoID = @WhiteLabelId';
    END
    
    IF @PlayerID IS NOT NULL
    BEGIN
        SET @WhereClause = @WhereClause + ' AND bb.PlayerID = @PlayerID';
    END
    
    IF @BonusType IS NOT NULL AND @BonusType <> ''
    BEGIN
        SET @WhereClause = @WhereClause + ' AND b.BonusType = @BonusType';
    END
    
    IF @BonusStatus IS NOT NULL AND @BonusStatus <> ''
    BEGIN
        SET @WhereClause = @WhereClause + ' AND bb.Status = @BonusStatus';
    END
    
    IF @BonusCategory IS NOT NULL AND @BonusCategory <> ''
    BEGIN
        IF @BonusCategory = 'Sport'
            SET @WhereClause = @WhereClause + ' AND bb.IsSportBonus = 1';
        ELSE IF @BonusCategory = 'Casino'
            SET @WhereClause = @WhereClause + ' AND (bb.IsSportBonus = 0 OR bb.IsSportBonus IS NULL)';
    END
    
    -- Get bonuses
    DECLARE @SQL NVARCHAR(MAX) = '
        SELECT 
            bb.BonusBalanceID,
            bb.PlayerID,
            p.Alias,
            p.FirstName,
            p.LastName,
            wl.LabelName AS WhiteLabel,
            b.BonusID,
            b.BonusName,
            b.InternalName,
            b.BonusType,
            CASE WHEN b.IsSportBonus = 1 THEN ''Sport'' ELSE ''Casino'' END AS BonusCategory,
            bb.Amount,
            bb.Balance,
            bb.WagerLeft,
            bb.OriginalDepositAmount,
            bb.MaxCashableWinnings,
            bb.AmountConverted,
            CASE WHEN bb.IsSportBonus = 1 THEN ''Sport'' ELSE ''Casino'' END AS BonusBalanceCategory,
            bb.Status,
            bb.CreationDate,
            bb.UpdatedDate,
            bb.FreeSpinsOffer,
            bb.FreeSpinsAmount,
            bb.FreeSpinsLeft,
            bb.DepositCode,
            cu.CurrencyCode,
            cu.CurrencySymbol,
            p.AffiliateID,
            p.DynamicParameter AS Tracker
        FROM 
            common.tbl_Bonus_balances bb
        INNER JOIN 
            common.tbl_Daily_actions_players p ON bb.PlayerID = p.PlayerID
        LEFT JOIN 
            common.tbl_Bonuses b ON bb.BonusID = b.BonusID
        LEFT JOIN 
            common.tbl_Currencies cu ON bb.CurrencyID = cu.CurrencyID
        LEFT JOIN 
            common.tbl_White_labels wl ON p.CasinoID = wl.LabelID
        WHERE 
            1=1' + @WhereClause + '
        ORDER BY 
            bb.CreationDate DESC
        OFFSET @Offset ROWS
        FETCH NEXT @PageSize ROWS ONLY';
    
    EXEC sp_executesql @SQL, 
        N'@StartDate DATETIME, @EndDate DATETIME, @WhiteLabelId INT, 
        @PlayerID BIGINT, @BonusType NVARCHAR(50), @BonusStatus NVARCHAR(50), 
        @BonusCategory NVARCHAR(10), @Offset INT, @PageSize INT',
        @StartDate = @StartDate,
        @EndDate = @EndDate,
        @WhiteLabelId = @WhiteLabelId,
        @PlayerID = @PlayerID,
        @BonusType = @BonusType,
        @BonusStatus = @BonusStatus,
        @BonusCategory = @BonusCategory,
        @Offset = @Offset,
        @PageSize = @PageSize;
        
    -- Get total count for pagination
    DECLARE @CountSQL NVARCHAR(MAX) = '
        SELECT COUNT(*)
        FROM common.tbl_Bonus_balances bb
        INNER JOIN common.tbl_Daily_actions_players p ON bb.PlayerID = p.PlayerID
        LEFT JOIN common.tbl_Bonuses b ON bb.BonusID = b.BonusID
        LEFT JOIN common.tbl_Currencies cu ON bb.CurrencyID = cu.CurrencyID
        LEFT JOIN common.tbl_White_labels wl ON p.CasinoID = wl.LabelID
        WHERE 1=1' + @WhereClause;
    
    EXEC sp_executesql @CountSQL, 
        N'@StartDate DATETIME, @EndDate DATETIME, @WhiteLabelId INT, 
        @PlayerID BIGINT, @BonusType NVARCHAR(50), @BonusStatus NVARCHAR(50), 
        @BonusCategory NVARCHAR(10)',
        @StartDate = @StartDate,
        @EndDate = @EndDate,
        @WhiteLabelId = @WhiteLabelId,
        @PlayerID = @PlayerID,
        @BonusType = @BonusType,
        @BonusStatus = @BonusStatus,
        @BonusCategory = @BonusCategory;
END
GO
