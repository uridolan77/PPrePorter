
/****** Object:  Schema [common]    Script Date: 5/5/2025 10:40:23 AM ******/
CREATE SCHEMA [common]
GO
/****** Object:  Table [common].[tbl_Daily_actions_players]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [common].[tbl_Daily_actions_players](
	[PlayerID] [bigint] NOT NULL,
	[CasinoName] [nvarchar](50) NULL,
	[Alias] [nvarchar](500) NULL,
	[RegisteredDate] [datetime] NULL,
	[FirstDepositDate] [datetime] NULL,
	[DateOfBirth] [date] NULL,
	[Gender] [nvarchar](10) NULL,
	[Country] [nvarchar](50) NULL,
	[Currency] [nvarchar](10) NULL,
	[Balance] [money] NULL,
	[OriginalBalance] [money] NULL,
	[AffiliateID] [nvarchar](10) NULL,
	[Language] [nvarchar](10) NULL,
	[RegisteredPlatform] [nvarchar](10) NULL,
	[Email] [nvarchar](256) NULL,
	[IsOptIn] [bit] NULL,
	[IsBlocked] [bit] NULL,
	[IsTest] [bit] NULL,
	[LastLoginDate] [datetime] NULL,
	[VIPLevel] [nvarchar](10) NULL,
	[LastUpdated] [datetime] NULL,
	[TotalDeposits] [money] NULL,
	[TotalWithdrawals] [money] NULL,
	[FirstName] [nvarchar](64) NULL,
	[LastName] [nvarchar](64) NULL,
	[DynamicParameter] [varchar](500) NULL,
	[ClickId] [nvarchar](500) NULL,
	[CountryCode] [varchar](5) NULL,
	[PhoneNumber] [varchar](64) NULL,
	[MobileNumber] [varchar](64) NULL,
	[City] [nvarchar](64) NULL,
	[Address] [nvarchar](256) NULL,
	[ZipCode] [nvarchar](50) NULL,
	[DocumentsStatus] [nvarchar](50) NULL,
	[PlatformString] [varchar](100) NULL,
	[SMSEnabled] [bit] NULL,
	[MailEnabled] [bit] NULL,
	[PromotionsEnabled] [bit] NULL,
	[BonusesEnabled] [bit] NULL,
	[IP] [varchar](50) NULL,
	[PromotionCode] [nvarchar](100) NULL,
	[LoggedIn] [bit] NULL,
	[Status] [varchar](50) NULL,
	[BlockDate] [datetime] NULL,
	[BlockReason] [nvarchar](1000) NULL,
	[BlockReleaseDate] [datetime] NULL,
	[BOAgent] [nvarchar](50) NULL,
	[LastDepositDate] [datetime] NULL,
	[DepositsCount] [int] NULL,
	[WelcomeBonus] [nvarchar](500) NULL,
	[BlockType] [nvarchar](50) NULL,
	[AccountBalance] [money] NULL,
	[BonusBalance] [money] NULL,
	[CustomerClubPoints] [decimal](10, 2) NULL,
	[TotalChargeBacks] [money] NULL,
	[TotalChargebackReverses] [money] NULL,
	[TotalVoids] [money] NULL,
	[TotalBonuses] [money] NULL,
	[TotalCustomerClubPoints] [decimal](10, 2) NULL,
	[MaxBalance] [money] NULL,
	[Ranking] [smallint] NULL,
	[Wagered] [money] NULL,
	[CasinoID] [int] NULL,
	[CurrencySymbol] [nvarchar](5) NULL,
	[RevenueEUR] [money] NULL,
	[LastLoginPlatform] [nvarchar](500) NULL,
	[PromotionsMailEnabled] [bit] NULL,
	[PromotionsSMSEnabled] [bit] NULL,
	[PromotionsPhoneEnabled] [bit] NULL,
	[PromotionsPostEnabled] [bit] NULL,
	[PromotionsPartnerEnabled] [bit] NULL,
	[WelcomeBonusCode] [nvarchar](500) NULL,
	[WelcomeBonusDesc] [nvarchar](500) NULL,
	[WelcomeBonusSport] [nvarchar](500) NULL,
	[WelcomeBonusSportCode] [nvarchar](500) NULL,
	[WelcomeBonusSportDesc] [nvarchar](500) NULL,
	[RegistrationPlayMode] [nvarchar](10) NULL,
	[TotalBetsCasino] [money] NULL,
	[TotalBetsSport] [money] NULL,
	[DepositsCountCasino] [int] NULL,
	[DepositsCountSport] [int] NULL,
	[FirstDepositMethod] [nvarchar](50) NULL,
	[LastDepositMethod] [nvarchar](50) NULL,
	[FirstBonusID] [int] NULL,
	[LastBonusID] [int] NULL,
	[BonusBalanceSport] [money] NULL,
	[PushEnabled] [bit] NULL,
	[PromotionsPushEnabled] [bit] NULL,
	[LastUpdate] [datetime] NULL,
	[FullMobileNumber] [varchar](64) NULL,
	[CountryID] [int] NULL,
	[JurisdictionID] [int] NULL,
	[Locale] [nvarchar](10) NULL,
	[IsActivated] [bit] NULL,
	[AffordabilityAttempts] [nvarchar](50) NULL,
	[AffordabilityTreshold] [money] NULL,
	[AffordabilityBalance] [money] NULL,
	[AffordabilityStatus] [nvarchar](50) NULL,
	[AffordabilityIncomeRangeChoice] [money] NULL,
	[AffordabilityLastUpdate] [datetime] NULL,
	[WinningsRestriction] [money] NULL,
	[CurrentWinnings] [money] NULL,
	[WinningsRestrictionFailedDate] [datetime] NULL,
	[PendingWithdrawals] [money] NULL,
	[Occupation] [nvarchar](100) NULL,
	[FTDAmount] [money] NULL,
	[FTDSettlementCompanyID] [int] NULL,
	[Age] [int] NULL,
	[OccupationID] [int] NULL,
	[OccupationYearlyIncome] [money] NULL,
	[DepositsCountLive] [int] NULL,
	[DepositsCountBingo] [int] NULL,
	[TotalBetsLive] [money] NULL,
	[TotalBetsBingo] [money] NULL,
	[PromotionalCasinoEmailEnabled] [bit] NULL,
	[PromotionalCasinoSMSEnabled] [bit] NULL,
	[PromotionalBingoEmailEnabled] [bit] NULL,
	[PromotionalBingoSMSEnabled] [bit] NULL,
	[PromotionalSportsEmailEnabled] [bit] NULL,
	[PromotionalSportsSMSEnabled] [bit] NULL,
	[PromotionalPushEnabled] [bit] NULL,
	[PromotionalPhoneEnabled] [bit] NULL,
	[PromotionalPostEnabled] [bit] NULL,
	[PromotionalPartnerEnabled] [bit] NULL,
 CONSTRAINT [PK_tbl_Daily_actions_players] PRIMARY KEY CLUSTERED 
(
	[PlayerID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Games]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Games](
	[GameID] [int] NOT NULL,
	[GameName] [varchar](50) NOT NULL,
	[Provider] [nvarchar](50) NOT NULL,
	[SubProvider] [nvarchar](50) NULL,
	[GameType] [nvarchar](50) NOT NULL,
	[GameFilters] [nvarchar](250) NULL,
	[GameOrder] [int] NOT NULL,
	[IsActive] [bit] NOT NULL,
	[DemoEnabled] [bit] NULL,
	[WagerPercent] [float] NULL,
	[JackpotContribution] [float] NULL,
	[PayoutLow] [float] NULL,
	[PayoutHigh] [float] NULL,
	[Volatility] [varchar](50) NULL,
	[UKCompliant] [bit] NULL,
	[IsDesktop] [bit] NULL,
	[ServerGameID] [varchar](50) NULL,
	[ProviderTitle] [varchar](100) NULL,
	[IsMobile] [bit] NULL,
	[MobileServerGameID] [varchar](50) NULL,
	[MobileProviderTitle] [varchar](100) NULL,
	[CreatedDate] [datetime] NULL,
	[ReleaseDate] [datetime] NULL,
	[UpdatedDate] [datetime] NULL,
	[HideInLobby] [bit] NULL,
	[ExcludedCountries] [nvarchar](1000) NULL,
	[ExcludedJurisdictions] [nvarchar](1000) NULL,
 CONSTRAINT [PK_Games] PRIMARY KEY CLUSTERED 
(
	[GameID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[BigWinners]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[BigWinners](
	[PlayerID] [bigint] NULL,
	[GameID] [int] NULL,
	[Amount] [money] NULL,
	[Date] [datetime] NULL,
	[TransactionID] [bigint] NOT NULL,
 CONSTRAINT [PK_TransactionID] PRIMARY KEY NONCLUSTERED 
(
	[TransactionID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  View [dbo].[V_BigWinners]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[V_BigWinners]
AS
SELECT        bw.TransactionID, bw.PlayerID, p.FirstName + ' ' + LEFT(p.LastName, 1) + '.' AS PlayerName, p.Country, p.Currency, g.GameType, g.GameName, g.GameID, g.ServerGameID, bw.Amount, 
                         p.CurrencySymbol + CAST(CONVERT(varchar(12), bw.Amount, 1) AS nvarchar(50)) AS AmountInCurrency, bw.Date AS ActionDate, p.CasinoID AS WhiteLabelID
FROM            dbo.BigWinners AS bw INNER JOIN
                         common.tbl_Daily_actions_players AS p WITH (NOLOCK) ON p.PlayerID = bw.PlayerID INNER JOIN
                         dbo.Games AS g WITH (NOLOCK) ON g.GameID = bw.GameID
GO
/****** Object:  View [common].[vew_Daily_actions_players]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
/****** Script for SelectTopNRows command from SSMS  ******/
CREATE VIEW [common].[vew_Daily_actions_players]
AS
SELECT        PlayerID, CasinoName, Alias, RegisteredDate, FirstDepositDate, DateOfBirth, Gender, Country, Currency, Balance, OriginalBalance, AffiliateID, Language, RegisteredPlatform, IsOptIn, IsBlocked, IsTest, LastLoginDate, VIPLevel, 
                         LastUpdated, TotalDeposits, TotalWithdrawals, FirstName, LastName, DynamicParameter, ClickId, CountryCode, DocumentsStatus, PlatformString, SMSEnabled, MailEnabled, PromotionsEnabled, BonusesEnabled, IP, 
                         PromotionCode, LoggedIn, Status, BlockDate, BlockReason, BlockReleaseDate, BOAgent, LastDepositDate, DepositsCount, WelcomeBonus, BlockType, AccountBalance, BonusBalance, CustomerClubPoints, TotalChargeBacks, 
                         TotalChargebackReverses, TotalVoids, TotalBonuses, TotalCustomerClubPoints, MaxBalance, Ranking, Wagered, CasinoID, CurrencySymbol, RevenueEUR, Email, LastLoginPlatform, PromotionsMailEnabled, 
                         PromotionsSMSEnabled, PromotionsPhoneEnabled, PromotionsPostEnabled, PromotionsPartnerEnabled, RegistrationPlayMode, TotalBetsCasino, TotalBetsSport, DepositsCountCasino, DepositsCountSport, 
                         FirstDepositMethod, LastDepositMethod, FirstBonusID, LastBonusID, WelcomeBonusCode, WelcomeBonusDesc, WelcomeBonusSport, WelcomeBonusSportCode, WelcomeBonusSportDesc, MobileNumber, PushEnabled, 
                         PromotionsPushEnabled, BonusBalanceSport, LastUpdate, FullMobileNumber, CountryID, JurisdictionID, Locale, IsActivated, AffordabilityAttempts, AffordabilityTreshold, AffordabilityBalance, AffordabilityStatus, 
                         AffordabilityIncomeRangeChoice, AffordabilityLastUpdate, WinningsRestriction, CurrentWinnings, WinningsRestrictionFailedDate, PendingWithdrawals, Occupation, FTDAmount, FTDSettlementCompanyID, Age, OccupationID, 
                         OccupationYearlyIncome, DepositsCountLive, DepositsCountBingo, TotalBetsLive, TotalBetsBingo, PromotionalCasinoEmailEnabled, PromotionalCasinoSMSEnabled, PromotionalBingoEmailEnabled, 
                         PromotionalBingoSMSEnabled, PromotionalSportsEmailEnabled, PromotionalSportsSMSEnabled, PromotionalPushEnabled, PromotionalPhoneEnabled, PromotionalPostEnabled, PromotionalPartnerEnabled
FROM            common.tbl_Daily_actions_players
GO
/****** Object:  UserDefinedFunction [dbo].[IntegerToIPAddress]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[IntegerToIPAddress] (@IP AS bigint)
RETURNS varchar(15)
WITH SCHEMABINDING, RETURNS NULL ON NULL INPUT
AS
BEGIN
 DECLARE @Octet1 bigint
 DECLARE @Octet2 tinyint
 DECLARE @Octet3 tinyint
 DECLARE @Octet4 tinyint
 DECLARE @RestOfIP bigint
 
 SET @Octet1 = @IP / 16777216
 SET @RestOfIP = @IP - (@Octet1 * 16777216)
 SET @Octet2 = @RestOfIP / 65536
 SET @RestOfIP = @RestOfIP - (@Octet2 * 65536)
 SET @Octet3 = @RestOfIP / 256
 SET @Octet4 = @RestOfIP - (@Octet3 * 256)
 
 RETURN(CONVERT(varchar, @Octet1) + '.' +
        CONVERT(varchar, @Octet2) + '.' +
        CONVERT(varchar, @Octet3) + '.' +
        CONVERT(varchar, @Octet4))
END
GO
/****** Object:  UserDefinedFunction [dbo].[IPAddressToInteger]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[IPAddressToInteger] (@IP AS varchar(15))
RETURNS bigint
WITH SCHEMABINDING, RETURNS NULL ON NULL INPUT
AS
BEGIN
 RETURN (CONVERT(bigint, PARSENAME(@IP,1)) +
         CONVERT(bigint, PARSENAME(@IP,2)) * 256 +
         CONVERT(bigint, PARSENAME(@IP,3)) * 65536 +
         CONVERT(bigint, PARSENAME(@IP,4)) * 16777216)
 
END

GO
/****** Object:  Table [common].[tbl_Bonus_balances]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [common].[tbl_Bonus_balances](
	[BonusBalanceID] [bigint] NOT NULL,
	[PlayerID] [bigint] NOT NULL,
	[CurrencyID] [tinyint] NULL,
	[BonusID] [int] NULL,
	[Amount] [money] NULL,
	[Balance] [money] NULL,
	[Status] [nvarchar](50) NULL,
	[WagerLeft] [money] NULL,
	[OriginalDepositAmount] [money] NULL,
	[MaxCashableWinnings] [money] NULL,
	[AmountConverted] [money] NULL,
	[IsSportBonus] [bit] NULL,
	[FreeSpinsOffer] [nvarchar](500) NULL,
	[FreeSpinsAmount] [int] NULL,
	[FreeSpinsLeft] [int] NULL,
	[Comments] [nvarchar](500) NULL,
	[DepositCode] [nvarchar](500) NULL,
	[UpdatedDate] [datetime] NULL,
	[CreationDate] [datetime] NULL,
	[LossConditionDate] [datetime] NULL,
 CONSTRAINT [PK_tbl_Player_bonus_balances] PRIMARY KEY CLUSTERED 
(
	[BonusBalanceID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [common].[tbl_Bonuses]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [common].[tbl_Bonuses](
	[BonusID] [int] NOT NULL,
	[BonusName] [varchar](100) NULL,
	[InternalName] [nvarchar](50) NULL,
	[Description] [nvarchar](500) NULL,
	[Percentage] [decimal](5, 2) NULL,
	[PercentageUpToAmount] [money] NULL,
	[Divisions] [int] NULL,
	[BonusAmount] [money] NULL,
	[Status] [nvarchar](100) NULL,
	[CouponCode] [varchar](100) NULL,
	[GivenUpon] [nvarchar](100) NULL,
	[StartDate] [smalldatetime] NULL,
	[StartTime] [smallint] NULL,
	[EndDate] [smalldatetime] NULL,
	[EndTime] [smallint] NULL,
	[ConditionFilterPlayers] [nvarchar](100) NULL,
	[ConditionTrigger] [nvarchar](100) NULL,
	[WagerFactor] [money] NULL,
	[MinDeposit] [money] NULL,
	[DepositNumber] [int] NULL,
	[FreeGame] [nvarchar](100) NULL,
	[ConditionRanking] [nvarchar](100) NULL,
	[MaxBonusMoney] [money] NULL,
	[UpdatedDate] [datetime] NULL,
	[ConditionRegistrationPlayMode] [nvarchar](10) NULL,
	[ConditionEventPlatMode] [nvarchar](10) NULL,
	[ConditionPlayedCasino] [bit] NULL,
	[ConditionPlayedSport] [bit] NULL,
	[ConditionDepositsCountCasino] [int] NULL,
	[ConditionDepositsCountSport] [int] NULL,
	[BonusType] [nvarchar](50) NULL,
	[IsSportBonus] [bit] NULL
) ON [PRIMARY]
GO
/****** Object:  Table [common].[tbl_Countries]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [common].[tbl_Countries](
	[CountryID] [int] NOT NULL,
	[CountryName] [varchar](50) NOT NULL,
	[IsActive] [bit] NULL,
	[CountryIntlCode] [varchar](2) NULL,
	[PhoneCode] [nvarchar](50) NULL,
	[IsoCode] [varchar](3) NULL,
	[JurisdictionCode] [nvarchar](15) NULL,
	[DefaultLanguage] [int] NULL,
	[DefaultCurrency] [tinyint] NULL,
	[UpdatedDate] [smalldatetime] NOT NULL,
	[JurisdictionID] [int] NULL,
	[Locales] [nvarchar](50) NULL,
 CONSTRAINT [PK_tbl_Countries] PRIMARY KEY CLUSTERED 
(
	[CountryID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [common].[tbl_Currencies]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [common].[tbl_Currencies](
	[CurrencyID] [tinyint] NOT NULL,
	[CurrencyName] [varchar](30) NOT NULL,
	[CurrencySymbol] [nvarchar](5) NULL,
	[CurrencyCode] [varchar](3) NOT NULL,
	[RateInEUR] [money] NULL,
	[RateInUSD] [money] NULL,
	[RateInGBP] [money] NULL,
	[OrderBy] [tinyint] NULL,
	[Multiplier] [int] NULL,
	[ForLanguagesID] [int] NULL,
	[ForLanguages] [nvarchar](50) NULL,
	[UpdatedDate] [smalldatetime] NOT NULL,
 CONSTRAINT [PK_tbl_Currencies] PRIMARY KEY CLUSTERED 
(
	[CurrencyID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [common].[tbl_Currency_history]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [common].[tbl_Currency_history](
	[currency_id] [tinyint] NOT NULL,
	[rate_in_EUR] [money] NULL,
	[updated_dt] [smalldatetime] NOT NULL,
 CONSTRAINT [PK_currency_history] PRIMARY KEY CLUSTERED 
(
	[updated_dt] ASC,
	[currency_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [common].[tbl_Daily_actions]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [common].[tbl_Daily_actions](
	[ID] [bigint] NOT NULL,
	[Date] [datetime] NOT NULL,
	[WhiteLabelID] [smallint] NULL,
	[PlayerID] [bigint] NULL,
	[Registration] [tinyint] NULL,
	[FTD] [tinyint] NULL,
	[FTDA] [tinyint] NULL,
	[Deposits] [money] NULL,
	[DepositsCreditCard] [money] NULL,
	[DepositsNeteller] [money] NULL,
	[DepositsMoneyBookers] [money] NULL,
	[DepositsOther] [money] NULL,
	[CashoutRequests] [money] NULL,
	[PaidCashouts] [money] NULL,
	[Chargebacks] [money] NULL,
	[Voids] [money] NULL,
	[ReverseChargebacks] [money] NULL,
	[Bonuses] [money] NULL,
	[CollectedBonuses] [money] NULL,
	[ExpiredBonuses] [money] NULL,
	[ClubPointsConversion] [money] NULL,
	[BankRoll] [money] NULL,
	[SideGamesBets] [money] NULL,
	[SideGamesRefunds] [money] NULL,
	[SideGamesWins] [money] NULL,
	[SideGamesTableGamesBets] [money] NULL,
	[SideGamesTableGamesWins] [money] NULL,
	[SideGamesCasualGamesBets] [money] NULL,
	[SideGamesCasualGamesWins] [money] NULL,
	[SideGamesSlotsBets] [money] NULL,
	[SideGamesSlotsWins] [money] NULL,
	[SideGamesJackpotsBets] [money] NULL,
	[SideGamesJackpotsWins] [money] NULL,
	[SideGamesFeaturedBets] [money] NULL,
	[SideGamesFeaturedWins] [money] NULL,
	[JackpotContribution] [money] NULL,
	[LottoBets] [money] NULL,
	[LottoAdvancedBets] [money] NULL,
	[LottoWins] [money] NULL,
	[LottoAdvancedWins] [money] NULL,
	[InsuranceContribution] [money] NULL,
	[Adjustments] [money] NULL,
	[AdjustmentsAdd] [money] NULL,
	[ClearedBalance] [money] NULL,
	[RevenueAdjustments] [money] NULL,
	[RevenueAdjustmentsAdd] [money] NULL,
	[UpdatedDate] [datetime] NULL,
	[AdministrativeFee] [money] NULL,
	[AdministrativeFeeReturn] [money] NULL,
	[BetsReal] [money] NULL,
	[BetsBonus] [money] NULL,
	[RefundsReal] [money] NULL,
	[RefundsBonus] [money] NULL,
	[WinsReal] [money] NULL,
	[WinsBonus] [money] NULL,
	[BonusConverted] [money] NULL,
	[DepositsFee] [money] NULL,
	[DepositsSport] [money] NULL,
	[BetsSport] [money] NULL,
	[RefundsSport] [money] NULL,
	[WinsSport] [money] NULL,
	[BetsSportReal] [money] NULL,
	[RefundsSportReal] [money] NULL,
	[WinsSportReal] [money] NULL,
	[BetsSportBonus] [money] NULL,
	[RefundsSportBonus] [money] NULL,
	[WinsSportBonus] [money] NULL,
	[BonusesSport] [money] NULL,
	[BetsCasino] [money] NULL,
	[RefundsCasino] [money] NULL,
	[WinsCasino] [money] NULL,
	[BetsCasinoReal] [money] NULL,
	[RefundsCasinoReal] [money] NULL,
	[WinsCasinoReal] [money] NULL,
	[BetsCasinoBonus] [money] NULL,
	[RefundsCasinoBonus] [money] NULL,
	[WinsCasinoBonus] [money] NULL,
	[EUR2GBP] [money] NULL,
	[AppBets] [money] NULL,
	[AppRefunds] [money] NULL,
	[AppWins] [money] NULL,
	[AppBetsCasino] [money] NULL,
	[AppRefundsCasino] [money] NULL,
	[AppWinsCasino] [money] NULL,
	[AppBetsSport] [money] NULL,
	[AppRefundsSport] [money] NULL,
	[AppWinsSport] [money] NULL,
	[DepositsLive] [money] NULL,
	[BonusesLive] [money] NULL,
	[BetsLive] [money] NULL,
	[RefundsLive] [money] NULL,
	[WinsLive] [money] NULL,
	[BetsLiveReal] [money] NULL,
	[RefundsLiveReal] [money] NULL,
	[WinsLiveReal] [money] NULL,
	[BetsLiveBonus] [money] NULL,
	[RefundsLiveBonus] [money] NULL,
	[WinsLiveBonus] [money] NULL,
	[DepositsBingo] [money] NULL,
	[BonusesBingo] [money] NULL,
	[BetsBingo] [money] NULL,
	[RefundsBingo] [money] NULL,
	[WinsBingo] [money] NULL,
	[BetsBingoReal] [money] NULL,
	[RefundsBingoReal] [money] NULL,
	[WinsBingoReal] [money] NULL,
	[BetsBingoBonus] [money] NULL,
	[RefundsBingoBonus] [money] NULL,
	[WinsBingoBonus] [money] NULL,
 CONSTRAINT [PK_tbl_Daily_actionsGBP] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 100, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [common].[tbl_Daily_actions_EUR]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [common].[tbl_Daily_actions_EUR](
	[ID] [bigint] NOT NULL,
	[Date] [datetime] NOT NULL,
	[WhiteLabelID] [smallint] NULL,
	[PlayerID] [bigint] NULL,
	[Registration] [tinyint] NULL,
	[FTD] [tinyint] NULL,
	[FTDA] [tinyint] NULL,
	[Deposits] [money] NULL,
	[DepositsCreditCard] [money] NULL,
	[DepositsNeteller] [money] NULL,
	[DepositsMoneyBookers] [money] NULL,
	[DepositsOther] [money] NULL,
	[CashoutRequests] [money] NULL,
	[PaidCashouts] [money] NULL,
	[Chargebacks] [money] NULL,
	[Voids] [money] NULL,
	[ReverseChargebacks] [money] NULL,
	[Bonuses] [money] NULL,
	[CollectedBonuses] [money] NULL,
	[ExpiredBonuses] [money] NULL,
	[ClubPointsConversion] [money] NULL,
	[BankRoll] [money] NULL,
	[SideGamesBets] [money] NULL,
	[SideGamesRefunds] [money] NULL,
	[SideGamesWins] [money] NULL,
	[SideGamesTableGamesBets] [money] NULL,
	[SideGamesTableGamesWins] [money] NULL,
	[SideGamesCasualGamesBets] [money] NULL,
	[SideGamesCasualGamesWins] [money] NULL,
	[SideGamesSlotsBets] [money] NULL,
	[SideGamesSlotsWins] [money] NULL,
	[SideGamesJackpotsBets] [money] NULL,
	[SideGamesJackpotsWins] [money] NULL,
	[SideGamesFeaturedBets] [money] NULL,
	[SideGamesFeaturedWins] [money] NULL,
	[JackpotContribution] [money] NULL,
	[LottoBets] [money] NULL,
	[LottoAdvancedBets] [money] NULL,
	[LottoWins] [money] NULL,
	[LottoAdvancedWins] [money] NULL,
	[InsuranceContribution] [money] NULL,
	[Adjustments] [money] NULL,
	[AdjustmentsAdd] [money] NULL,
	[ClearedBalance] [money] NULL,
	[RevenueAdjustments] [money] NULL,
	[RevenueAdjustmentsAdd] [money] NULL,
	[UpdatedDate] [datetime] NULL,
	[AdministrativeFee] [money] NULL,
	[AdministrativeFeeReturn] [money] NULL,
	[BetsReal] [money] NULL,
	[BetsBonus] [money] NULL,
	[RefundsReal] [money] NULL,
	[RefundsBonus] [money] NULL,
	[WinsReal] [money] NULL,
	[WinsBonus] [money] NULL,
	[BonusConverted] [money] NULL,
	[DepositsFee] [money] NULL,
	[DepositsSport] [money] NULL,
	[BetsSport] [money] NULL,
	[RefundsSport] [money] NULL,
	[WinsSport] [money] NULL,
	[BetsSportReal] [money] NULL,
	[RefundsSportReal] [money] NULL,
	[WinsSportReal] [money] NULL,
	[BetsSportBonus] [money] NULL,
	[RefundsSportBonus] [money] NULL,
	[WinsSportBonus] [money] NULL,
	[BonusesSport] [money] NULL,
	[BetsCasino] [money] NULL,
	[RefundsCasino] [money] NULL,
	[WinsCasino] [money] NULL,
	[BetsCasinoReal] [money] NULL,
	[RefundsCasinoReal] [money] NULL,
	[WinsCasinoReal] [money] NULL,
	[BetsCasinoBonus] [money] NULL,
	[RefundsCasinoBonus] [money] NULL,
	[WinsCasinoBonus] [money] NULL,
	[EUR2GBP] [money] NULL,
	[AppBets] [money] NULL,
	[AppRefunds] [money] NULL,
	[AppWins] [money] NULL,
	[AppBetsCasino] [money] NULL,
	[AppRefundsCasino] [money] NULL,
	[AppWinsCasino] [money] NULL,
	[AppBetsSport] [money] NULL,
	[AppRefundsSport] [money] NULL,
	[AppWinsSport] [money] NULL,
	[DepositsLive] [money] NULL,
	[BonusesLive] [money] NULL,
	[BetsLive] [money] NULL,
	[RefundsLive] [money] NULL,
	[WinsLive] [money] NULL,
	[BetsLiveReal] [money] NULL,
	[RefundsLiveReal] [money] NULL,
	[WinsLiveReal] [money] NULL,
	[BetsLiveBonus] [money] NULL,
	[RefundsLiveBonus] [money] NULL,
	[WinsLiveBonus] [money] NULL,
	[DepositsBingo] [money] NULL,
	[BonusesBingo] [money] NULL,
	[BetsBingo] [money] NULL,
	[RefundsBingo] [money] NULL,
	[WinsBingo] [money] NULL,
	[BetsBingoReal] [money] NULL,
	[RefundsBingoReal] [money] NULL,
	[WinsBingoReal] [money] NULL,
	[BetsBingoBonus] [money] NULL,
	[RefundsBingoBonus] [money] NULL,
	[WinsBingoBonus] [money] NULL,
 CONSTRAINT [PK_tbl_Daily_actions] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 100, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [common].[tbl_Daily_actions_EUR_games]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [common].[tbl_Daily_actions_EUR_games](
	[ID] [bigint] IDENTITY(1,1) NOT FOR REPLICATION NOT NULL,
	[GameDate] [datetime] NULL,
	[PlayerID] [bigint] NULL,
	[GameID] [bigint] NULL,
	[Platform] [nvarchar](50) NULL,
	[RealBetAmount] [money] NULL,
	[RealWinAmount] [money] NULL,
	[BonusBetAmount] [money] NULL,
	[BonusWinAmount] [money] NULL,
	[NetGamingRevenue] [money] NULL,
	[NumberofRealBets] [money] NULL,
	[NumberofBonusBets] [money] NULL,
	[NumberofSessions] [money] NULL,
	[NumberofRealWins] [money] NULL,
	[NumberofBonusWins] [money] NULL,
	[RealBetAmountOriginal] [money] NULL,
	[RealWinAmountOriginal] [money] NULL,
	[BonusBetAmountOriginal] [money] NULL,
	[BonusWinAmountOriginal] [money] NULL,
	[NetGamingRevenueOriginal] [money] NULL,
	[UpdateDate] [datetime] NULL,
 CONSTRAINT [PK_tbl_Daily_actions_games_ID] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [common].[tbl_Daily_actions_games]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [common].[tbl_Daily_actions_games](
	[ID] [bigint] IDENTITY(1,1) NOT FOR REPLICATION NOT NULL,
	[GameDate] [datetime] NULL,
	[PlayerID] [bigint] NULL,
	[GameID] [bigint] NULL,
	[Platform] [nvarchar](50) NULL,
	[RealBetAmount] [money] NULL,
	[RealWinAmount] [money] NULL,
	[BonusBetAmount] [money] NULL,
	[BonusWinAmount] [money] NULL,
	[NetGamingRevenue] [money] NULL,
	[NumberofRealBets] [money] NULL,
	[NumberofBonusBets] [money] NULL,
	[NumberofSessions] [money] NULL,
	[NumberofRealWins] [money] NULL,
	[NumberofBonusWins] [money] NULL,
	[RealBetAmountOriginal] [money] NULL,
	[RealWinAmountOriginal] [money] NULL,
	[BonusBetAmountOriginal] [money] NULL,
	[BonusWinAmountOriginal] [money] NULL,
	[NetGamingRevenueOriginal] [money] NULL,
	[UpdateDate] [datetime] NULL,
 CONSTRAINT [PK_tbl_Daily_actionsGBP_games_ID] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [common].[tbl_Daily_actions_GBP]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [common].[tbl_Daily_actions_GBP](
	[ID] [bigint] NOT NULL,
	[Date] [datetime] NOT NULL,
	[WhiteLabelID] [smallint] NULL,
	[PlayerID] [bigint] NULL,
	[Registration] [tinyint] NULL,
	[FTD] [tinyint] NULL,
	[FTDA] [tinyint] NULL,
	[Deposits] [money] NULL,
	[DepositsCreditCard] [money] NULL,
	[DepositsNeteller] [money] NULL,
	[DepositsMoneyBookers] [money] NULL,
	[DepositsOther] [money] NULL,
	[CashoutRequests] [money] NULL,
	[PaidCashouts] [money] NULL,
	[Chargebacks] [money] NULL,
	[Voids] [money] NULL,
	[ReverseChargebacks] [money] NULL,
	[Bonuses] [money] NULL,
	[CollectedBonuses] [money] NULL,
	[ExpiredBonuses] [money] NULL,
	[ClubPointsConversion] [money] NULL,
	[BankRoll] [money] NULL,
	[SideGamesBets] [money] NULL,
	[SideGamesRefunds] [money] NULL,
	[SideGamesWins] [money] NULL,
	[SideGamesTableGamesBets] [money] NULL,
	[SideGamesTableGamesWins] [money] NULL,
	[SideGamesCasualGamesBets] [money] NULL,
	[SideGamesCasualGamesWins] [money] NULL,
	[SideGamesSlotsBets] [money] NULL,
	[SideGamesSlotsWins] [money] NULL,
	[SideGamesJackpotsBets] [money] NULL,
	[SideGamesJackpotsWins] [money] NULL,
	[SideGamesFeaturedBets] [money] NULL,
	[SideGamesFeaturedWins] [money] NULL,
	[JackpotContribution] [money] NULL,
	[LottoBets] [money] NULL,
	[LottoAdvancedBets] [money] NULL,
	[LottoWins] [money] NULL,
	[LottoAdvancedWins] [money] NULL,
	[InsuranceContribution] [money] NULL,
	[Adjustments] [money] NULL,
	[AdjustmentsAdd] [money] NULL,
	[ClearedBalance] [money] NULL,
	[RevenueAdjustments] [money] NULL,
	[RevenueAdjustmentsAdd] [money] NULL,
	[UpdatedDate] [datetime] NULL,
	[AdministrativeFee] [money] NULL,
	[AdministrativeFeeReturn] [money] NULL,
	[BetsReal] [money] NULL,
	[RefundsReal] [money] NULL,
	[WinsReal] [money] NULL,
	[BetsBonus] [money] NULL,
	[RefundsBonus] [money] NULL,
	[WinsBonus] [money] NULL,
	[BonusConverted] [money] NULL,
	[DepositsFee] [money] NULL,
	[DepositsSport] [money] NULL,
	[BetsSport] [money] NULL,
	[RefundsSport] [money] NULL,
	[WinsSport] [money] NULL,
	[BetsSportReal] [money] NULL,
	[RefundsSportReal] [money] NULL,
	[WinsSportReal] [money] NULL,
	[BetsSportBonus] [money] NULL,
	[RefundsSportBonus] [money] NULL,
	[WinsSportBonus] [money] NULL,
	[BonusesSport] [money] NULL,
 CONSTRAINT [PK_tbl_Daily_actions_GBP] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [common].[tbl_Daily_actions_transactions]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [common].[tbl_Daily_actions_transactions](
	[TransactionID] [bigint] IDENTITY(1,1) NOT FOR REPLICATION NOT NULL,
	[PlayerID] [bigint] NULL,
	[TransactionDate] [datetime] NULL,
	[TransactionType] [varchar](100) NULL,
	[TransactionAmount] [money] NULL,
	[TransactionOriginalAmount] [money] NULL,
	[TransactionDetails] [nvarchar](1000) NULL,
	[Platform] [nvarchar](50) NULL,
	[Status] [nvarchar](25) NULL,
	[CurrencyCode] [varchar](3) NULL,
	[LastUpdated] [datetime] NULL,
	[OriginalTransactionID] [bigint] NOT NULL,
	[TransactionSubDetails] [nvarchar](500) NULL,
	[TransactionComments] [nvarchar](500) NULL,
	[PaymentMethod] [nvarchar](500) NULL,
	[PaymentProvider] [nvarchar](500) NULL,
	[TransactionInfoID] [bigint] NULL,
 CONSTRAINT [PK_tbl_Daily_actions_transactions_TransactionID] PRIMARY KEY CLUSTERED 
(
	[TransactionID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 100, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [common].[tbl_Daily_actions_triggers]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [common].[tbl_Daily_actions_triggers](
	[TriggerPlayerID] [bigint] NOT NULL,
	[TriggerID] [int] NOT NULL,
	[TriggerName] [nvarchar](500) NOT NULL,
	[PlayerID] [bigint] NOT NULL,
	[TriggerDate] [datetime] NOT NULL
) ON [PRIMARY]
GO
/****** Object:  Table [common].[tbl_Daily_actionsGBP_transactions]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [common].[tbl_Daily_actionsGBP_transactions](
	[TransactionID] [bigint] IDENTITY(1,1) NOT FOR REPLICATION NOT NULL,
	[PlayerID] [bigint] NULL,
	[TransactionDate] [datetime] NULL,
	[TransactionType] [varchar](100) NULL,
	[TransactionAmount] [money] NULL,
	[TransactionOriginalAmount] [money] NULL,
	[TransactionDetails] [nvarchar](1000) NULL,
	[Platform] [nvarchar](50) NULL,
	[Status] [nvarchar](25) NULL,
	[CurrencyCode] [varchar](3) NULL,
	[LastUpdated] [datetime] NULL,
	[OriginalTransactionID] [bigint] NOT NULL,
	[TransactionSubDetails] [nvarchar](500) NULL,
	[TransactionComments] [nvarchar](500) NULL,
	[PaymentMethod] [nvarchar](500) NULL,
	[PaymentProvider] [nvarchar](500) NULL,
	[TransactionInfoID] [bigint] NULL,
 CONSTRAINT [PK_tbl_Daily_actionsGBP_transactions_TransactionID] PRIMARY KEY CLUSTERED 
(
	[TransactionID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 100, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [common].[tbl_Daily_log]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [common].[tbl_Daily_log](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[ProcName] [sysname] NOT NULL,
	[StartTime] [datetime] NULL,
	[EndTime] [datetime] NULL,
	[RowsStartTime] [datetime] NULL,
	[RowsEndTime] [datetime] NULL,
	[RowsAmount] [int] NULL,
 CONSTRAINT [PK_tbl_Daily_log] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [common].[tbl_Interactions_checks]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [common].[tbl_Interactions_checks](
	[ID] [bigint] NOT NULL,
	[PlayerID] [bigint] NOT NULL,
	[RuleID] [int] NULL,
	[RuleCode] [varchar](50) NULL,
	[ValueID] [int] NULL,
	[ValueCode] [varchar](50) NULL,
	[PlayerValue] [nvarchar](max) NULL,
	[Score] [int] NULL,
	[UpdatedDate] [datetime] NULL,
	[ExpiredAt] [datetime] NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [common].[tbl_Interactions_ScoreChecks]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [common].[tbl_Interactions_ScoreChecks](
	[ID] [bigint] NOT NULL,
	[PlayerID] [bigint] NOT NULL,
	[ScoreSum] [int] NULL,
	[ValueID] [int] NULL,
	[ValueCode] [nvarchar](100) NULL,
	[ChecksIDs] [varchar](500) NULL,
	[ChecksDetails] [varchar](max) NULL,
	[UpdatedDate] [datetime] NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [common].[tbl_Leaderboards]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [common].[tbl_Leaderboards](
	[leaderboard_id] [int] NOT NULL,
	[bonus_id] [int] NOT NULL,
	[player_id] [bigint] NOT NULL,
	[creation_dt] [datetime] NOT NULL,
	[updated_dt] [datetime] NOT NULL,
	[result_total] [money] NULL,
	[result_rank] [int] NULL,
	[bets] [money] NULL,
	[wins] [money] NULL,
	[bets_count] [int] NULL,
	[status_id] [int] NULL,
	[deposits] [money] NULL
) ON [PRIMARY]
GO
/****** Object:  Table [common].[tbl_Migration_Player_Consent]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [common].[tbl_Migration_Player_Consent](
	[PlayerID] [bigint] NOT NULL,
	[PlayMode] [int] NULL,
	[CommunicationChannel] [int] NOT NULL,
	[Enabled] [bit] NOT NULL
) ON [PRIMARY]
GO
/****** Object:  Table [common].[tbl_White_labels]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [common].[tbl_White_labels](
	[LabelID] [int] NOT NULL,
	[LabelName] [nvarchar](50) NOT NULL,
	[LabelUrlName] [varchar](50) NULL,
	[LabelUrl] [varchar](100) NOT NULL,
	[UrlPlay] [varchar](200) NULL,
	[UrlPlayShort] [varchar](50) NULL,
	[DefaultLanguage] [nvarchar](50) NULL,
	[DefaultCountry] [int] NULL,
	[DefaultCurrency] [int] NULL,
	[WelcomeBonusDesc] [nvarchar](500) NULL,
	[RestrictedCountries] [nvarchar](max) NULL,
	[FoundedYear] [nvarchar](10) NULL,
	[SportEnabled] [bit] NULL,
	[UpdatedDate] [smalldatetime] NOT NULL,
	[DefaultPlayMode] [nvarchar](10) NULL,
	[IsActive] [bit] NULL,
	[LabelTitle] [nvarchar](100) NULL,
	[GACode] [nvarchar](50) NULL,
	[IntileryCode] [nvarchar](50) NULL,
	[EmailDisplayName] [nvarchar](50) NULL,
	[LabelNameShort] [nvarchar](50) NULL,
	[ExcludedJurisdictions] [nvarchar](50) NULL,
	[IsNewSite] [bit] NULL,
 CONSTRAINT [PK_tbl_White_labels] PRIMARY KEY CLUSTERED 
(
	[LabelID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [common].[tbl_Withdrawal_requests]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [common].[tbl_Withdrawal_requests](
	[RequestID] [bigint] NOT NULL,
	[PlayerID] [bigint] NOT NULL,
	[RequestDate] [datetime] NULL,
	[Amount] [money] NULL,
	[SCName] [varchar](50) NULL,
	[Status] [varchar](50) NULL,
	[HandlingType] [varchar](50) NULL,
	[UpdatedDate] [datetime] NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[GamesCasinoSessions]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[GamesCasinoSessions](
	[ID] [bigint] NOT NULL,
	[GameID] [bigint] NOT NULL,
	[PlayerID] [bigint] NOT NULL,
	[TotalBet] [money] NOT NULL,
	[TotalBetAccount] [money] NOT NULL,
	[TotalBetBonus] [money] NOT NULL,
	[TotalWin] [money] NOT NULL,
	[TotalWinAccount] [money] NOT NULL,
	[TotalWinBonus] [money] NOT NULL,
	[RoundID] [bigint] NOT NULL,
	[GameStatus] [int] NOT NULL,
	[CurrencyID] [int] NOT NULL,
	[CreationDate] [datetime] NOT NULL,
	[UpdatedDate] [datetime] NOT NULL,
	[AccountBalance] [money] NOT NULL,
	[BonusBalance] [money] NOT NULL,
 CONSTRAINT [PK_GamesCasinoSessions] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[GamesDescriptions]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[GamesDescriptions](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[GameID] [int] NOT NULL,
	[LanguageID] [int] NOT NULL,
	[Description] [nvarchar](500) NOT NULL,
	[CreatedDate] [datetime] NOT NULL,
	[UpdatedDate] [datetime] NOT NULL,
 CONSTRAINT [PK_GamesDescriptions] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[GamesExcludedByCountry]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[GamesExcludedByCountry](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[GameID] [int] NOT NULL,
	[CountryID] [int] NOT NULL,
	[UpdatedDate] [datetime] NOT NULL,
 CONSTRAINT [PK_GamesExcludedByCountry] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[GamesExcludedByJurisdiction]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[GamesExcludedByJurisdiction](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[GameID] [int] NOT NULL,
	[JurisdictionID] [int] NOT NULL,
	[UpdatedDate] [datetime] NOT NULL,
 CONSTRAINT [PK_GamesExcludedByJurisdiction] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[GamesExcludedByLabel]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[GamesExcludedByLabel](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[GameID] [int] NOT NULL,
	[LabelID] [int] NOT NULL,
	[UpdatedDate] [datetime] NOT NULL,
 CONSTRAINT [PK_GamesExcludedByLabel] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[GamesFreeSpinsOffers]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[GamesFreeSpinsOffers](
	[OfferID] [int] NOT NULL,
	[OfferCode] [nvarchar](50) NOT NULL,
	[SpinsNumber] [int] NULL,
	[GameID] [int] NULL,
	[IsActive] [bit] NULL,
	[OfferDescription] [nvarchar](500) NULL,
	[UpdatedDate] [datetime] NULL,
	[IsSportBet] [bit] NULL,
 CONSTRAINT [PK_tbl_GamesFreeSpinsOffers] PRIMARY KEY CLUSTERED 
(
	[OfferID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SportBets]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SportBets](
	[RelativeBet] [money] NULL,
	[RelativeWin] [money] NULL,
	[player_id] [bigint] NOT NULL,
	[RegionId] [int] NOT NULL,
	[SportId] [int] NOT NULL,
	[CompetitionId] [int] NOT NULL,
	[MatchId] [int] NOT NULL,
	[UpdatedDate] [date] NOT NULL,
	[LastUpdate] [datetime] NOT NULL,
	[IsLive] [bit] NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SportBets_test]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SportBets_test](
	[RelativeBet] [money] NULL,
	[RelativeWin] [money] NULL,
	[player_id] [bigint] NOT NULL,
	[RegionId] [int] NOT NULL,
	[SportId] [int] NOT NULL,
	[CompetitionId] [int] NOT NULL,
	[MatchId] [int] NOT NULL,
	[UpdatedDate] [date] NOT NULL,
	[LastUpdate] [datetime] NOT NULL,
	[IsLive] [bit] NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SportBetsEnhanced]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SportBetsEnhanced](
	[RelativeBet] [money] NULL,
	[RelativeWin] [money] NULL,
	[PlayerId] [bigint] NOT NULL,
	[BetId] [bigint] NOT NULL,
	[BetType] [int] NULL,
	[OddTypeId] [int] NULL,
	[RegionId] [int] NOT NULL,
	[SportId] [int] NOT NULL,
	[CompetitionId] [int] NOT NULL,
	[MatchId] [int] NOT NULL,
	[MarketId] [int] NOT NULL,
	[IsLive] [bit] NULL,
	[BetState] [int] NOT NULL,
	[UpdatedDate] [date] NOT NULL,
	[LastUpdate] [datetime] NOT NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SportBetStates]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SportBetStates](
	[ID] [bigint] NOT NULL,
	[BetStateID] [int] NOT NULL,
	[BetStateName] [nvarchar](255) NOT NULL,
	[CreatedDate] [datetime] NOT NULL,
 CONSTRAINT [IX_dbo_SportBetStates_BetStateID] UNIQUE NONCLUSTERED 
(
	[BetStateID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SportBetTypes]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SportBetTypes](
	[ID] [bigint] NOT NULL,
	[BetTypeID] [int] NOT NULL,
	[BetTypeName] [nvarchar](255) NOT NULL,
	[CreatedDate] [datetime] NOT NULL,
 CONSTRAINT [IX_dbo_SportBetTypes_BetTypeID] UNIQUE NONCLUSTERED 
(
	[BetTypeID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SportCompetitions]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SportCompetitions](
	[ID] [bigint] NOT NULL,
	[CompetitionID] [int] NOT NULL,
	[CompetitionName] [nvarchar](255) NOT NULL,
	[CreatedDate] [datetime] NOT NULL,
 CONSTRAINT [IX_dbo_SportCompetitions_CompetitionID] UNIQUE NONCLUSTERED 
(
	[CompetitionID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SportMarkets]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SportMarkets](
	[ID] [bigint] NOT NULL,
	[MarketTypeID] [int] NOT NULL,
	[MarketName] [nvarchar](255) NOT NULL,
	[CreatedDate] [datetime] NOT NULL,
 CONSTRAINT [IX_dbo_SportMarkets_MarketTypeID] UNIQUE NONCLUSTERED 
(
	[MarketTypeID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SportMatches]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SportMatches](
	[ID] [bigint] NOT NULL,
	[MatchID] [int] NOT NULL,
	[MatchName] [nvarchar](500) NOT NULL,
	[CreatedDate] [datetime] NOT NULL,
 CONSTRAINT [IX_dbo_SportMatches_MatchID] UNIQUE CLUSTERED 
(
	[MatchID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SportOddsTypes]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SportOddsTypes](
	[ID] [bigint] NOT NULL,
	[OddTypeID] [int] NOT NULL,
	[OddTypeName] [nvarchar](255) NOT NULL,
	[CreatedDate] [datetime] NOT NULL,
 CONSTRAINT [IX_dbo_SportOddsTypes_OddTypeID] UNIQUE NONCLUSTERED 
(
	[OddTypeID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SportRegions]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SportRegions](
	[ID] [bigint] NOT NULL,
	[RegionID] [int] NOT NULL,
	[RegionName] [nvarchar](255) NOT NULL,
	[CreatedDate] [datetime] NOT NULL,
 CONSTRAINT [IX_dbo_SportRegions_RegionID] UNIQUE NONCLUSTERED 
(
	[RegionID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SportSports]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SportSports](
	[ID] [bigint] NOT NULL,
	[SportID] [int] NOT NULL,
	[SportName] [nvarchar](255) NOT NULL,
	[CreatedDate] [datetime] NOT NULL,
 CONSTRAINT [IX_dbo_SportSports_SportID] UNIQUE NONCLUSTERED 
(
	[SportID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  StoredProcedure [dbo].[PPDB_GetCasinoSessions]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[PPDB_GetCasinoSessions]
	@date_from	datetime
AS
SET NOCOUNT ON;

SELECT 
[ID], [GameID], [PlayerID], [TotalBet] * c.rate_in_EUR AS TotalBet, [TotalBetRealMoney] * c.rate_in_EUR AS TotalBetAccount, [TotalBetBonus] * c.rate_in_EUR AS TotalBetBonus, [TotalWin] * c.rate_in_EUR AS TotalWin, [TotalWinRealMoney] * c.rate_in_EUR AS TotalWinAccount, [TotalWinBonus] * c.rate_in_EUR AS TotalWinBonus, [RoundID], [GameStatus], [CurrencyID], [CreationDate], [UpdatedDate], [RealMoneyBalance] * c.rate_in_EUR AS AccountBalance, [BonusBalance] * c.rate_in_EUR AS BonusBalance
FROM  ProgressPlayDB.Games.Games_PlayedGames pg (NOLOCK)
inner join [ProgressPlayDB].common.tbl_Players p with(NOLOCK) ON p.player_id = pg.PlayerID
inner join [ProgressPlayDB].common.tbl_Currencies c with(NOLOCK) ON p.currency_id = c.currency_id

WHERE UpdatedDate >= @date_from
AND UpdatedDate >= DATEADD(day, -1, CONVERT(date, GETUTCDATE()) )
UNION ALL
SELECT
[ID], [GameID], [PlayerID], [TotalBet] * c.rate_in_EUR AS TotalBet, [TotalBetRealMoney] * c.rate_in_EUR AS TotalBetAccount, [TotalBetBonus] * c.rate_in_EUR AS TotalBetBonus, [TotalWin] * c.rate_in_EUR AS TotalWin, [TotalWinRealMoney] * c.rate_in_EUR AS TotalWinAccount, [TotalWinBonus] * c.rate_in_EUR AS TotalWinBonus, [RoundID], [GameStatus], [CurrencyID], [CreationDate], [UpdatedDate], [RealMoneyBalance] * c.rate_in_EUR AS AccountBalance, [BonusBalance] * c.rate_in_EUR AS BonusBalance
FROM  ProgressPlayDB.Games.OngoingGames pg (NOLOCK)
inner join [ProgressPlayDB].common.tbl_Players p with(NOLOCK) ON p.player_id = pg.PlayerID
inner join [ProgressPlayDB].common.tbl_Currencies c with(NOLOCK) ON p.currency_id = c.currency_id

WHERE UpdatedDate >= @date_from
AND UpdatedDate >= DATEADD(day, -1, CONVERT(date, GETUTCDATE()) )
GO
/****** Object:  StoredProcedure [dbo].[PPDB_GetSportSessions]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[PPDB_GetSportSessions]
	@date_from	datetime
AS
SET NOCOUNT ON;

select
pg.[ID], pg.[GameID], pg.[PlayerID], pg.[TotalBet] * c.rate_in_EUR AS TotalBet, pg.[TotalBetRealMoney] * c.rate_in_EUR AS TotalBetAccount, pg.[TotalBetBonus] * c.rate_in_EUR AS TotalBetBonus, pg.[TotalWin] * c.rate_in_EUR AS TotalWin, pg.[TotalWinRealMoney] * c.rate_in_EUR AS TotalWinAccount, pg.[TotalWinBonus] * c.rate_in_EUR AS TotalWinBonus, pg.[RoundID], pg.[GameStatus], pg.[CurrencyID], pg.[CreationDate], pg.[UpdatedDate], pg.[RealMoneyBalance] * c.rate_in_EUR AS AccountBalance, pg.[BonusBalance] * c.rate_in_EUR AS BonusBalance, 
b.BetId, b.BetState, b.BetType, b.OddType, b.Source, b.TotalPrice, s.ID AS BetSelectionID, s.InternalBetId, s.IsLive, s.IsOutright, s.SelectionId, s.SelectionName, s.SportId, s.RegionId, s.MatchId, s.CompetitionId, s.MarketTypeId, s.MatchInfo, s.MatchStartDate, s.Price, s.UpdatedDate

-- b.*, s.*, pg.TotalBet * c.rate_in_EUR AS TotalBet, pg.TotalBetBonus * c.rate_in_EUR AS TotalBetBonus, pg.TotalBetRealMoney * c.rate_in_EUR AS TotalBetAccount, pg.TotalWin * c.rate_in_EUR AS TotalWin, pg.TotalWinBonus * c.rate_in_EUR AS TotalWinBonus, pg.TotalWinRealMoney * c.rate_in_EUR AS TotalWinAccount, pg.RealMoneyBalance * c.rate_in_EUR AS AccountBalance, pg.BonusBalance * c.rate_in_EUR AS BonusBalance
from [ProgressPlayDB].Games.Games_BetConstruct_Bet_Selection s with(nolock)
left join [ProgressPlayDB].Games.Games_BetConstruct_Bet b with(NOLOCK) ON b.ID = s.InternalBetId
INNER JOIN [ProgressPlayDB].Games.Games_PlayedGameActions pga with(NOLOCK) ON pga.ID = b.PlayedGameActionID
INNER JOIN [ProgressPlayDB].Games.Games_PlayedGames pg with(NOLOCK) ON pg.ID = pga.PlayedGameID
inner join [ProgressPlayDB].common.tbl_Players p with(NOLOCK) ON p.player_id = b.PlayerID
inner join [ProgressPlayDB].common.tbl_Currencies c with(NOLOCK) ON p.currency_id = c.currency_id

WHERE s.UpdatedDate >= @date_from
AND s.UpdatedDate >= DATEADD(day, -1, CONVERT(date, GETUTCDATE()) )
AND b.BetState != 1
UNION ALL
select
pg.[ID], pg.[GameID], pg.[PlayerID], pg.[TotalBet] * c.rate_in_EUR AS TotalBet, pg.[TotalBetRealMoney] * c.rate_in_EUR AS TotalBetAccount, pg.[TotalBetBonus] * c.rate_in_EUR AS TotalBetBonus, pg.[TotalWin] * c.rate_in_EUR AS TotalWin, pg.[TotalWinRealMoney] * c.rate_in_EUR AS TotalWinAccount, pg.[TotalWinBonus] * c.rate_in_EUR AS TotalWinBonus, pg.[RoundID], pg.[GameStatus], pg.[CurrencyID], pg.[CreationDate], pg.[UpdatedDate], pg.[RealMoneyBalance] * c.rate_in_EUR AS AccountBalance, pg.[BonusBalance] * c.rate_in_EUR AS BonusBalance, 
b.BetId, b.BetState, b.BetType, b.OddType, b.Source, b.TotalPrice, s.ID AS BetSelectionID, s.InternalBetId, s.IsLive, s.IsOutright, s.SelectionId, s.SelectionName, s.SportId, s.RegionId, s.MatchId, s.CompetitionId, s.MarketTypeId, s.MatchInfo, s.MatchStartDate, s.Price, s.UpdatedDate
from [ProgressPlayDB].Games.Games_BetConstruct_Bet_Selection s with(nolock)
left join [ProgressPlayDB].Games.Games_BetConstruct_Bet b with(NOLOCK) ON b.ID = s.InternalBetId
INNER JOIN [ProgressPlayDB].Games.OngoingGameActions pga with(NOLOCK) ON pga.ID = b.PlayedGameActionID
INNER JOIN [ProgressPlayDB].Games.OngoingGames pg with(NOLOCK) ON pg.ID = pga.OngoingGameID
inner join [ProgressPlayDB].common.tbl_Players p with(NOLOCK) ON p.player_id = b.PlayerID
inner join [ProgressPlayDB].common.tbl_Currencies c with(NOLOCK) ON p.currency_id = c.currency_id

WHERE s.UpdatedDate >= @date_from
AND s.UpdatedDate >= DATEADD(day, -1, CONVERT(date, GETUTCDATE()) )
AND b.BetState != 1
GO
/****** Object:  StoredProcedure [dbo].[stp_DailyActions]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

--IF OBJECT_ID('dbo.stp_DailyActions') IS NOT NULL 
--BEGIN
--DECLARE @backup VARCHAR(MAX) = 'stp_DailyActions_' + CONVERT(varchar(20),GETDATE(),120)
--EXEC sp_rename 'dbo.stp_DailyActions', @backup
--END
--GO

CREATE   PROCEDURE [dbo].[stp_DailyActions]

AS
BEGIN

DECLARE @rows		INT
DECLARE @now		DATETIME = GETUTCDATE()
DECLARE @fromdate	DATE
DECLARE	@todate		DATE
DECLARE @fromid	BIGINT
DECLARE	@toid		BIGINT

SELECT @fromdate = MAX(UpdatedDate)
FROM [DailyActionsDB].common.tbl_Daily_actions;

SELECT @fromid = MIN([ID])
FROM [ProgressPlayDB].common.tbl_Daily_actions
WHERE [UpdatedDate] >= @fromdate
OPTION(RECOMPILE);

SELECT TOP 1 @todate = UpdatedDate, @toid = ID
FROM [ProgressPlayDB].common.tbl_Daily_actions
ORDER BY ID DESC;
--SELECT @fromdate, @todate

--SELECT @fromid, @toid

SET @now = GETUTCDATE()

MERGE [DailyActionsDB].common.tbl_Daily_actions [TARGET]
USING  (	SELECT	pda.*
			FROM	[ProgressPlayDB].common.tbl_Daily_actions pda
			LEFT OUTER JOIN [DailyActionsDB].common.tbl_Daily_actions dda ON dda.ID = pda.ID 
			WHERE  dda.UpdatedDate is null 
				AND pda.[ID] BETWEEN @fromid and @toid
			UNION ALL
			SELECT	pda.*
			FROM	[ProgressPlayDB].common.tbl_Daily_actions pda --WITH (INDEX = [IX_tbl_Daily_actions_UpdatedDate])
			INNER JOIN [DailyActionsDB].common.tbl_Daily_actions dda ON dda.ID = pda.ID 
			WHERE pda.UpdatedDate >= @fromdate AND dda.UpdatedDate != pda.UpdatedDate
				AND pda.[ID] BETWEEN @fromid and @toid
       )	[SOURCE]
ON [TARGET].ID = [SOURCE].ID 
	AND [TARGET].ID >= @fromid
WHEN MATCHED THEN UPDATE SET
	[TARGET].FTD = [SOURCE].FTD,
	[TARGET].FTDA = [SOURCE].FTDA,
	[TARGET].Deposits = [SOURCE].Deposits,
	[TARGET].DepositsSport = [SOURCE].DepositsSport,
	[TARGET].DepositsLive = [SOURCE].DepositsLive,
	[TARGET].DepositsBingo = [SOURCE].DepositsBingo,
	[TARGET].CashoutRequests = [SOURCE].CashoutRequests,
	[TARGET].PaidCashouts = [SOURCE].PaidCashouts,
	[TARGET].Chargebacks = [SOURCE].Chargebacks,
	[TARGET].Voids = [SOURCE].Voids,
	[TARGET].ReverseChargebacks = [SOURCE].ReverseChargebacks,
	[TARGET].Bonuses = [SOURCE].Bonuses,
	[TARGET].BonusesSport = [SOURCE].BonusesSport,
	[TARGET].CollectedBonuses = [SOURCE].CollectedBonuses,
	[TARGET].ExpiredBonuses = [SOURCE].ExpiredBonuses,
	[TARGET].ClubPointsConversion = [SOURCE].ClubPointsConversion,
	[TARGET].BankRoll = [SOURCE].BankRoll,
	[TARGET].SideGamesBets = [SOURCE].SideGamesBets,
	[TARGET].SideGamesRefunds = [SOURCE].SideGamesRefunds,
	[TARGET].SideGamesWins = [SOURCE].SideGamesWins,
	[TARGET].JackpotContribution = [SOURCE].JackpotContribution,
	[TARGET].InsuranceContribution = [SOURCE].InsuranceContribution,
	[TARGET].Adjustments = ISNULL([SOURCE].Adjustments,0.00),
	[TARGET].AdjustmentsAdd = ISNULL([SOURCE].AdjustmentsAdd,0.00),
	[TARGET].ClearedBalance = ISNULL([SOURCE].ClearedBalance, 0.00),
	[TARGET].RevenueAdjustments = ISNULL([SOURCE].RevenueAdjustments, 0.00),
	[TARGET].RevenueAdjustmentsAdd = ISNULL([SOURCE].RevenueAdjustmentsAdd, 0.00),
	[TARGET].AdministrativeFee = ISNULL([SOURCE].AdministrativeFee, 0.00),
	[TARGET].AdministrativeFeeReturn = ISNULL([SOURCE].AdministrativeFeeReturn, 0.00),
	[TARGET].BetsReal = [SOURCE].BetsReal,
	[TARGET].RefundsReal = [SOURCE].RefundsReal,
	[TARGET].WinsReal = [SOURCE].WinsReal,
	[TARGET].BetsBonus = [SOURCE].BetsBonus,
	[TARGET].RefundsBonus = [SOURCE].RefundsBonus,
	[TARGET].WinsBonus = [SOURCE].WinsBonus,
	[TARGET].BetsSport = [SOURCE].BetsSport,
	[TARGET].RefundsSport = [SOURCE].RefundsSport,
	[TARGET].WinsSport = [SOURCE].WinsSport,
	[TARGET].BetsSportReal = [SOURCE].BetsSportReal,
	[TARGET].RefundsSportReal = [SOURCE].RefundsSportReal,
	[TARGET].WinsSportReal = [SOURCE].WinsSportReal,
	[TARGET].BetsSportBonus = [SOURCE].BetsSportBonus,
	[TARGET].RefundsSportBonus = [SOURCE].RefundsSportBonus,
	[TARGET].WinsSportBonus = [SOURCE].WinsSportBonus,
	[TARGET].BetsCasino = [SOURCE].BetsCasino,
	[TARGET].RefundsCasino = [SOURCE].RefundsCasino,
	[TARGET].WinsCasino = [SOURCE].WinsCasino,
	[TARGET].BetsCasinoReal = [SOURCE].BetsCasinoReal,
	[TARGET].RefundsCasinoReal = [SOURCE].RefundsCasinoReal,
	[TARGET].WinsCasinoReal = [SOURCE].WinsCasinoReal,
	[TARGET].BetsCasinoBonus = [SOURCE].BetsCasinoBonus,
	[TARGET].RefundsCasinoBonus = [SOURCE].RefundsCasinoBonus,
	[TARGET].WinsCasinoBonus = [SOURCE].WinsCasinoBonus,

	[TARGET].BetsLive = [SOURCE].BetsLive,
	[TARGET].RefundsLive = [SOURCE].RefundsLive,
	[TARGET].WinsLive = [SOURCE].WinsLive,
	[TARGET].BetsLiveReal = [SOURCE].BetsLiveReal,
	[TARGET].RefundsLiveReal = [SOURCE].RefundsLiveReal,
	[TARGET].WinsLiveReal = [SOURCE].WinsLiveReal,
	[TARGET].BetsLiveBonus = [SOURCE].BetsLiveBonus,
	[TARGET].RefundsLiveBonus = [SOURCE].RefundsLiveBonus,
	[TARGET].WinsLiveBonus = [SOURCE].WinsLiveBonus,

	[TARGET].BetsBingo = [SOURCE].BetsBingo,
	[TARGET].RefundsBingo = [SOURCE].RefundsBingo,
	[TARGET].WinsBingo = [SOURCE].WinsBingo,
	[TARGET].BetsBingoReal = [SOURCE].BetsBingoReal,
	[TARGET].RefundsBingoReal = [SOURCE].RefundsBingoReal,
	[TARGET].WinsBingoReal = [SOURCE].WinsBingoReal,
	[TARGET].BetsBingoBonus = [SOURCE].BetsBingoBonus,
	[TARGET].RefundsBingoBonus = [SOURCE].RefundsBingoBonus,
	[TARGET].WinsBingoBonus = [SOURCE].WinsBingoBonus,

	[TARGET].EUR2GBP = [SOURCE].EUR2GBP
WHEN NOT MATCHED BY TARGET THEN 
	INSERT( [ID],
			[Date], 
			WhiteLabelID, 
			PlayerID, 
			Registration, 
			FTD, 
			FTDA, 
			Deposits, 
			DepositsSport, 	
			DepositsLive, 	
			DepositsBingo, 	
			CashoutRequests, 
			PaidCashouts, 
			Chargebacks, 
			Voids, 
			ReverseChargebacks, 
			Bonuses, 
			BonusesSport, 
			CollectedBonuses, 
			ExpiredBonuses, 
			ClubPointsConversion, 
			BankRoll, 
			SideGamesBets, 
			SideGamesRefunds, 
			SideGamesWins, 
			JackpotContribution, 
			InsuranceContribution, 
			Adjustments, 
			AdjustmentsAdd, 
			ClearedBalance, 
			RevenueAdjustments, 
			RevenueAdjustmentsAdd, 
			UpdatedDate, 
			AdministrativeFee, 
			AdministrativeFeeReturn, 
			BetsReal, 
			RefundsReal, 
			WinsReal, 
			BetsBonus, 
			RefundsBonus, 
			WinsBonus,
			BetsSport,
			RefundsSport,
			WinsSport,
			BetsSportReal,
			RefundsSportReal,
			WinsSportReal,
			BetsSportBonus,
			RefundsSportBonus,
			WinsSportBonus,
			BetsCasino,
			RefundsCasino,
			WinsCasino,
			BetsCasinoReal,
			RefundsCasinoReal,
			WinsCasinoReal,
			BetsCasinoBonus,
			RefundsCasinoBonus,
			WinsCasinoBonus,

			BetsLive,
			RefundsLive,
			WinsLive,
			BetsLiveReal,
			RefundsLiveReal,
			WinsLiveReal,
			BetsLiveBonus,
			RefundsLiveBonus,
			WinsLiveBonus,

			BetsBingo,
			RefundsBingo,
			WinsBingo,
			BetsBingoReal,
			RefundsBingoReal,
			WinsBingoReal,
			BetsBingoBonus,
			RefundsBingoBonus,
			WinsBingoBonus,

			EUR2GBP)
  VALUES(	[SOURCE].[ID],
			[SOURCE].[Date], 
			[SOURCE].WhiteLabelID, 
			[SOURCE].PlayerID, 
			[SOURCE].Registration, 
			[SOURCE].FTD, 
			[SOURCE].FTDA, 
			[SOURCE].Deposits, 
			[SOURCE].DepositsSport, 
			[SOURCE].DepositsLive, 
			[SOURCE].DepositsBingo, 
			[SOURCE].CashoutRequests, 
			[SOURCE].PaidCashouts, 
			[SOURCE].Chargebacks, 
			[SOURCE].Voids, 
			[SOURCE].ReverseChargebacks, 
			[SOURCE].Bonuses,
			[SOURCE].BonusesSport,
			[SOURCE].CollectedBonuses, 
			[SOURCE].ExpiredBonuses, 
			[SOURCE].ClubPointsConversion, 
			[SOURCE].BankRoll, 
			[SOURCE].SideGamesBets, 
			[SOURCE].SideGamesRefunds, 
			[SOURCE].SideGamesWins, 
			[SOURCE].JackpotContribution, 
			[SOURCE].InsuranceContribution, 
			ISNULL([SOURCE].Adjustments,0.00), 
			ISNULL([SOURCE].AdjustmentsAdd,0.00),
			ISNULL([SOURCE].ClearedBalance, 0.00), 
			ISNULL([SOURCE].RevenueAdjustments, 0.00),
			ISNULL([SOURCE].RevenueAdjustmentsAdd, 0.00), 
			[SOURCE].UpdatedDate, 
			ISNULL([SOURCE].AdministrativeFee, 0.00),
			ISNULL([SOURCE].AdministrativeFeeReturn, 0.00),
			[SOURCE].BetsReal, 
			[SOURCE].RefundsReal, 
			[SOURCE].WinsReal, 
			[SOURCE].BetsBonus,
			[SOURCE].RefundsBonus, 
			[SOURCE].WinsBonus,
			[SOURCE].BetsSport,
			[SOURCE].RefundsSport,
			[SOURCE].WinsSport,
			[SOURCE].BetsSportReal,
			[SOURCE].RefundsSportReal,
			[SOURCE].WinsSportReal,
			[SOURCE].BetsSportBonus,
			[SOURCE].RefundsSportBonus,
			[SOURCE].WinsSportBonus,
			[SOURCE].BetsCasino,
			[SOURCE].RefundsCasino,
			[SOURCE].WinsCasino,
			[SOURCE].BetsCasinoReal,
			[SOURCE].RefundsCasinoReal,
			[SOURCE].WinsCasinoReal,
			[SOURCE].BetsCasinoBonus,
			[SOURCE].RefundsCasinoBonus,
			[SOURCE].WinsCasinoBonus,

			[SOURCE].BetsLive,
			[SOURCE].RefundsLive,
			[SOURCE].WinsLive,
			[SOURCE].BetsLiveReal,
			[SOURCE].RefundsLiveReal,
			[SOURCE].WinsLiveReal,
			[SOURCE].BetsLiveBonus,
			[SOURCE].RefundsLiveBonus,
			[SOURCE].WinsLiveBonus,

			[SOURCE].BetsBingo,
			[SOURCE].RefundsBingo,
			[SOURCE].WinsBingo,
			[SOURCE].BetsBingoReal,
			[SOURCE].RefundsBingoReal,
			[SOURCE].WinsBingoReal,
			[SOURCE].BetsBingoBonus,
			[SOURCE].RefundsBingoBonus,
			[SOURCE].WinsBingoBonus,

			EUR2GBP
  );



	SET @rows = @@ROWCOUNT

	INSERT INTO [DailyActionsDB].common.tbl_Daily_log 
	(ProcName, StartTime, EndTime, RowsStartTime, RowsEndTime, RowsAmount)
	SELECT OBJECT_NAME(@@PROCID), @now, GETUTCDATE(), @fromdate,@todate, @rows







	SET @now = GETUTCDATE()

	SELECT @fromdate = MAX(UpdatedDate)
	FROM [DailyActionsDB].common.tbl_Daily_actions_EUR;

	SELECT @fromid = MIN([ID])
	FROM [ProgressPlayDB].common.tbl_Daily_actions_EUR
	WHERE [UpdatedDate] >= @fromdate
	OPTION(RECOMPILE);

	SELECT TOP 1 @todate = UpdatedDate, @toid = ID
	FROM [ProgressPlayDB].common.tbl_Daily_actions_EUR
	ORDER BY ID DESC;

	
	MERGE [DailyActionsDB].common.tbl_Daily_actions_EUR [TARGET]
	USING  (	SELECT	pda.*
				FROM	[ProgressPlayDB].common.tbl_Daily_actions_EUR pda
				LEFT OUTER JOIN [DailyActionsDB].common.tbl_Daily_actions_EUR dda ON dda.ID = pda.ID 
				WHERE  dda.UpdatedDate is null 
					AND pda.[ID] BETWEEN @fromid and @toid
				UNION ALL
				SELECT	pda.*
				FROM	[ProgressPlayDB].common.tbl_Daily_actions_EUR pda --WITH (INDEX = [IX_tbl_Daily_actions_UpdatedDate])
				INNER JOIN [DailyActionsDB].common.tbl_Daily_actions_EUR dda ON dda.ID = pda.ID 
				WHERE pda.UpdatedDate >= @fromdate AND dda.UpdatedDate != pda.UpdatedDate
					AND pda.[ID] BETWEEN @fromid and @toid
		   )	[SOURCE]
	ON [TARGET].ID = [SOURCE].ID 
		AND [TARGET].ID >= @fromid
	WHEN MATCHED THEN UPDATE SET
		[TARGET].FTD = [SOURCE].FTD,
		[TARGET].FTDA = [SOURCE].FTDA,
		[TARGET].Deposits = [SOURCE].Deposits,
		[TARGET].DepositsSport = [SOURCE].DepositsSport,
		[TARGET].DepositsLive = [SOURCE].DepositsLive,
		[TARGET].DepositsBingo = [SOURCE].DepositsBingo,
		[TARGET].CashoutRequests = [SOURCE].CashoutRequests,
		[TARGET].PaidCashouts = [SOURCE].PaidCashouts,
		[TARGET].Chargebacks = [SOURCE].Chargebacks,
		[TARGET].Voids = [SOURCE].Voids,
		[TARGET].ReverseChargebacks = [SOURCE].ReverseChargebacks,
		[TARGET].Bonuses = [SOURCE].Bonuses,
		[TARGET].BonusesSport = [SOURCE].BonusesSport,
		[TARGET].CollectedBonuses = [SOURCE].CollectedBonuses,
		[TARGET].ExpiredBonuses = [SOURCE].ExpiredBonuses,
		[TARGET].ClubPointsConversion = [SOURCE].ClubPointsConversion,
		[TARGET].BankRoll = [SOURCE].BankRoll,
		[TARGET].SideGamesBets = [SOURCE].SideGamesBets,
		[TARGET].SideGamesRefunds = [SOURCE].SideGamesRefunds,
		[TARGET].SideGamesWins = [SOURCE].SideGamesWins,
		[TARGET].JackpotContribution = [SOURCE].JackpotContribution,
		[TARGET].InsuranceContribution = [SOURCE].InsuranceContribution,
		[TARGET].Adjustments = ISNULL([SOURCE].Adjustments,0.00),
		[TARGET].AdjustmentsAdd = ISNULL([SOURCE].AdjustmentsAdd,0.00),
		[TARGET].ClearedBalance = ISNULL([SOURCE].ClearedBalance, 0.00),
		[TARGET].RevenueAdjustments = ISNULL([SOURCE].RevenueAdjustments, 0.00),
		[TARGET].RevenueAdjustmentsAdd = ISNULL([SOURCE].RevenueAdjustmentsAdd, 0.00),
		[TARGET].AdministrativeFee = ISNULL([SOURCE].AdministrativeFee, 0.00),
		[TARGET].AdministrativeFeeReturn = ISNULL([SOURCE].AdministrativeFeeReturn, 0.00),
		[TARGET].BetsReal = [SOURCE].BetsReal,
		[TARGET].RefundsReal = [SOURCE].RefundsReal,
		[TARGET].WinsReal = [SOURCE].WinsReal,
		[TARGET].BetsBonus = [SOURCE].BetsBonus,
		[TARGET].RefundsBonus = [SOURCE].RefundsBonus,
		[TARGET].WinsBonus = [SOURCE].WinsBonus,
		[TARGET].BetsSport = [SOURCE].BetsSport,
		[TARGET].RefundsSport = [SOURCE].RefundsSport,
		[TARGET].WinsSport = [SOURCE].WinsSport,
		[TARGET].BetsSportReal = [SOURCE].BetsSportReal,
		[TARGET].RefundsSportReal = [SOURCE].RefundsSportReal,
		[TARGET].WinsSportReal = [SOURCE].WinsSportReal,
		[TARGET].BetsSportBonus = [SOURCE].BetsSportBonus,
		[TARGET].RefundsSportBonus = [SOURCE].RefundsSportBonus,
		[TARGET].WinsSportBonus = [SOURCE].WinsSportBonus,
		[TARGET].BetsCasino = [SOURCE].BetsCasino,
		[TARGET].RefundsCasino = [SOURCE].RefundsCasino,
		[TARGET].WinsCasino = [SOURCE].WinsCasino,
		[TARGET].BetsCasinoReal = [SOURCE].BetsCasinoReal,
		[TARGET].RefundsCasinoReal = [SOURCE].RefundsCasinoReal,
		[TARGET].WinsCasinoReal = [SOURCE].WinsCasinoReal,
		[TARGET].BetsCasinoBonus = [SOURCE].BetsCasinoBonus,
		[TARGET].RefundsCasinoBonus = [SOURCE].RefundsCasinoBonus,
		[TARGET].WinsCasinoBonus = [SOURCE].WinsCasinoBonus,

		[TARGET].BetsLive = [SOURCE].BetsLive,
		[TARGET].RefundsLive = [SOURCE].RefundsLive,
		[TARGET].WinsLive = [SOURCE].WinsLive,
		[TARGET].BetsLiveReal = [SOURCE].BetsLiveReal,
		[TARGET].RefundsLiveReal = [SOURCE].RefundsLiveReal,
		[TARGET].WinsLiveReal = [SOURCE].WinsLiveReal,
		[TARGET].BetsLiveBonus = [SOURCE].BetsLiveBonus,
		[TARGET].RefundsLiveBonus = [SOURCE].RefundsLiveBonus,
		[TARGET].WinsLiveBonus = [SOURCE].WinsLiveBonus,

		[TARGET].BetsBingo = [SOURCE].BetsBingo,
		[TARGET].RefundsBingo = [SOURCE].RefundsBingo,
		[TARGET].WinsBingo = [SOURCE].WinsBingo,
		[TARGET].BetsBingoReal = [SOURCE].BetsBingoReal,
		[TARGET].RefundsBingoReal = [SOURCE].RefundsBingoReal,
		[TARGET].WinsBingoReal = [SOURCE].WinsBingoReal,
		[TARGET].BetsBingoBonus = [SOURCE].BetsBingoBonus,
		[TARGET].RefundsBingoBonus = [SOURCE].RefundsBingoBonus,
		[TARGET].WinsBingoBonus = [SOURCE].WinsBingoBonus,


		[TARGET].EUR2GBP = [SOURCE].EUR2GBP
	WHEN NOT MATCHED BY TARGET THEN 
		INSERT( [ID],
				[Date], 
				WhiteLabelID, 
				PlayerID, 
				Registration, 
				FTD, 
				FTDA, 
				Deposits, 
				DepositsSport, 	
				DepositsLive, 	
				DepositsBingo, 	
				CashoutRequests, 
				PaidCashouts, 
				Chargebacks, 
				Voids, 
				ReverseChargebacks, 
				Bonuses, 
				BonusesSport, 
				CollectedBonuses, 
				ExpiredBonuses, 
				ClubPointsConversion, 
				BankRoll, 
				SideGamesBets, 
				SideGamesRefunds, 
				SideGamesWins, 
				JackpotContribution, 
				InsuranceContribution, 
				Adjustments, 
				AdjustmentsAdd, 
				ClearedBalance, 
				RevenueAdjustments, 
				RevenueAdjustmentsAdd, 
				UpdatedDate, 
				AdministrativeFee, 
				AdministrativeFeeReturn, 
				BetsReal, 
				RefundsReal, 
				WinsReal, 
				BetsBonus, 
				RefundsBonus, 
				WinsBonus,
				BetsSport,
				RefundsSport,
				WinsSport,
				BetsSportReal,
				RefundsSportReal,
				WinsSportReal,
				BetsSportBonus,
				RefundsSportBonus,
				WinsSportBonus,
				BetsCasino,
				RefundsCasino,
				WinsCasino,
				BetsCasinoReal,
				RefundsCasinoReal,
				WinsCasinoReal,
				BetsCasinoBonus,
				RefundsCasinoBonus,
				WinsCasinoBonus,

				BetsLive,
				RefundsLive,
				WinsLive,
				BetsLiveReal,
				RefundsLiveReal,
				WinsLiveReal,
				BetsLiveBonus,
				RefundsLiveBonus,
				WinsLiveBonus,

				BetsBingo,
				RefundsBingo,
				WinsBingo,
				BetsBingoReal,
				RefundsBingoReal,
				WinsBingoReal,
				BetsBingoBonus,
				RefundsBingoBonus,
				WinsBingoBonus,

				EUR2GBP)
	  VALUES(	[SOURCE].[ID],
				[SOURCE].[Date], 
				[SOURCE].WhiteLabelID, 
				[SOURCE].PlayerID, 
				[SOURCE].Registration, 
				[SOURCE].FTD, 
				[SOURCE].FTDA, 
				[SOURCE].Deposits, 
				[SOURCE].DepositsSport, 
				[SOURCE].DepositsLive, 
				[SOURCE].DepositsBingo, 
				[SOURCE].CashoutRequests, 
				[SOURCE].PaidCashouts, 
				[SOURCE].Chargebacks, 
				[SOURCE].Voids, 
				[SOURCE].ReverseChargebacks, 
				[SOURCE].Bonuses,
				[SOURCE].BonusesSport,
				[SOURCE].CollectedBonuses, 
				[SOURCE].ExpiredBonuses, 
				[SOURCE].ClubPointsConversion, 
				[SOURCE].BankRoll, 
				[SOURCE].SideGamesBets, 
				[SOURCE].SideGamesRefunds, 
				[SOURCE].SideGamesWins, 
				[SOURCE].JackpotContribution, 
				[SOURCE].InsuranceContribution, 
				ISNULL([SOURCE].Adjustments,0.00), 
				ISNULL([SOURCE].AdjustmentsAdd,0.00),
				ISNULL([SOURCE].ClearedBalance, 0.00), 
				ISNULL([SOURCE].RevenueAdjustments, 0.00),
				ISNULL([SOURCE].RevenueAdjustmentsAdd, 0.00), 
				[SOURCE].UpdatedDate, 
				ISNULL([SOURCE].AdministrativeFee, 0.00),
				ISNULL([SOURCE].AdministrativeFeeReturn, 0.00),
				[SOURCE].BetsReal, 
				[SOURCE].RefundsReal, 
				[SOURCE].WinsReal, 
				[SOURCE].BetsBonus,
				[SOURCE].RefundsBonus, 
				[SOURCE].WinsBonus,
				[SOURCE].BetsSport,
				[SOURCE].RefundsSport,
				[SOURCE].WinsSport,
				[SOURCE].BetsSportReal,
				[SOURCE].RefundsSportReal,
				[SOURCE].WinsSportReal,
				[SOURCE].BetsSportBonus,
				[SOURCE].RefundsSportBonus,
				[SOURCE].WinsSportBonus,
				[SOURCE].BetsCasino,
				[SOURCE].RefundsCasino,
				[SOURCE].WinsCasino,
				[SOURCE].BetsCasinoReal,
				[SOURCE].RefundsCasinoReal,
				[SOURCE].WinsCasinoReal,
				[SOURCE].BetsCasinoBonus,
				[SOURCE].RefundsCasinoBonus,
				[SOURCE].WinsCasinoBonus,

				[SOURCE].BetsLive,
				[SOURCE].RefundsLive,
				[SOURCE].WinsLive,
				[SOURCE].BetsLiveReal,
				[SOURCE].RefundsLiveReal,
				[SOURCE].WinsLiveReal,
				[SOURCE].BetsLiveBonus,
				[SOURCE].RefundsLiveBonus,
				[SOURCE].WinsLiveBonus,

				[SOURCE].BetsBingo,
				[SOURCE].RefundsBingo,
				[SOURCE].WinsBingo,
				[SOURCE].BetsBingoReal,
				[SOURCE].RefundsBingoReal,
				[SOURCE].WinsBingoReal,
				[SOURCE].BetsBingoBonus,
				[SOURCE].RefundsBingoBonus,
				[SOURCE].WinsBingoBonus,

				EUR2GBP
	  );

	SET @rows = @@ROWCOUNT

	INSERT INTO [DailyActionsDB].common.tbl_Daily_log 
	(ProcName, StartTime, EndTime, RowsStartTime, RowsEndTime, RowsAmount)
	SELECT OBJECT_NAME(@@PROCID) + '_EUR', @now, GETUTCDATE(), @fromdate,@todate, @rows


END
GO
/****** Object:  StoredProcedure [dbo].[stp_DailyActions_2023-10-17 11:17:40]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



CREATE   PROCEDURE [dbo].[stp_DailyActions_2023-10-17 11:17:40]

AS
BEGIN

DECLARE @rows		INT
DECLARE @now		DATETIME = GETUTCDATE()
DECLARE @fromdate	DATE
DECLARE	@todate		DATE

SELECT @fromdate = MAX(UpdatedDate)
FROM [DailyActionsDB].common.tbl_Daily_actions

SELECT @todate = UpdatedDate
FROM [ProgressPlayDB].common.tbl_Daily_actions
WHERE ID = (SELECT MAX(ID) FROM [ProgressPlayDB].common.tbl_Daily_actions)
--SELECT @fromdate, @todate

SET @now = GETUTCDATE()

MERGE [DailyActionsDB].common.tbl_Daily_actions [TARGET]
USING  (	SELECT	pda.*
			FROM	[ProgressPlayDB].common.tbl_Daily_actions pda
			LEFT OUTER JOIN [DailyActionsDB].common.tbl_Daily_actions dda ON dda.ID = pda.ID 
			WHERE  dda.UpdatedDate is null 
			UNION ALL
			SELECT	pda.*
			FROM	[ProgressPlayDB].common.tbl_Daily_actions pda --WITH (INDEX = [IX_tbl_Daily_actions_UpdatedDate])
			INNER JOIN [DailyActionsDB].common.tbl_Daily_actions dda ON dda.ID = pda.ID 
			WHERE pda.UpdatedDate >= @fromdate AND dda.UpdatedDate != pda.UpdatedDate
       )	[SOURCE]
ON [TARGET].ID = [SOURCE].ID 
WHEN MATCHED THEN UPDATE SET
	[TARGET].FTD = [SOURCE].FTD,
	[TARGET].FTDA = [SOURCE].FTDA,
	[TARGET].Deposits = [SOURCE].Deposits,
	[TARGET].DepositsSport = [SOURCE].DepositsSport,
	[TARGET].CashoutRequests = [SOURCE].CashoutRequests,
	[TARGET].PaidCashouts = [SOURCE].PaidCashouts,
	[TARGET].Chargebacks = [SOURCE].Chargebacks,
	[TARGET].Voids = [SOURCE].Voids,
	[TARGET].ReverseChargebacks = [SOURCE].ReverseChargebacks,
	[TARGET].Bonuses = [SOURCE].Bonuses,
	[TARGET].BonusesSport = [SOURCE].BonusesSport,
	[TARGET].CollectedBonuses = [SOURCE].CollectedBonuses,
	[TARGET].ExpiredBonuses = [SOURCE].ExpiredBonuses,
	[TARGET].ClubPointsConversion = [SOURCE].ClubPointsConversion,
	[TARGET].BankRoll = [SOURCE].BankRoll,
	[TARGET].SideGamesBets = [SOURCE].SideGamesBets,
	[TARGET].SideGamesRefunds = [SOURCE].SideGamesRefunds,
	[TARGET].SideGamesWins = [SOURCE].SideGamesWins,
	[TARGET].JackpotContribution = [SOURCE].JackpotContribution,
	[TARGET].InsuranceContribution = [SOURCE].InsuranceContribution,
	[TARGET].Adjustments = ISNULL([SOURCE].Adjustments,0.00),
	[TARGET].AdjustmentsAdd = ISNULL([SOURCE].AdjustmentsAdd,0.00),
	[TARGET].ClearedBalance = ISNULL([SOURCE].ClearedBalance, 0.00),
	[TARGET].RevenueAdjustments = ISNULL([SOURCE].RevenueAdjustments, 0.00),
	[TARGET].RevenueAdjustmentsAdd = ISNULL([SOURCE].RevenueAdjustmentsAdd, 0.00),
	[TARGET].AdministrativeFee = ISNULL([SOURCE].AdministrativeFee, 0.00),
	[TARGET].AdministrativeFeeReturn = ISNULL([SOURCE].AdministrativeFeeReturn, 0.00),
	[TARGET].BetsReal = [SOURCE].BetsReal,
	[TARGET].RefundsReal = [SOURCE].RefundsReal,
	[TARGET].WinsReal = [SOURCE].WinsReal,
	[TARGET].BetsBonus = [SOURCE].BetsBonus,
	[TARGET].RefundsBonus = [SOURCE].RefundsBonus,
	[TARGET].WinsBonus = [SOURCE].WinsBonus,
	[TARGET].BetsSport = [SOURCE].BetsSport,
	[TARGET].RefundsSport = [SOURCE].RefundsSport,
	[TARGET].WinsSport = [SOURCE].WinsSport,
	[TARGET].BetsSportReal = [SOURCE].BetsSportReal,
	[TARGET].RefundsSportReal = [SOURCE].RefundsSportReal,
	[TARGET].WinsSportReal = [SOURCE].WinsSportReal,
	[TARGET].BetsSportBonus = [SOURCE].BetsSportBonus,
	[TARGET].RefundsSportBonus = [SOURCE].RefundsSportBonus,
	[TARGET].WinsSportBonus = [SOURCE].WinsSportBonus,
	[TARGET].BetsCasino = [SOURCE].BetsCasino,
	[TARGET].RefundsCasino = [SOURCE].RefundsCasino,
	[TARGET].WinsCasino = [SOURCE].WinsCasino,
	[TARGET].BetsCasinoReal = [SOURCE].BetsCasinoReal,
	[TARGET].RefundsCasinoReal = [SOURCE].RefundsCasinoReal,
	[TARGET].WinsCasinoReal = [SOURCE].WinsCasinoReal,
	[TARGET].BetsCasinoBonus = [SOURCE].BetsCasinoBonus,
	[TARGET].RefundsCasinoBonus = [SOURCE].RefundsCasinoBonus,
	[TARGET].WinsCasinoBonus = [SOURCE].WinsCasinoBonus,
	[TARGET].EUR2GBP = [SOURCE].EUR2GBP
WHEN NOT MATCHED BY TARGET THEN 
	INSERT( [ID],
			[Date], 
			WhiteLabelID, 
			PlayerID, 
			Registration, 
			FTD, 
			FTDA, 
			Deposits, 
			DepositsSport, 	
			CashoutRequests, 
			PaidCashouts, 
			Chargebacks, 
			Voids, 
			ReverseChargebacks, 
			Bonuses, 
			BonusesSport, 
			CollectedBonuses, 
			ExpiredBonuses, 
			ClubPointsConversion, 
			BankRoll, 
			SideGamesBets, 
			SideGamesRefunds, 
			SideGamesWins, 
			JackpotContribution, 
			InsuranceContribution, 
			Adjustments, 
			AdjustmentsAdd, 
			ClearedBalance, 
			RevenueAdjustments, 
			RevenueAdjustmentsAdd, 
			UpdatedDate, 
			AdministrativeFee, 
			AdministrativeFeeReturn, 
			BetsReal, 
			RefundsReal, 
			WinsReal, 
			BetsBonus, 
			RefundsBonus, 
			WinsBonus,
			BetsSport,
			RefundsSport,
			WinsSport,
			BetsSportReal,
			RefundsSportReal,
			WinsSportReal,
			BetsSportBonus,
			RefundsSportBonus,
			WinsSportBonus,
			BetsCasino,
			RefundsCasino,
			WinsCasino,
			BetsCasinoReal,
			RefundsCasinoReal,
			WinsCasinoReal,
			BetsCasinoBonus,
			RefundsCasinoBonus,
			WinsCasinoBonus,
			EUR2GBP)
  VALUES(	[SOURCE].[ID],
			[SOURCE].[Date], 
			[SOURCE].WhiteLabelID, 
			[SOURCE].PlayerID, 
			[SOURCE].Registration, 
			[SOURCE].FTD, 
			[SOURCE].FTDA, 
			[SOURCE].Deposits, 
			[SOURCE].DepositsSport, 
			[SOURCE].CashoutRequests, 
			[SOURCE].PaidCashouts, 
			[SOURCE].Chargebacks, 
			[SOURCE].Voids, 
			[SOURCE].ReverseChargebacks, 
			[SOURCE].Bonuses,
			[SOURCE].BonusesSport,
			[SOURCE].CollectedBonuses, 
			[SOURCE].ExpiredBonuses, 
			[SOURCE].ClubPointsConversion, 
			[SOURCE].BankRoll, 
			[SOURCE].SideGamesBets, 
			[SOURCE].SideGamesRefunds, 
			[SOURCE].SideGamesWins, 
			[SOURCE].JackpotContribution, 
			[SOURCE].InsuranceContribution, 
			ISNULL([SOURCE].Adjustments,0.00), 
			ISNULL([SOURCE].AdjustmentsAdd,0.00),
			ISNULL([SOURCE].ClearedBalance, 0.00), 
			ISNULL([SOURCE].RevenueAdjustments, 0.00),
			ISNULL([SOURCE].RevenueAdjustmentsAdd, 0.00), 
			[SOURCE].UpdatedDate, 
			ISNULL([SOURCE].AdministrativeFee, 0.00),
			ISNULL([SOURCE].AdministrativeFeeReturn, 0.00),
			[SOURCE].BetsReal, 
			[SOURCE].RefundsReal, 
			[SOURCE].WinsReal, 
			[SOURCE].BetsBonus,
			[SOURCE].RefundsBonus, 
			[SOURCE].WinsBonus,
			[SOURCE].BetsSport,
			[SOURCE].RefundsSport,
			[SOURCE].WinsSport,
			[SOURCE].BetsSportReal,
			[SOURCE].RefundsSportReal,
			[SOURCE].WinsSportReal,
			[SOURCE].BetsSportBonus,
			[SOURCE].RefundsSportBonus,
			[SOURCE].WinsSportBonus,
			[SOURCE].BetsCasino,
			[SOURCE].RefundsCasino,
			[SOURCE].WinsCasino,
			[SOURCE].BetsCasinoReal,
			[SOURCE].RefundsCasinoReal,
			[SOURCE].WinsCasinoReal,
			[SOURCE].BetsCasinoBonus,
			[SOURCE].RefundsCasinoBonus,
			[SOURCE].WinsCasinoBonus,
			EUR2GBP
  );



	SET @rows = @@ROWCOUNT

	INSERT INTO [DailyActionsDB].common.tbl_Daily_log 
	(ProcName, StartTime, EndTime, RowsStartTime, RowsEndTime, RowsAmount)
	SELECT OBJECT_NAME(@@PROCID), @now, GETUTCDATE(), @fromdate,@todate, @rows







	SET @now = GETUTCDATE()

	SELECT @fromdate = MAX(UpdatedDate)
	FROM [DailyActionsDB].common.tbl_Daily_actions_EUR

	SELECT @todate = UpdatedDate
	FROM [ProgressPlayDB].common.tbl_Daily_actions_EUR
	WHERE ID = (SELECT MAX(ID) FROM [ProgressPlayDB].common.tbl_Daily_actions_EUR)

	
	MERGE [DailyActionsDB].common.tbl_Daily_actions_EUR [TARGET]
	USING  (	SELECT	pda.*
				FROM	[ProgressPlayDB].common.tbl_Daily_actions_EUR pda
				LEFT OUTER JOIN [DailyActionsDB].common.tbl_Daily_actions_EUR dda ON dda.ID = pda.ID 
				WHERE  dda.UpdatedDate is null 
				UNION ALL
				SELECT	pda.*
				FROM	[ProgressPlayDB].common.tbl_Daily_actions_EUR pda --WITH (INDEX = [IX_tbl_Daily_actions_UpdatedDate])
				INNER JOIN [DailyActionsDB].common.tbl_Daily_actions_EUR dda ON dda.ID = pda.ID 
				WHERE pda.UpdatedDate >= @fromdate AND dda.UpdatedDate != pda.UpdatedDate
		   )	[SOURCE]
	ON [TARGET].ID = [SOURCE].ID 
	WHEN MATCHED THEN UPDATE SET
		[TARGET].FTD = [SOURCE].FTD,
		[TARGET].FTDA = [SOURCE].FTDA,
		[TARGET].Deposits = [SOURCE].Deposits,
		[TARGET].DepositsSport = [SOURCE].DepositsSport,
		[TARGET].CashoutRequests = [SOURCE].CashoutRequests,
		[TARGET].PaidCashouts = [SOURCE].PaidCashouts,
		[TARGET].Chargebacks = [SOURCE].Chargebacks,
		[TARGET].Voids = [SOURCE].Voids,
		[TARGET].ReverseChargebacks = [SOURCE].ReverseChargebacks,
		[TARGET].Bonuses = [SOURCE].Bonuses,
		[TARGET].BonusesSport = [SOURCE].BonusesSport,
		[TARGET].CollectedBonuses = [SOURCE].CollectedBonuses,
		[TARGET].ExpiredBonuses = [SOURCE].ExpiredBonuses,
		[TARGET].ClubPointsConversion = [SOURCE].ClubPointsConversion,
		[TARGET].BankRoll = [SOURCE].BankRoll,
		[TARGET].SideGamesBets = [SOURCE].SideGamesBets,
		[TARGET].SideGamesRefunds = [SOURCE].SideGamesRefunds,
		[TARGET].SideGamesWins = [SOURCE].SideGamesWins,
		[TARGET].JackpotContribution = [SOURCE].JackpotContribution,
		[TARGET].InsuranceContribution = [SOURCE].InsuranceContribution,
		[TARGET].Adjustments = ISNULL([SOURCE].Adjustments,0.00),
		[TARGET].AdjustmentsAdd = ISNULL([SOURCE].AdjustmentsAdd,0.00),
		[TARGET].ClearedBalance = ISNULL([SOURCE].ClearedBalance, 0.00),
		[TARGET].RevenueAdjustments = ISNULL([SOURCE].RevenueAdjustments, 0.00),
		[TARGET].RevenueAdjustmentsAdd = ISNULL([SOURCE].RevenueAdjustmentsAdd, 0.00),
		[TARGET].AdministrativeFee = ISNULL([SOURCE].AdministrativeFee, 0.00),
		[TARGET].AdministrativeFeeReturn = ISNULL([SOURCE].AdministrativeFeeReturn, 0.00),
		[TARGET].BetsReal = [SOURCE].BetsReal,
		[TARGET].RefundsReal = [SOURCE].RefundsReal,
		[TARGET].WinsReal = [SOURCE].WinsReal,
		[TARGET].BetsBonus = [SOURCE].BetsBonus,
		[TARGET].RefundsBonus = [SOURCE].RefundsBonus,
		[TARGET].WinsBonus = [SOURCE].WinsBonus,
		[TARGET].BetsSport = [SOURCE].BetsSport,
		[TARGET].RefundsSport = [SOURCE].RefundsSport,
		[TARGET].WinsSport = [SOURCE].WinsSport,
		[TARGET].BetsSportReal = [SOURCE].BetsSportReal,
		[TARGET].RefundsSportReal = [SOURCE].RefundsSportReal,
		[TARGET].WinsSportReal = [SOURCE].WinsSportReal,
		[TARGET].BetsSportBonus = [SOURCE].BetsSportBonus,
		[TARGET].RefundsSportBonus = [SOURCE].RefundsSportBonus,
		[TARGET].WinsSportBonus = [SOURCE].WinsSportBonus,
		[TARGET].BetsCasino = [SOURCE].BetsCasino,
		[TARGET].RefundsCasino = [SOURCE].RefundsCasino,
		[TARGET].WinsCasino = [SOURCE].WinsCasino,
		[TARGET].BetsCasinoReal = [SOURCE].BetsCasinoReal,
		[TARGET].RefundsCasinoReal = [SOURCE].RefundsCasinoReal,
		[TARGET].WinsCasinoReal = [SOURCE].WinsCasinoReal,
		[TARGET].BetsCasinoBonus = [SOURCE].BetsCasinoBonus,
		[TARGET].RefundsCasinoBonus = [SOURCE].RefundsCasinoBonus,
		[TARGET].WinsCasinoBonus = [SOURCE].WinsCasinoBonus,
		[TARGET].EUR2GBP = [SOURCE].EUR2GBP
	WHEN NOT MATCHED BY TARGET THEN 
		INSERT( [ID],
				[Date], 
				WhiteLabelID, 
				PlayerID, 
				Registration, 
				FTD, 
				FTDA, 
				Deposits, 
				DepositsSport, 	
				CashoutRequests, 
				PaidCashouts, 
				Chargebacks, 
				Voids, 
				ReverseChargebacks, 
				Bonuses, 
				BonusesSport, 
				CollectedBonuses, 
				ExpiredBonuses, 
				ClubPointsConversion, 
				BankRoll, 
				SideGamesBets, 
				SideGamesRefunds, 
				SideGamesWins, 
				JackpotContribution, 
				InsuranceContribution, 
				Adjustments, 
				AdjustmentsAdd, 
				ClearedBalance, 
				RevenueAdjustments, 
				RevenueAdjustmentsAdd, 
				UpdatedDate, 
				AdministrativeFee, 
				AdministrativeFeeReturn, 
				BetsReal, 
				RefundsReal, 
				WinsReal, 
				BetsBonus, 
				RefundsBonus, 
				WinsBonus,
				BetsSport,
				RefundsSport,
				WinsSport,
				BetsSportReal,
				RefundsSportReal,
				WinsSportReal,
				BetsSportBonus,
				RefundsSportBonus,
				WinsSportBonus,
				BetsCasino,
				RefundsCasino,
				WinsCasino,
				BetsCasinoReal,
				RefundsCasinoReal,
				WinsCasinoReal,
				BetsCasinoBonus,
				RefundsCasinoBonus,
				WinsCasinoBonus,
				EUR2GBP)
	  VALUES(	[SOURCE].[ID],
				[SOURCE].[Date], 
				[SOURCE].WhiteLabelID, 
				[SOURCE].PlayerID, 
				[SOURCE].Registration, 
				[SOURCE].FTD, 
				[SOURCE].FTDA, 
				[SOURCE].Deposits, 
				[SOURCE].DepositsSport, 
				[SOURCE].CashoutRequests, 
				[SOURCE].PaidCashouts, 
				[SOURCE].Chargebacks, 
				[SOURCE].Voids, 
				[SOURCE].ReverseChargebacks, 
				[SOURCE].Bonuses,
				[SOURCE].BonusesSport,
				[SOURCE].CollectedBonuses, 
				[SOURCE].ExpiredBonuses, 
				[SOURCE].ClubPointsConversion, 
				[SOURCE].BankRoll, 
				[SOURCE].SideGamesBets, 
				[SOURCE].SideGamesRefunds, 
				[SOURCE].SideGamesWins, 
				[SOURCE].JackpotContribution, 
				[SOURCE].InsuranceContribution, 
				ISNULL([SOURCE].Adjustments,0.00), 
				ISNULL([SOURCE].AdjustmentsAdd,0.00),
				ISNULL([SOURCE].ClearedBalance, 0.00), 
				ISNULL([SOURCE].RevenueAdjustments, 0.00),
				ISNULL([SOURCE].RevenueAdjustmentsAdd, 0.00), 
				[SOURCE].UpdatedDate, 
				ISNULL([SOURCE].AdministrativeFee, 0.00),
				ISNULL([SOURCE].AdministrativeFeeReturn, 0.00),
				[SOURCE].BetsReal, 
				[SOURCE].RefundsReal, 
				[SOURCE].WinsReal, 
				[SOURCE].BetsBonus,
				[SOURCE].RefundsBonus, 
				[SOURCE].WinsBonus,
				[SOURCE].BetsSport,
				[SOURCE].RefundsSport,
				[SOURCE].WinsSport,
				[SOURCE].BetsSportReal,
				[SOURCE].RefundsSportReal,
				[SOURCE].WinsSportReal,
				[SOURCE].BetsSportBonus,
				[SOURCE].RefundsSportBonus,
				[SOURCE].WinsSportBonus,
				[SOURCE].BetsCasino,
				[SOURCE].RefundsCasino,
				[SOURCE].WinsCasino,
				[SOURCE].BetsCasinoReal,
				[SOURCE].RefundsCasinoReal,
				[SOURCE].WinsCasinoReal,
				[SOURCE].BetsCasinoBonus,
				[SOURCE].RefundsCasinoBonus,
				[SOURCE].WinsCasinoBonus,
				EUR2GBP
	  )
	  OPTION(MAXDOP 2);

	SET @rows = @@ROWCOUNT

	INSERT INTO [DailyActionsDB].common.tbl_Daily_log 
	(ProcName, StartTime, EndTime, RowsStartTime, RowsEndTime, RowsAmount)
	SELECT OBJECT_NAME(@@PROCID) + '_EUR', @now, GETUTCDATE(), @fromdate,@todate, @rows


END
GO
/****** Object:  StoredProcedure [dbo].[stp_DailyActions_Games]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[stp_DailyActions_Games]

AS
BEGIN

SET NOCOUNT ON;

DECLARE	@from_date	DATETIME
DECLARE	@to_date	DATETIME
DECLARE @rows		INT
DECLARE @now		DATETIME
DECLARE @msg		NVARCHAR(4000)

SELECT @from_date = ISNULL(MAX(GameDate),CAST(GETUTCDATE() AS DATE))
FROM [DailyActionsDB].[common].[tbl_Daily_actions_EUR_games] WITH(NOLOCK)

--SELECT @from_date,@to_date

WHILE @from_date < DATEADD(day, 1, CONVERT(date, GETUTCDATE()))
BEGIN
SET @now = GETUTCDATE()
SET @to_date = DATEADD(DAY,1,@from_date)
SET @msg = CONCAT(CONVERT(varchar(19),@now,121), ' - archiving from ', CONVERT(varchar(10), @from_date, 121), ' to ', CONVERT(varchar(10), @to_date, 121))

RAISERROR(@msg, 0, 1) WITH NOWAIT;

IF OBJECT_ID ('tempdb..#Stats') IS NOT NULL
	DROP TABLE #Stats

SELECT UpdatedDate AS GameDate,
	PlayerID,
	GameID,
	SUM(RealBetAmount ) AS RealBetAmount,
	SUM(RealWinAmount ) AS RealWinAmount,
	SUM(BonusBetAmount) AS BonusBetAmount,
	SUM(BonusWinAmount) AS BonusWinAmount,
	SUM(NetGamingRevenue) AS NetGamingRevenue,
	SUM(RealBetAmountOriginal ) AS RealBetAmountOriginal ,
	SUM(RealWinAmountOriginal ) AS RealWinAmountOriginal ,
	SUM(BonusBetAmountOriginal) AS BonusBetAmountOriginal,
	SUM(BonusWinAmountOriginal) AS BonusWinAmountOriginal,
	SUM(NetGamingRevenueOriginal) AS NetGamingRevenueOriginal,
	SUM(NumberofRealBets) AS NumberofRealBets,
	SUM(NumberofBonusBets) AS NumberofBonusBets,
	SUM(NumberofRealWins) AS NumberofRealWins,
	SUM(NumberofBonusWins) AS NumberofBonusWins,
	SUM(NumberofSessions) AS NumberofSessions
INTO #Stats
FROM
(
	SELECT  pgagg.UpdatedDate,
			p.player_id AS PlayerID,
			1000000 + pgagg.GameID AS GameID,
			RealBetAmountOriginal * c.rate_in_EUR AS RealBetAmount,
			RealWinAmountOriginal * c.rate_in_EUR AS RealWinAmount,
			BonusBetAmountOriginal * c.rate_in_EUR AS BonusBetAmount,
			BonusWinAmountOriginal * c.rate_in_EUR AS BonusWinAmount,
			(RealBetAmountOriginal + BonusBetAmountOriginal - RealWinAmountOriginal - BonusWinAmountOriginal) * c.rate_in_EUR AS NetGamingRevenue,
			RealBetAmountOriginal,
			RealWinAmountOriginal,
			BonusBetAmountOriginal,
			BonusWinAmountOriginal,
			RealBetAmountOriginal + BonusBetAmountOriginal - RealWinAmountOriginal - BonusWinAmountOriginal AS NetGamingRevenueOriginal,
			NumberofRealBets,
			NumberofBonusBets,
			NumberofRealWins,
			NumberofBonusWins,
			NumberofSessions
	FROM [ProgressPlayDB].common.tbl_Players p WITH(NOLOCK, INDEX=IX_tbl_Players_LabelId_External)
	CROSS APPLY
	(
			SELECT CONVERT(date, UpdatedDate) AS UpdatedDate
				, pg.GameID as GameID
				, SUM(TotalBetRealMoney) AS RealBetAmountOriginal
				, SUM(TotalWinRealMoney) AS RealWinAmountOriginal
				, SUM(TotalBetBonus) AS BonusBetAmountOriginal
				, SUM(TotalWinBonus) AS BonusWinAmountOriginal
				, SUM(CASE WHEN TotalBetRealMoney > 0 THEN 1 ELSE 0 END) AS NumberofRealBets
				, SUM(CASE WHEN TotalBetBonus > 0 THEN 1 ELSE 0 END) AS NumberofBonusBets
				, SUM(CASE WHEN TotalWinRealMoney > 0 THEN 1 ELSE 0 END) AS NumberofRealWins
				, SUM(CASE WHEN TotalWinBonus > 0 THEN 1 ELSE 0 END) AS NumberofBonusWins
				, COUNT(*) AS NumberofSessions
			FROM [ProgressPlayDB].[Games].[Games_PlayedGames] pg WITH(NOLOCK)
			WHERE p.player_id = pg.PlayerID
			AND pg.UpdatedDate >= @from_date
			AND pg.UpdatedDate < @to_date
			GROUP BY
				CONVERT(date, UpdatedDate)
				, pg.GameID

	) AS pgagg
	INNER JOIN [ProgressPlayDB].Games.Games g (NOLOCK) on g.GameID = pgagg.GameID 
	INNER JOIN [ProgressPlayDB].Games.Games_Providers gp (NOLOCK) ON gp.ID = g.ProviderID
	INNER JOIN [ProgressPlayDB].Games.Games_GameTypes gt (NOLOCK) ON gt.ID = g.GameTypeID
	INNER JOIN [ProgressPlayDB].common.tbl_Currencies c (NOLOCK) ON c.currency_id = p.currency_id
	INNER JOIN [ProgressPlayDB].common.tbl_White_labels wl (NOLOCK) on wl.label_id = p.white_label_id
	INNER JOIN [ProgressPlayDB].common.tbl_Countries ci (NOLOCK) on ci.country_id = p.country_id
	WHERE p.is_internal = 0

	UNION ALL
	
	SELECT  pgagg.UpdatedDate,
			p.player_id AS PlayerID,
			1000000 + pgagg.GameID AS GameID,
			RealBetAmountOriginal * c.rate_in_EUR AS RealBetAmount,
			RealWinAmountOriginal * c.rate_in_EUR AS RealWinAmount,
			BonusBetAmountOriginal * c.rate_in_EUR AS BonusBetAmount,
			BonusWinAmountOriginal * c.rate_in_EUR AS BonusWinAmount,
			(RealBetAmountOriginal + BonusBetAmountOriginal - RealWinAmountOriginal - BonusWinAmountOriginal) * c.rate_in_EUR AS NetGamingRevenue,
			RealBetAmountOriginal,
			RealWinAmountOriginal,
			BonusBetAmountOriginal,
			BonusWinAmountOriginal,
			RealBetAmountOriginal + BonusBetAmountOriginal - RealWinAmountOriginal - BonusWinAmountOriginal AS NetGamingRevenueOriginal,
			NumberofRealBets,
			NumberofBonusBets,
			NumberofRealWins,
			NumberofBonusWins,
			NumberofSessions
	FROM [ProgressPlayDB].common.tbl_Players p WITH(NOLOCK, INDEX=IX_tbl_Players_LabelId_External)
	CROSS APPLY
	(
			SELECT CONVERT(date, UpdatedDate) AS UpdatedDate
				, pg.GameID as GameID
				, SUM(TotalBetRealMoney) AS RealBetAmountOriginal
				, SUM(TotalWinRealMoney) AS RealWinAmountOriginal
				, SUM(TotalBetBonus) AS BonusBetAmountOriginal
				, SUM(TotalWinBonus) AS BonusWinAmountOriginal
				, SUM(CASE WHEN TotalBetRealMoney > 0 THEN 1 ELSE 0 END) AS NumberofRealBets
				, SUM(CASE WHEN TotalBetBonus > 0 THEN 1 ELSE 0 END) AS NumberofBonusBets
				, SUM(CASE WHEN TotalWinRealMoney > 0 THEN 1 ELSE 0 END) AS NumberofRealWins
				, SUM(CASE WHEN TotalWinBonus > 0 THEN 1 ELSE 0 END) AS NumberofBonusWins
				, COUNT(*) AS NumberofSessions
			FROM [ProgressPlayDB].[Games].[OngoingGames] pg WITH(NOLOCK)
			WHERE p.player_id = pg.PlayerID
			AND pg.UpdatedDate >= @from_date
			AND pg.UpdatedDate < @to_date
			GROUP BY
				CONVERT(date, UpdatedDate)
				, pg.GameID
	) AS pgagg
	INNER JOIN [ProgressPlayDB].Games.Games g (NOLOCK) on g.GameID = pgagg.GameID 
	INNER JOIN [ProgressPlayDB].Games.Games_Providers gp (NOLOCK) ON gp.ID = g.ProviderID
	INNER JOIN [ProgressPlayDB].Games.Games_GameTypes gt (NOLOCK) ON gt.ID = g.GameTypeID
	INNER JOIN [ProgressPlayDB].common.tbl_Currencies c (NOLOCK) ON c.currency_id = p.currency_id
	INNER JOIN [ProgressPlayDB].common.tbl_White_labels wl (NOLOCK) on wl.label_id = p.white_label_id
	INNER JOIN [ProgressPlayDB].common.tbl_Countries ci (NOLOCK) on ci.country_id = p.country_id
	WHERE p.is_internal = 0
) AS q
GROUP BY
	UpdatedDate,
	PlayerID,
	GameID
OPTION (RECOMPILE)


MERGE INTO [DailyActionsDB].[common].[tbl_Daily_actions_EUR_games] AS trgt
USING (
SELECT	
			CONVERT(VARCHAR(10), GameDate, 111) AS GameDate, 
			PlayerID, 
			GameID, 
			'' AS [Platform], 
			RealBetAmount, 
			RealWinAmount, 
			BonusBetAmount, 
			BonusWinAmount, 
			NetGamingRevenue, 
		

			RealBetAmountOriginal,	
			RealWinAmountOriginal,
			BonusBetAmountOriginal,
			BonusWinAmountOriginal,
			NetGamingRevenueOriginal,
			GETUTCDATE() AS UpdateDate,
			NumberofRealBets,
			NumberofBonusBets,
			NumberofRealWins,
			NumberofBonusWins,
			NumberofSessions
FROM	#Stats 
) AS src
ON src.GameDate = trgt.GameDate
AND src.PlayerID = trgt.PlayerID
AND src.GameID = trgt.GameID
--AND src.[Platform] = trgt.[Platform]
WHEN NOT MATCHED BY TARGET THEN
INSERT
(GameDate, PlayerID, GameID, [Platform], RealBetAmount, RealWinAmount, BonusBetAmount, BonusWinAmount, 
NetGamingRevenue, 
RealBetAmountOriginal,RealWinAmountOriginal,BonusBetAmountOriginal,BonusWinAmountOriginal, NetGamingRevenueOriginal, UpdateDate,
NumberofRealBets,NumberofBonusBets,NumberofRealWins,NumberofBonusWins,NumberofSessions)
VALUES
(GameDate, PlayerID, GameID, [Platform], RealBetAmount, RealWinAmount, BonusBetAmount, BonusWinAmount, 
NetGamingRevenue, 
RealBetAmountOriginal,RealWinAmountOriginal,BonusBetAmountOriginal,BonusWinAmountOriginal, NetGamingRevenueOriginal, UpdateDate,
NumberofRealBets,NumberofBonusBets,NumberofRealWins,NumberofBonusWins,NumberofSessions)
WHEN MATCHED THEN
	UPDATE SET
		  RealBetAmount = src.RealBetAmount
		, RealWinAmount = src.RealWinAmount
		, BonusBetAmount = src.BonusBetAmount
		, BonusWinAmount = src.BonusWinAmount
		, NetGamingRevenue = src.NetGamingRevenue
		, RealBetAmountOriginal = src.RealBetAmountOriginal
		, RealWinAmountOriginal = src.RealWinAmountOriginal
		, BonusBetAmountOriginal = src.BonusBetAmountOriginal
		, BonusWinAmountOriginal = src.BonusWinAmountOriginal
		, NetGamingRevenueOriginal = src.NetGamingRevenueOriginal
		, UpdateDate = src.UpdateDate
		, NumberofRealBets = src.NumberofRealBets
		, NumberofBonusBets = src.NumberofBonusBets
		, NumberofRealWins = src.NumberofRealWins
		, NumberofBonusWins = src.NumberofBonusWins
		, NumberofSessions = src.NumberofSessions
;

SET @rows = @@ROWCOUNT

INSERT INTO [DailyActionsDB].common.tbl_Daily_log 
(ProcName, StartTime, EndTime, RowsStartTime, RowsEndTime, RowsAmount)
SELECT OBJECT_NAME(@@PROCID), @now, GETUTCDATE(), @from_date,@to_date, @rows

SET @from_date = @to_date
END


















--GBP

SELECT @from_date = ISNULL(MAX(GameDate),CAST(GETUTCDATE() AS DATE))
FROM [DailyActionsDB].[common].[tbl_Daily_actions_games] WITH(NOLOCK)

--SELECT @from_date,@to_date

WHILE @from_date < DATEADD(day, 1, CONVERT(date, GETUTCDATE()))
BEGIN
SET @now = GETUTCDATE()
SET @to_date = DATEADD(DAY,1,@from_date)
SET @msg = CONCAT(CONVERT(varchar(19),@now,121), ' - archiving from ', CONVERT(varchar(10), @from_date, 121), ' to ', CONVERT(varchar(10), @to_date, 121))

RAISERROR(@msg, 0, 1) WITH NOWAIT;

IF OBJECT_ID ('tempdb..#StatsGBP') IS NOT NULL
	DROP TABLE #StatsGBP

SELECT UpdatedDate AS GameDate,
	PlayerID,
	GameID,
	SUM(RealBetAmount ) AS RealBetAmount,
	SUM(RealWinAmount ) AS RealWinAmount,
	SUM(BonusBetAmount) AS BonusBetAmount,
	SUM(BonusWinAmount) AS BonusWinAmount,
	SUM(NetGamingRevenue) AS NetGamingRevenue,
	SUM(RealBetAmountOriginal ) AS RealBetAmountOriginal ,
	SUM(RealWinAmountOriginal ) AS RealWinAmountOriginal ,
	SUM(BonusBetAmountOriginal) AS BonusBetAmountOriginal,
	SUM(BonusWinAmountOriginal) AS BonusWinAmountOriginal,
	SUM(NetGamingRevenueOriginal) AS NetGamingRevenueOriginal,
	SUM(NumberofRealBets) AS NumberofRealBets,
	SUM(NumberofBonusBets) AS NumberofBonusBets,
	SUM(NumberofRealWins) AS NumberofRealWins,
	SUM(NumberofBonusWins) AS NumberofBonusWins,
	SUM(NumberofSessions) AS NumberofSessions
INTO #StatsGBP
FROM
(
	SELECT  pgagg.UpdatedDate,
			p.player_id AS PlayerID,
			1000000 + pgagg.GameID AS GameID,
			RealBetAmountOriginal * c.rate_in_GBP AS RealBetAmount,
			RealWinAmountOriginal * c.rate_in_GBP AS RealWinAmount,
			BonusBetAmountOriginal * c.rate_in_GBP AS BonusBetAmount,
			BonusWinAmountOriginal * c.rate_in_GBP AS BonusWinAmount,
			(RealBetAmountOriginal + BonusBetAmountOriginal - RealWinAmountOriginal - BonusWinAmountOriginal) * c.rate_in_GBP AS NetGamingRevenue,
			RealBetAmountOriginal,
			RealWinAmountOriginal,
			BonusBetAmountOriginal,
			BonusWinAmountOriginal,
			RealBetAmountOriginal + BonusBetAmountOriginal - RealWinAmountOriginal - BonusWinAmountOriginal AS NetGamingRevenueOriginal,
			NumberofRealBets,
			NumberofBonusBets,
			NumberofRealWins,
			NumberofBonusWins,
			NumberofSessions
	FROM [ProgressPlayDB].common.tbl_Players p WITH(NOLOCK, INDEX=IX_tbl_Players_LabelId_External)
	CROSS APPLY
	(
			SELECT CONVERT(date, UpdatedDate) AS UpdatedDate
				, pg.GameID as GameID
				, SUM(TotalBetRealMoney) AS RealBetAmountOriginal
				, SUM(TotalWinRealMoney) AS RealWinAmountOriginal
				, SUM(TotalBetBonus) AS BonusBetAmountOriginal
				, SUM(TotalWinBonus) AS BonusWinAmountOriginal
				, SUM(CASE WHEN TotalBetRealMoney > 0 THEN 1 ELSE 0 END) AS NumberofRealBets
				, SUM(CASE WHEN TotalBetBonus > 0 THEN 1 ELSE 0 END) AS NumberofBonusBets
				, SUM(CASE WHEN TotalWinRealMoney > 0 THEN 1 ELSE 0 END) AS NumberofRealWins
				, SUM(CASE WHEN TotalWinBonus > 0 THEN 1 ELSE 0 END) AS NumberofBonusWins
				, COUNT(*) AS NumberofSessions
			FROM [ProgressPlayDB].[Games].[Games_PlayedGames] pg WITH(NOLOCK)
			WHERE p.player_id = pg.PlayerID
			AND pg.UpdatedDate >= @from_date
			AND pg.UpdatedDate < @to_date
			GROUP BY
				CONVERT(date, UpdatedDate)
				, pg.GameID

	) AS pgagg
	INNER JOIN [ProgressPlayDB].Games.Games g (NOLOCK) on g.GameID = pgagg.GameID 
	INNER JOIN [ProgressPlayDB].Games.Games_Providers gp (NOLOCK) ON gp.ID = g.ProviderID
	INNER JOIN [ProgressPlayDB].Games.Games_GameTypes gt (NOLOCK) ON gt.ID = g.GameTypeID
	INNER JOIN [ProgressPlayDB].common.tbl_Currencies c (NOLOCK) ON c.currency_id = p.currency_id
	INNER JOIN [ProgressPlayDB].common.tbl_White_labels wl (NOLOCK) on wl.label_id = p.white_label_id
	INNER JOIN [ProgressPlayDB].common.tbl_Countries ci (NOLOCK) on ci.country_id = p.country_id
	WHERE p.is_internal = 0

	UNION ALL
	
	SELECT  pgagg.UpdatedDate,
			p.player_id AS PlayerID,
			1000000 + pgagg.GameID AS GameID,
			RealBetAmountOriginal * c.rate_in_GBP AS RealBetAmount,
			RealWinAmountOriginal * c.rate_in_GBP AS RealWinAmount,
			BonusBetAmountOriginal * c.rate_in_GBP AS BonusBetAmount,
			BonusWinAmountOriginal * c.rate_in_GBP AS BonusWinAmount,
			(RealBetAmountOriginal + BonusBetAmountOriginal - RealWinAmountOriginal - BonusWinAmountOriginal) * c.rate_in_GBP AS NetGamingRevenue,
			RealBetAmountOriginal,
			RealWinAmountOriginal,
			BonusBetAmountOriginal,
			BonusWinAmountOriginal,
			RealBetAmountOriginal + BonusBetAmountOriginal - RealWinAmountOriginal - BonusWinAmountOriginal AS NetGamingRevenueOriginal,
			NumberofRealBets,
			NumberofBonusBets,
			NumberofRealWins,
			NumberofBonusWins,
			NumberofSessions
	FROM [ProgressPlayDB].common.tbl_Players p WITH(NOLOCK, INDEX=IX_tbl_Players_LabelId_External)
	CROSS APPLY
	(
			SELECT CONVERT(date, UpdatedDate) AS UpdatedDate
				, pg.GameID as GameID
				, SUM(TotalBetRealMoney) AS RealBetAmountOriginal
				, SUM(TotalWinRealMoney) AS RealWinAmountOriginal
				, SUM(TotalBetBonus) AS BonusBetAmountOriginal
				, SUM(TotalWinBonus) AS BonusWinAmountOriginal
				, SUM(CASE WHEN TotalBetRealMoney > 0 THEN 1 ELSE 0 END) AS NumberofRealBets
				, SUM(CASE WHEN TotalBetBonus > 0 THEN 1 ELSE 0 END) AS NumberofBonusBets
				, SUM(CASE WHEN TotalWinRealMoney > 0 THEN 1 ELSE 0 END) AS NumberofRealWins
				, SUM(CASE WHEN TotalWinBonus > 0 THEN 1 ELSE 0 END) AS NumberofBonusWins
				, COUNT(*) AS NumberofSessions
			FROM [ProgressPlayDB].[Games].[OngoingGames] pg WITH(NOLOCK)
			WHERE p.player_id = pg.PlayerID
			AND pg.UpdatedDate >= @from_date
			AND pg.UpdatedDate < @to_date
			GROUP BY
				CONVERT(date, UpdatedDate)
				, pg.GameID
	) AS pgagg
	INNER JOIN [ProgressPlayDB].Games.Games g (NOLOCK) on g.GameID = pgagg.GameID 
	INNER JOIN [ProgressPlayDB].Games.Games_Providers gp (NOLOCK) ON gp.ID = g.ProviderID
	INNER JOIN [ProgressPlayDB].Games.Games_GameTypes gt (NOLOCK) ON gt.ID = g.GameTypeID
	INNER JOIN [ProgressPlayDB].common.tbl_Currencies c (NOLOCK) ON c.currency_id = p.currency_id
	INNER JOIN [ProgressPlayDB].common.tbl_White_labels wl (NOLOCK) on wl.label_id = p.white_label_id
	INNER JOIN [ProgressPlayDB].common.tbl_Countries ci (NOLOCK) on ci.country_id = p.country_id
	WHERE p.is_internal = 0
) AS q
GROUP BY
	UpdatedDate,
	PlayerID,
	GameID
OPTION (RECOMPILE)


MERGE INTO [DailyActionsDB].[common].[tbl_Daily_actions_games] AS trgt
USING (
SELECT	
			CONVERT(VARCHAR(10), GameDate, 111) AS GameDate, 
			PlayerID, 
			GameID, 
			'' AS [Platform], 
			RealBetAmount, 
			RealWinAmount, 
			BonusBetAmount, 
			BonusWinAmount, 
			NetGamingRevenue, 
		

			RealBetAmountOriginal,	
			RealWinAmountOriginal,
			BonusBetAmountOriginal,
			BonusWinAmountOriginal,
			NetGamingRevenueOriginal,
			GETUTCDATE() AS UpdateDate,
			NumberofRealBets,
			NumberofBonusBets,
			NumberofRealWins,
			NumberofBonusWins,
			NumberofSessions
FROM	#StatsGBP 
) AS src
ON src.GameDate = trgt.GameDate
AND src.PlayerID = trgt.PlayerID
AND src.GameID = trgt.GameID
--AND src.[Platform] = trgt.[Platform]
WHEN NOT MATCHED BY TARGET THEN
INSERT
(GameDate, PlayerID, GameID, [Platform], RealBetAmount, RealWinAmount, BonusBetAmount, BonusWinAmount, 
NetGamingRevenue, 
RealBetAmountOriginal,RealWinAmountOriginal,BonusBetAmountOriginal,BonusWinAmountOriginal, NetGamingRevenueOriginal, UpdateDate,
NumberofRealBets,NumberofBonusBets,NumberofRealWins,NumberofBonusWins,NumberofSessions)
VALUES
(GameDate, PlayerID, GameID, [Platform], RealBetAmount, RealWinAmount, BonusBetAmount, BonusWinAmount, 
NetGamingRevenue, 
RealBetAmountOriginal,RealWinAmountOriginal,BonusBetAmountOriginal,BonusWinAmountOriginal, NetGamingRevenueOriginal, UpdateDate,
NumberofRealBets,NumberofBonusBets,NumberofRealWins,NumberofBonusWins,NumberofSessions)
WHEN MATCHED THEN
	UPDATE SET
		  RealBetAmount = src.RealBetAmount
		, RealWinAmount = src.RealWinAmount
		, BonusBetAmount = src.BonusBetAmount
		, BonusWinAmount = src.BonusWinAmount
		, NetGamingRevenue = src.NetGamingRevenue
		, RealBetAmountOriginal = src.RealBetAmountOriginal
		, RealWinAmountOriginal = src.RealWinAmountOriginal
		, BonusBetAmountOriginal = src.BonusBetAmountOriginal
		, BonusWinAmountOriginal = src.BonusWinAmountOriginal
		, NetGamingRevenueOriginal = src.NetGamingRevenueOriginal
		, UpdateDate = src.UpdateDate
		, NumberofRealBets = src.NumberofRealBets
		, NumberofBonusBets = src.NumberofBonusBets
		, NumberofRealWins = src.NumberofRealWins
		, NumberofBonusWins = src.NumberofBonusWins
		, NumberofSessions = src.NumberofSessions
;

SET @rows = @@ROWCOUNT

INSERT INTO [DailyActionsDB].common.tbl_Daily_log 
(ProcName, StartTime, EndTime, RowsStartTime, RowsEndTime, RowsAmount)
SELECT OBJECT_NAME(@@PROCID) + '_gbp', @now, GETUTCDATE(), @from_date,@to_date, @rows

SET @from_date = @to_date
END




END
GO
/****** Object:  StoredProcedure [dbo].[stp_DailyActions_Games_NEW]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[stp_DailyActions_Games_NEW]

AS
BEGIN

-- =============================================
-- Author:		Rotem.Madeira
-- Create date: 26/7/2016
-- Description:	Runs once a day to insert new information in the [common].[tbl_Daily_actions_gamess] table
-- =============================================

SET NOCOUNT ON;



DECLARE	@from_date	DATETIME2
DECLARE	@to_date	DATETIME2
DECLARE @rows		INT
DECLARE @now		DATETIME = GETUTCDATE()

SELECT @from_date = DATEADD(DAY,1,ISNULL(MAX(GameDate),CAST(GETUTCDATE() AS DATE))) FROM [DailyActionsDB].[common].[tbl_Daily_actions_games] (NOLOCK)
SELECT @to_date =	CAST(GETUTCDATE() AS DATE)

SELECT @from_date,@to_date

IF @from_date >= @to_date
	RETURN;

IF OBJECT_ID ('tempdb..#Stats') IS NOT NULL
	DROP TABLE #Stats

SELECT * INTO #Stats FROM	
(

	SELECT  CONVERT(VARCHAR(10), pg.UpdatedDate, 111) AS GameDate,
			PlayerID,
			1000000 + g.GameID AS GameID,
			'' AS [Platform],
			SUM(TotalBetRealMoney * c.rate_in_EUR) AS RealBetAmount,
			SUM(TotalWinRealMoney * c.rate_in_EUR) AS RealWinAmount,
			SUM(TotalBetBonus * c.rate_in_EUR) AS BonusBetAmount,
			SUM(TotalWinBonus * c.rate_in_EUR) AS BonusWinAmount,
			SUM(TotalBetRealMoney * c.rate_in_EUR) + SUM(TotalBetBonus * c.rate_in_EUR) - SUM(TotalWinRealMoney * c.rate_in_EUR) - SUM(TotalWinBonus * c.rate_in_EUR) AS NetGamingRevenue,
			0 AS NumberofRealBets,
			0 AS NumberofBonusBets,
			0 AS NumberofSessions,
			0 AS NumberofRealWins,
			0 AS NumberofBonusWins,
			SUM(TotalBetRealMoney) AS RealBetAmountOriginal,
			SUM(TotalWinRealMoney) AS RealWinAmountOriginal,
			SUM(TotalBetBonus) AS BonusBetAmountOriginal,
			SUM(TotalWinBonus) AS BonusWinAmountOriginal,
			SUM(TotalBetRealMoney) + SUM(TotalBetBonus) - SUM(TotalWinRealMoney) - SUM(TotalWinBonus) AS NetGamingRevenueOriginal
	FROM [ProgressPlayDB].[Games].[Games_PlayedGames] pg (NOLOCK)
	INNER JOIN [ProgressPlayDB].Games.Games g (NOLOCK) on g.GameID = pg.GameID 
	INNER JOIN [ProgressPlayDB].Games.Games_Providers gp (NOLOCK) ON gp.ID = g.ProviderID
	INNER JOIN [ProgressPlayDB].Games.Games_GameTypes gt (NOLOCK) ON gt.ID = g.GameTypeID
	INNER JOIN [ProgressPlayDB].common.tbl_Players p (NOLOCK) on p.player_id = pg.PlayerID
	INNER JOIN [ProgressPlayDB].common.tbl_Currencies c (NOLOCK) ON c.currency_id = p.currency_id
	INNER JOIN [ProgressPlayDB].common.tbl_White_labels wl (NOLOCK) on wl.label_id = p.white_label_id
	INNER JOIN [ProgressPlayDB].common.tbl_Countries ci (NOLOCK) on ci.country_id = p.country_id
	WHERE	pg.UpdatedDate BETWEEN @from_date AND @to_date
	AND		p.is_internal = 0 
	GROUP BY CONVERT(VARCHAR(10), pg.UpdatedDate, 111),
			PlayerID,
			g.GameID

) s
OPTION (RECOMPILE)



INSERT INTO [DailyActionsDB].[common].[tbl_Daily_actions_games]
(GameDate, PlayerID, GameID, [Platform], RealBetAmount, RealWinAmount, BonusBetAmount, BonusWinAmount, 
NetGamingRevenue, NumberofRealBets, NumberofBonusBets, NumberofSessions, NumberofRealWins, NumberofBonusWins,
RealBetAmountOriginal,RealWinAmountOriginal,BonusBetAmountOriginal,BonusWinAmountOriginal, NetGamingRevenueOriginal)
SELECT	
			GameDate, 
			PlayerID, 
			GameID, 
			[Platform], 
			RealBetAmount, 
			RealWinAmount, 
			BonusBetAmount, 
			BonusWinAmount, 
			NetGamingRevenue, 
			NumberofRealBets, 
			NumberofBonusBets, 
			0 AS NumberofSessions, 
			NumberofRealWins, 
			NumberofBonusWins,
			RealBetAmountOriginal,	
			RealWinAmountOriginal,
			BonusBetAmountOriginal,
			BonusWinAmountOriginal,
			NetGamingRevenueOriginal			
FROM	#Stats 


SET @rows = @@ROWCOUNT

INSERT INTO [DailyActionsDB].common.tbl_Daily_log 
(ProcName, StartTime, EndTime, RowsStartTime, RowsEndTime, RowsAmount)
SELECT OBJECT_NAME(@@PROCID), @now, GETUTCDATE(), @from_date,@to_date, @rows

END
GO
/****** Object:  StoredProcedure [dbo].[stp_DailyActions_Games_Old]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[stp_DailyActions_Games_Old]

AS
BEGIN

-- =============================================
-- Author:		Rotem.Madeira
-- Create date: 26/7/2016
-- Description:	Runs once a day to insert new information in the [common].[tbl_Daily_actions_gamess] table
-- =============================================

SET NOCOUNT ON;



DECLARE	@from_date	DATETIME2
DECLARE	@to_date	DATETIME2
DECLARE @rows		INT
DECLARE @now		DATETIME = GETUTCDATE()

SELECT @from_date = DATEADD(DAY,1,ISNULL(MAX(GameDate),CAST(GETUTCDATE() AS DATE))) FROM [DailyActionsDB].[common].[tbl_Daily_actions_games] (NOLOCK)
SELECT @to_date =	CAST(GETUTCDATE() AS DATE)

--SELECT @from_date,@to_date

IF @from_date >= @to_date
	RETURN;

IF OBJECT_ID ('tempdb..#Data') IS NOT NULL
	DROP TABLE #Data

IF OBJECT_ID ('tempdb..#Stats') IS NOT NULL
	DROP TABLE #Stats

SELECT * INTO #Data FROM	
(
	SELECT  trans.player_id																		AS player_id,
			CASE WHEN transaction_type_id = 262 AND trans.is_added_funds = 1 THEN 1000 ELSE transaction_type_id END AS transaction_type_id,
			SUM(ISNULL(trans.amount, 0)) * currs.rate_in_EUR									AS amount,
			SUM(ISNULL(trans.adjustment_amount,0)) * currs.rate_in_EUR							AS adjustment_amount,
			COUNT(*)																			AS num,
			CAST(trans.updated_dt AS date)														AS game_date,
			sideGames.ID																		AS game_id,
			CASE sideGames.GameType WHEN 'Mobile' THEN 'Mobile' ELSE 'Web' END					AS [platform]
	FROM	[ProgressPlayDB].accounts.tbl_Account_transactions AS trans (NOLOCK)
	INNER JOIN [ProgressPlayDB].common.tbl_Players AS players (NOLOCK) ON players.player_id = trans.player_id
	INNER JOIN [ProgressPlayDB].common.tbl_Currencies AS currs (NOLOCK) ON currs.currency_id = players.currency_id
	INNER JOIN [ProgressPlayDB].SideGames.tblPlayedGame AS playedGames (NOLOCK) ON trans.SideGamesPlayedGameID = playedGames.ID
	INNER JOIN [ProgressPlayDB].SideGames.tblSideGames AS sideGames (NOLOCK) ON sideGames.ID = playedGames.GameID
	INNER JOIN [ProgressPlayDB].common.tbl_Luts AS luts (NOLOCK) ON luts.lut_id = trans.transaction_type_id
	WHERE	trans.updated_dt >= @from_date
	AND		trans.updated_dt < @to_date
	AND		players.is_internal != 1
	GROUP BY trans.player_id, transaction_type_id, currs.rate_in_EUR, is_added_funds, trans.is_done, sideGames.ID, CAST(trans.updated_dt AS date),sideGames.GameType
	UNION  ALL
	SELECT  bonusTrans.player_id																AS player_id,
			transaction_type_id																	AS transaction_type_id,
			SUM(ISNULL(bonusTrans.amount, 0)) * currs.rate_in_EUR								AS amount,
			SUM(ISNULL(bonusTrans.adjustment_amount,0))	* currs.rate_in_EUR						AS adjustment_amount,
			COUNT(*)																			AS num,
			CAST(bonusTrans.updated_dt AS date)													AS game_date,
			sideGames.ID																		AS game_id,
			CASE sideGames.GameType WHEN 'Mobile' THEN 'Mobile' ELSE 'Web' END					AS [platform]
	FROM	[ProgressPlayDB].accounts.tbl_Account_bonus_transactions (NOLOCK) AS bonusTrans
	INNER JOIN [ProgressPlayDB].common.tbl_Players AS players (NOLOCK) ON players.player_id = bonusTrans.player_id
	INNER JOIN [ProgressPlayDB].common.tbl_Currencies AS currs (NOLOCK) ON currs.currency_id = players.currency_id
	INNER JOIN [ProgressPlayDB].SideGames.tblPlayedGame AS playedGames (NOLOCK) ON bonusTrans.SideGamesPlayedGameID = playedGames.ID
	INNER JOIN [ProgressPlayDB].SideGames.tblSideGames AS sideGames (NOLOCK) ON sideGames.ID = playedGames.GameID
	INNER JOIN [ProgressPlayDB].common.tbl_Luts AS luts (NOLOCK) ON luts.lut_id = bonusTrans.transaction_type_id
	WHERE	bonusTrans.updated_dt >= @from_date
	AND		bonusTrans.updated_dt < @to_date
	AND		players.is_internal != 1
	GROUP BY bonusTrans.player_id, transaction_type_id, currs.rate_in_EUR, is_added_funds, sideGames.ID, CAST(bonusTrans.updated_dt AS date),sideGames.GameType
) s
OPTION (RECOMPILE)


SELECT	PivotTable.game_date		AS GameDate, 
		PivotTable.player_id		AS PlayerID,  
		PivotTable.game_id			AS GameID,
		PivotTable.[platform]		AS [Platform],  
		ISNULL(RealBetAmount ,0)	AS RealBetAmount,
		ISNULL(RealWinAmount ,0)	AS RealWinAmount,
		ISNULL(RealRefundAmount ,0)	AS RealRefundAmount,
		ISNULL(BonusBetAmount ,0)	AS BonusBetAmount,
		ISNULL(BonusWinAmount ,0)	AS BonusWinAmount,
		ISNULL(RealBetCount ,0)		AS NumberofRealBets,
		ISNULL(RealWinCount ,0)		AS NumberofRealWins,
		ISNULL(RealRefundCount ,0)	AS NumberofRealRefund,
		ISNULL(BonusBetCount ,0)	AS NumberofBonusBets,
		ISNULL(BonusWinCount ,0)	AS NumberofBonusWins,
		ISNULL(PivotTable.adjustment_amount + PivotTable2.adjustment_amount,0) AS adjustment_amount,
		ISNULL(RealBetAmount,0) +  ISNULL(BonusBetAmount,0) - ( ISNULL(RealWinAmount,0) +  ISNULL(BonusWinAmount,0)) AS NetGamingRevenue
INTO	#Stats
FROM	(
			SELECT	player_id, 
					game_id, 
					game_date, 
					[platform],
					SUM([262]) AS 'RealBetAmount',	
					SUM([268]) AS 'RealWinAmount',
					SUM([435]) AS 'BonusBetAmount',
					SUM([640]) AS 'BonusWinAmount',
					SUM([1000]) AS 'RealRefundAmount',
					SUM(adjustment_amount) AS adjustment_amount
			FROM	(
						SELECT  player_id,
								transaction_type_id,
								ISNULL(amount,0) AS amount,
								game_date,	
								game_id, 
								[platform],
								ISNULL(adjustment_amount,0) AS adjustment_amount
						FROM	#Data 
					) AS SourceTable
			PIVOT	( SUM (amount) FOR transaction_type_id IN ([262],[268],[435],[640],[1000]) ) AS PivotTable
			GROUP BY player_id, game_id, game_date, [platform]
		) AS PivotTable
		JOIN
		(
			SELECT	player_id, 
					game_id, 
					game_date,
					[platform], 
					SUM([262]) AS 'RealBetCount',
					SUM([268]) AS 'RealWinCount',
					SUM([435]) AS 'BonusBetCount',
					SUM([640]) AS 'BonusWinCount',
					SUM([1000]) AS 'RealRefundCount',
					SUM(adjustment_amount) AS adjustment_amount
			FROM	(
						SELECT	player_id,
								transaction_type_id,
								ISNULL(num,0) AS count_all,
								game_date,
								game_id,
								[platform],
								ISNULL(adjustment_amount,0) AS adjustment_amount 
						FROM	#Data
					) AS SourceTable
			PIVOT	( SUM (count_all) FOR transaction_type_id IN ([262],[268],[435],[640],[1000]) ) AS PivotTable2
			GROUP BY player_id, game_id, game_date, [platform]
		) AS PivotTable2
ON	PivotTable.game_id = PivotTable2.game_id
AND PivotTable.player_id = PivotTable2.player_id
AND PivotTable.game_date = PivotTable2.game_date
AND PivotTable.[platform] = PivotTable2.[platform]


INSERT INTO [DailyActionsDB].[common].[tbl_Daily_actions_games]
(GameDate, PlayerID, GameID, [Platform], RealBetAmount, RealWinAmount, BonusBetAmount, BonusWinAmount, 
NetGamingRevenue, NumberofRealBets, NumberofBonusBets, NumberofSessions, NumberofRealWins, NumberofBonusWins)
SELECT	
			GameDate, 
			PlayerID, 
			GameID, 
			[Platform], 
			RealBetAmount, 
			RealWinAmount, 
			BonusBetAmount, 
			BonusWinAmount, 
			NetGamingRevenue, 
			NumberofRealBets, 
			NumberofBonusBets, 
			0 AS NumberofSessions, 
			NumberofRealWins, 
			NumberofBonusWins
FROM	#Stats 


SET @rows = @@ROWCOUNT

INSERT INTO [DailyActionsDB].common.tbl_Daily_log 
(ProcName, StartTime, EndTime, RowsStartTime, RowsEndTime, RowsAmount)
SELECT OBJECT_NAME(@@PROCID), @now, GETUTCDATE(), @from_date,@to_date, @rows

END
GO
/****** Object:  StoredProcedure [dbo].[stp_DailyActions_GameSessions]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[stp_DailyActions_GameSessions]

AS
BEGIN

SET NOCOUNT ON;


DECLARE	@yesterday	DATETIME2
DECLARE	@from_date	DATETIME2
DECLARE	@to_date	DATETIME2
DECLARE @rows		INT
DECLARE @now		DATETIME = GETUTCDATE()

SELECT @yesterday =	DATEADD(day, -1, CONVERT(date, GETUTCDATE()) )
SELECT @from_date = ISNULL(MAX(UpdatedDate), '2020-11-04 15:00:00') FROM [DailyActionsDB].dbo.[GamesCasinoSessions] (NOLOCK)
SELECT @to_date =	DATEADD(MINUTE,-1,GETUTCDATE())



-- For daily runs
--SELECT @from_date = ISNULL(MAX(LastUpdated),CAST(GETUTCDATE() AS DATE)) FROM [DailyActionsDB].[common].[tbl_Daily_actions_transactions] (NOLOCK)
--SET @to_date = DATEADD(MILLISECOND,-2,CAST(DATEADD(DAY,2,CAST(@from_date AS DATE)) AS DATETIME))

SELECT @from_date , @to_date , @yesterday

IF OBJECT_ID ('tempdb..#Stats') IS NOT NULL DROP TABLE #Stats;
SELECT * 
INTO #Stats
FROM 
(
SELECT 
[ID], [GameID], [PlayerID], [TotalBet] * c.rate_in_EUR AS TotalBet, [TotalBetRealMoney] * c.rate_in_EUR AS TotalBetAccount, [TotalBetBonus] * c.rate_in_EUR AS TotalBetBonus, [TotalWin] * c.rate_in_EUR AS TotalWin, [TotalWinRealMoney] * c.rate_in_EUR AS TotalWinAccount, [TotalWinBonus] * c.rate_in_EUR AS TotalWinBonus, [RoundID], [GameStatus], [CurrencyID], [CreationDate], [UpdatedDate], [RealMoneyBalance] * c.rate_in_EUR AS AccountBalance, [BonusBalance] * c.rate_in_EUR AS BonusBalance
FROM  ProgressPlayDB.Games.Games_PlayedGames pg (NOLOCK)
inner join [ProgressPlayDB].common.tbl_Players p with(NOLOCK) ON p.player_id = pg.PlayerID
inner join [ProgressPlayDB].common.tbl_Currencies c with(NOLOCK) ON p.currency_id = c.currency_id
WHERE UpdatedDate >= @from_date
AND UpdatedDate >= @yesterday
UNION ALL
SELECT
[ID], [GameID], [PlayerID], [TotalBet] * c.rate_in_EUR AS TotalBet, [TotalBetRealMoney] * c.rate_in_EUR AS TotalBetAccount, [TotalBetBonus] * c.rate_in_EUR AS TotalBetBonus, [TotalWin] * c.rate_in_EUR AS TotalWin, [TotalWinRealMoney] * c.rate_in_EUR AS TotalWinAccount, [TotalWinBonus] * c.rate_in_EUR AS TotalWinBonus, [RoundID], [GameStatus], [CurrencyID], [CreationDate], [UpdatedDate], [RealMoneyBalance] * c.rate_in_EUR AS AccountBalance, [BonusBalance] * c.rate_in_EUR AS BonusBalance
FROM  ProgressPlayDB.Games.OngoingGames pg (NOLOCK)
inner join [ProgressPlayDB].common.tbl_Players p with(NOLOCK) ON p.player_id = pg.PlayerID
inner join [ProgressPlayDB].common.tbl_Currencies c with(NOLOCK) ON p.currency_id = c.currency_id
WHERE UpdatedDate >= @from_date
AND UpdatedDate >= @yesterday
) t
OPTION (RECOMPILE);


MERGE INTO [DailyActionsDB].dbo.GamesCasinoSessions AS trgt
USING (
	SELECT	*
	FROM	#Stats 
) AS src
ON src.ID = trgt.ID
WHEN NOT MATCHED BY TARGET THEN
INSERT
           ([ID]
           ,[GameID]
           ,[PlayerID]
           ,[TotalBet]
           ,[TotalBetAccount]
           ,[TotalBetBonus]
           ,[TotalWin]
           ,[TotalWinAccount]
           ,[TotalWinBonus]
           ,[RoundID]
           ,[GameStatus]
           ,[CurrencyID]
           ,[CreationDate]
           ,[UpdatedDate]
           ,[AccountBalance]
           ,[BonusBalance])

VALUES
([ID]
           ,[GameID]
           ,[PlayerID]
           ,[TotalBet]
           ,[TotalBetAccount]
           ,[TotalBetBonus]
           ,[TotalWin]
           ,[TotalWinAccount]
           ,[TotalWinBonus]
           ,[RoundID]
           ,[GameStatus]
           ,[CurrencyID]
           ,[CreationDate]
           ,[UpdatedDate]
           ,[AccountBalance]
           ,[BonusBalance])
WHEN MATCHED THEN
	UPDATE SET
		  [GameID] = src.[GameID]
		, [PlayerID] = src.[PlayerID]
		, [TotalBet] = src.[TotalBet]
		, [TotalBetAccount] = src.[TotalBetAccount]
		, [TotalBetBonus] = src.[TotalBetBonus]
		, [TotalWin] = src.[TotalWin]
		, [TotalWinAccount] = src.[TotalWinAccount]
		, [TotalWinBonus] = src.[TotalWinBonus]
		, [RoundID] = src.[RoundID]
		, [GameStatus] = src.[GameStatus]
		, [CurrencyID] = src.[CurrencyID]
		, [CreationDate] = src.[CreationDate]
		, [UpdatedDate] = src.[UpdatedDate]
		, [AccountBalance] = src.[AccountBalance]
		, [BonusBalance] = src.[BonusBalance]
;


END
GO
/****** Object:  StoredProcedure [dbo].[stp_DailyActions_Players]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



CREATE PROCEDURE [dbo].[stp_DailyActions_Players]

AS
BEGIN

-- =============================================
-- Author:		Oren.Sultan
-- Create date: 01/11/2016
-- Description:	Runs every 10 minutes to insert new transactions to the [common].[tbl_Daily_actions_players] table
-- =============================================



-- =============================================
-- Author:		Oren.Sultan
-- Create date: 01/11/2016
-- Description:	Runs every 10 minutes to insert new transactions to the [common].[tbl_Daily_actions_players] table
-- =============================================

SET NOCOUNT ON;


IF OBJECT_ID ('tempdb..#result') IS NOT NULL
	DROP TABLE #result

DECLARE	@players_from_date		DATETIME
DECLARE	@players_to_date		DATETIME
DECLARE @now					DATETIME = GETUTCDATE()
DECLARE @rows					INT

SELECT @players_from_date = DATEADD(MILLISECOND,-1,ISNULL(MAX(LastUpdate),'1900-01-01')) FROM [DailyActionsDB].common.tbl_Daily_actions_players (NOLOCK)
SELECT @players_to_date =	DATEADD(MILLISECOND,-1,GETUTCDATE())

--SELECT @players_from_date, @players_to_date

SELECT	players.player_id								AS PlayerID,
		whiteLabels.label_name							AS CasinoName,	
		whiteLabels.label_id							AS CasinoID,
		players.email									AS Email,
		players.first_name								AS FirstName,
		players.last_name								AS LastName,
		players.first_name + ' ' + players.last_name	AS Alias,
		currencies.currency_code						AS Currency,		
		currencies.currency_symbol						AS CurrencySymbol,
		players.tracker_id								AS AffiliateID,
		''												AS ReferralType,
		players.dynamic_parameter						AS DynamicParameter,
		players.click_id								AS ClickID,
		players.promotion_code							AS PromotionCode,
		countries.phone_code							AS CountryCode,
		players.phone_number							AS PhoneNumber,
		players.cellphone_number						AS MobileNumber,
		SUBSTRING(CONCAT(countries.phone_code, REPLACE(LTRIM(REPLACE(players.cellphone_number,'0',' ')),' ','0')),0, 64) AS FullMobileNumber,
		countries.country_name							AS Country,
		players.city									AS City,
		players.[address]								AS Address,
		players.zipcode									AS ZipCode,
		luts_gender.lut_name							AS Gender,
		players.birthday								AS DateOfBirth,	
		luts_lang.lut_name								AS [Language],		
		players.last_ip									AS IP, 
		players.registration_date						AS RegisteredDate,
		players.ftd_date								AS FirstDepositDate,
		players.last_login_date							AS LastLoginDate,
		players.last_deposit_date						AS LastDepositDate, 	
		account_info.ranking							AS VIPLevel,
		account_info.ranking							AS Ranking, 
		players.platform_registered_in					AS RegisteredPlatform,
		players.lucky_charm_image						AS PlatformString,
		players.welcome_bonus_desc						AS WelcomeBonus, 
		SUBSTRING(players.welcome_bonus_desc,CHARINDEX('|',players.welcome_bonus_desc)+1,LEN(players.welcome_bonus_desc)) AS WelcomeBonusCode,
		SUBSTRING(players.welcome_bonus_desc,0,CHARINDEX('|',players.welcome_bonus_desc)) AS WelcomeBonusDesc,
		luts_risk.lut_name								AS DocumentsStatus,
		players.sms_notifications_enabled				AS SMSEnabled,
		players.is_push_enabled							AS PushEnabled,
		players.mail_notifications_enabled				AS MailEnabled,

		--CASE WHEN players.block_type = 663 THEN 0 ELSE players.promotional_mail_enabled	END	AS IsOptIn,
		--CASE WHEN players.block_type = 663 THEN 0 ELSE players.promotional_mail_enabled	END	AS PromotionsEnabled,
		--CASE WHEN players.block_type = 663 THEN 0 ELSE players.promotional_mail_enabled	END	AS PromotionsMailEnabled,
		--CASE WHEN players.block_type = 663 THEN 0 ELSE players.promotional_sms_enabled	END	AS PromotionsSMSEnabled,
		--CASE WHEN players.block_type = 663 THEN 0 ELSE players.promotional_push_enabled	END	AS PromotionsPushEnabled,
		--CASE WHEN players.block_type = 663 THEN 0 ELSE players.promotional_phone_enabled END AS PromotionsPhoneEnabled,
		--CASE WHEN players.block_type = 663 THEN 0 ELSE players.promotional_post_enabled	END AS PromotionsPostEnabled,
		--CASE WHEN players.block_type = 663 THEN 0 ELSE players.promotional_partner_enabled END AS PromotionsPartnerEnabled,	
		--CASE WHEN players.block_type = 663 THEN 0 ELSE players.bonuses_enabled END AS BonusesEnabled,

		players.promotional_mail_enabled AS IsOptIn,
		players.promotional_mail_enabled AS PromotionsEnabled,
		players.promotional_mail_enabled AS PromotionsMailEnabled,
		players.promotional_sms_enabled	AS PromotionsSMSEnabled,
		players.promotional_push_enabled AS PromotionsPushEnabled,
		players.promotional_phone_enabled AS PromotionsPhoneEnabled,
		players.promotional_post_enabled AS PromotionsPostEnabled,
		players.promotional_partner_enabled AS PromotionsPartnerEnabled,
		
		case when isnull(players.last_login_date, players.registration_date) < '2025-05-01'
		then isnull(players.promotional_mail_enabled,0) else consents.PromotionalCasinoEmailEnabled end as PromotionalCasinoEmailEnabled,
		case when isnull(players.last_login_date, players.registration_date) < '2025-05-01'
		then isnull(players.promotional_mail_enabled,0) else consents.PromotionalBingoEmailEnabled end as PromotionalBingoEmailEnabled,
		case when isnull(players.last_login_date, players.registration_date) < '2025-05-01'
		then isnull(players.promotional_mail_enabled,0) else consents.PromotionalSportsEmailEnabled end as PromotionalSportsEmailEnabled,

		case when isnull(players.last_login_date, players.registration_date) < '2025-05-01'
		then isnull(players.promotional_sms_enabled,0) else consents.PromotionalCasinoSMSEnabled end as PromotionalCasinoSMSEnabled,
		case when isnull(players.last_login_date, players.registration_date) < '2025-05-01'
		then isnull(players.promotional_sms_enabled,0) else consents.PromotionalBingoSMSEnabled end as PromotionalBingoSMSEnabled,
		case when isnull(players.last_login_date, players.registration_date) < '2025-05-01'
		then isnull(players.promotional_sms_enabled,0) else consents.PromotionalSportsSMSEnabled end as PromotionalSportsSMSEnabled,

		--consents.PromotionalCasinoEmailEnabled	AS PromotionalCasinoEmailEnabled,
		--consents.PromotionalCasinoSMSEnabled	AS PromotionalCasinoSMSEnabled,
		--consents.PromotionalBingoEmailEnabled	AS PromotionalBingoEmailEnabled,
		--consents.PromotionalBingoSMSEnabled		AS PromotionalBingoSMSEnabled,
		--consents.PromotionalSportsEmailEnabled	AS PromotionalSportsEmailEnabled,
		--consents.PromotionalSportsSMSEnabled	AS PromotionalSportsSMSEnabled,

		consents.PromotionalPushEnabled			AS PromotionalPushEnabled,
		consents.PromotionalPhoneEnabled		AS PromotionalPhoneEnabled,
		consents.PromotionalPostEnabled			AS PromotionalPostEnabled,
		consents.PromotionalPartnerEnabled		AS PromotionalPartnerEnabled,

		players.bonuses_enabled AS BonusesEnabled,

		players.logged_in								AS LoggedIn,
		players.is_internal								AS IsTest,
		statuses.status_name							AS Status,
		CASE	WHEN players.status_id = 9 THEN 1 ELSE 0 END						AS IsBlocked,

		players.block_date AS BlockDate,
		players.block_release_date AS BlockReleaseDate,
		players.block_reason AS BlockReason,
		luts_block.lut_name AS BlockType,
		bousers.username								AS BOAgent, 
		account_info.account_balance					AS AccountBalance, 
		account_info.bonus_balance						AS BonusBalance, 
		(ISNULL(account_info.account_balance,0) + ISNULL(account_info.bonus_balance,0)) 		AS Balance,
		ISNULL(account_info.account_balance,0) + ISNULL(account_info.bonus_balance,0)			AS OriginalBalance,
		account_info.max_balance												AS MaxBalance, 
		players.deposits_count													AS DepositsCount, 
		ISNULL(account_info.total_deposits, 0.00)								AS TotalDeposits,
		ISNULL(account_info.total_withdrawals, 0.00)							AS TotalWithdrawals,
		ISNULL(account_info.total_chargebacks, 0.00)							AS TotalChargeBacks, 
		ISNULL(account_info.total_chargeback_reverses, 0.00)					AS TotalChargebackReverses,
		ISNULL(account_info.total_voids, 0.00)									AS TotalVoids, 
		ISNULL(account_info.total_bonuses, 0.00)								AS TotalBonuses, 
		ISNULL(account_info.total_customer_club_points, 0.00)					AS TotalCustomerClubPoints, 
		ISNULL(account_info.customer_club_points, 0.00)							AS CustomerClubPoints, 
		ISNULL(account_info.wagered, 0.00)										AS Wagered,
		players.updated_dt														AS LastUpdated,
		CASE WHEN ISNULL(players.last_update, players.updated_dt) > account_info.updated_dt THEN ISNULL(players.last_update, players.updated_dt) ELSE account_info.updated_dt END AS LastUpdate,
		[ProgressPlayDB].dbo.fnc_GetPlayerRevenue(players.player_id)			AS RevenueEUR,
		players.welcome_bonus_desc_sport	AS	WelcomeBonusSport,
		SUBSTRING(players.welcome_bonus_desc_sport,CHARINDEX('|',players.welcome_bonus_desc_sport)+1,LEN(players.welcome_bonus_desc_sport)) AS WelcomeBonusSportCode,
		SUBSTRING(players.welcome_bonus_desc_sport,0,CHARINDEX('|',players.welcome_bonus_desc_sport)) AS WelcomeBonusSportDesc,
		luts_reg_playmode.lut_name AS RegistrationPlayMode,
		account_info.total_bets AS TotalBetsCasino,
		account_info.total_bets_sport AS TotalBetsSport,
		account_info.total_bets_live AS TotalBetsLive,
		account_info.total_bets_bingo AS TotalBetsBingo,
		players.deposits_count_casino AS DepositsCountCasino,
		players.deposits_count_sport AS DepositsCountSport,
		players.deposits_count_live AS DepositsCountLive,
		players.deposits_count_bingo AS DepositsCountBingo,
		account_info.bonus_balance_sport AS BonusBalanceSport,
		countries.country_id AS CountryID,
		countries.jurisdiction_id AS JurisdictionID,
		locales.Locale AS Locale,
		CASE WHEN players.activation_code IS NULL THEN 1 ELSE 0 END AS IsActivated,
		luts_aff_attempts.lut_name AS AffordabilityAttempts,
		account_info.affordability_treshold AS AffordabilityTreshold,
		account_info.affordability_balance AS AffordabilityBalance,
		luts_aff_status.lut_name AS AffordabilityStatus,
		players.aff_income_range_avg AS AffordabilityIncomeRangeChoice,
		players.affordability_last_update AS AffordabilityLastUpdate,
		players.platform_login_in AS LastLoginPlatform,
		players.winnings_restriction AS WinningsRestriction,
		(ISNULL(total_wins,0) + ISNULL(total_wins_sport,0) - ISNULL(total_bets, 0) - ISNULL(total_bets_sport, 0)) AS CurrentWinnings,
		(SELECT TOP 1 action_date
			FROM [ProgressPlayDB].common.tbl_Players_logins pl (NOLOCK)
			WHERE pl.player_id = players.player_id 
			AND action_type = 5
			AND action_desc = 'RG Event triggered : WinningsRestrictionFailed rg_event_cooloff - SoftBlock for 1440 minutes') AS WinningsRestrictionFailedDate,
		ISNULL((	SELECT	SUM(wr.requested_amount) 
					FROM	[ProgressPlayDB].crm.tbl_Withdrawal_requests AS wr  (NOLOCK)
					WHERE	wr.player_id = account_info.player_id 
					AND		wr.status_id IN (36,37,39,52)), 0) AS PendingWithdrawals,
		prof.ProfessionName AS Occupation,
		account_info.ftd_amount AS FTDAmount,
		account_info.ftd_settlement_company_id AS FTDSettlementCompanyID,
		DATEDIFF(YEAR, players.birthday, GETUTCDATE()) - CASE WHEN DATEADD(YEAR, DATEDIFF(YEAR, players.birthday, GETUTCDATE()), players.birthday) > GETUTCDATE() THEN 1 ELSE 0 END AS Age,
		prof.ProfessionID AS OccupationID,
		prof.YearlyIncome AS OccupationYearlyIncome
INTO #result
FROM   [ProgressPlayDB].common.tbl_Players AS players (NOLOCK)
OUTER APPLY (
    SELECT 
        v.PromotionalCasinoEmailEnabled,
		v.PromotionalCasinoSMSEnabled,
        v.PromotionalSportsEmailEnabled,
        v.PromotionalSportsSMSEnabled,
		v.PromotionalBingoEmailEnabled,
        v.PromotionalBingoSMSEnabled,
        v.PromotionalPostEnabled,
		v.PromotionalPushEnabled,
		v.PromotionalPhoneEnabled,
		v.PromotionalPartnerEnabled		
    FROM [ProgressPlayDB].common.vw_player_communication v
    WHERE v.player_id = players.player_id
) consents
INNER MERGE JOIN [ProgressPlayDB].accounts.tbl_Account_Info AS account_info on account_info.player_id = players.player_id 
INNER JOIN [ProgressPlayDB].common.tbl_White_labels AS whiteLabels on whiteLabels.label_id = players.white_label_id
INNER JOIN [ProgressPlayDB].common.tbl_Statuses AS statuses on statuses.status_id = players.status_id
INNER JOIN [ProgressPlayDB].common.tbl_Countries AS countries on countries.country_id = players.country_id
INNER JOIN [ProgressPlayDB].common.tbl_Currencies AS currencies on currencies.currency_id = players.currency_id
INNER JOIN [ProgressPlayDB].common.tbl_Luts AS luts_lang on luts_lang.lut_id = players.language_id
INNER JOIN [ProgressPlayDB].common.tbl_Locales AS locales on locales.ID = players.language_id
LEFT JOIN [ProgressPlayDB].common.tbl_Luts AS luts_risk on luts_risk.lut_id = players.risk_level_id
LEFT JOIN [ProgressPlayDB].common.tbl_Luts AS luts_block ON luts_block.lut_id = players.block_type 
LEFT JOIN [ProgressPlayDB].common.tbl_Luts AS luts_gender on luts_gender.lut_id = players.gender_id
LEFT JOIN [ProgressPlayDB].common.tbl_Back_office_users AS bousers ON bousers.[user_id] = players.bo_agent
LEFT JOIN [ProgressPlayDB].common.tbl_Luts AS luts_aff_attempts on luts_aff_attempts.lut_id = players.affordability_attempts
LEFT JOIN [ProgressPlayDB].common.tbl_Luts AS luts_aff_status on luts_aff_status.lut_id = players.aff_status
LEFT JOIN [ProgressPlayDB].common.tbl_Professions prof on prof.ProfessionID = players.profession_id
LEFT JOIN [ProgressPlayDB].common.tbl_Luts AS luts_reg_playmode on luts_reg_playmode.lut_id = players.registration_play_mode
WHERE 	(ISNULL(players.last_update, players.updated_dt) >= @players_from_date AND ISNULL(players.last_update, players.updated_dt) <= @players_to_date) OR	
		(account_info.updated_dt >= @players_from_date AND account_info.updated_dt <= @players_to_date)
OPTION(MAXDOP 1, RECOMPILE)

CREATE UNIQUE CLUSTERED INDEX [IX_#result] ON #result(PlayerID) WITH (DATA_COMPRESSION = PAGE);

-- Update DB [DailyActionsDB]

MERGE INTO [DailyActionsDB].common.tbl_Daily_actions_players AS [TARGET]
USING #result AS [SOURCE]
ON [SOURCE].PlayerID = [TARGET].PlayerID 
WHEN MATCHED THEN UPDATE 
SET		[TARGET].CasinoName			= [SOURCE].CasinoName,
		[TARGET].CasinoID			= [SOURCE].CasinoID,
		[TARGET].Email				= [SOURCE].Email,
		[TARGET].FirstName			= [SOURCE].FirstName,
		[TARGET].LastName			= [SOURCE].LastName,		
		[TARGET].Alias				= [SOURCE].Alias,
		[TARGET].Currency			= [SOURCE].Currency,
		[TARGET].CurrencySymbol 	= [SOURCE].CurrencySymbol,
		[TARGET].AffiliateID		= [SOURCE].AffiliateID,
		[TARGET].DynamicParameter	= [SOURCE].DynamicParameter,
		[TARGET].ClickID			= [SOURCE].ClickID,
		[TARGET].PromotionCode		= [SOURCE].PromotionCode,
		[TARGET].CountryCode		= [SOURCE].CountryCode,
		[TARGET].MobileNumber		= [SOURCE].MobileNumber,
		[TARGET].FullMobileNumber   = [SOURCE].FullMobileNumber,
		[TARGET].Country			= [SOURCE].Country,
		[TARGET].City				= [SOURCE].City,
		[TARGET].Address			= [SOURCE].Address,
		[TARGET].ZipCode			= [SOURCE].ZipCode,
		[TARGET].Gender				= [SOURCE].Gender,
		[TARGET].DateOfBirth		= [SOURCE].DateOfBirth,
		[TARGET].[Language]			= [SOURCE].[Language],
		[TARGET].IP					= [SOURCE].IP,
		[TARGET].RegisteredDate		= [SOURCE].RegisteredDate,
		[TARGET].FirstDepositDate	= [SOURCE].FirstDepositDate,
		[TARGET].LastLoginDate		= [SOURCE].LastLoginDate,
		[TARGET].LastDepositDate	= [SOURCE].LastDepositDate,
		[TARGET].VIPLevel			= [SOURCE].VIPLevel,
		[TARGET].Ranking			= [SOURCE].Ranking,
		[TARGET].RegisteredPlatform	= [SOURCE].RegisteredPlatform,
		[TARGET].PlatformString		= [SOURCE].PlatformString,
		[TARGET].WelcomeBonus		= [SOURCE].WelcomeBonus,

		[TARGET].WelcomeBonusCode		= [SOURCE].WelcomeBonusCode,
		[TARGET].WelcomeBonusDesc		= [SOURCE].WelcomeBonusDesc,

		[TARGET].DocumentsStatus	= [SOURCE].DocumentsStatus,
		[TARGET].SMSEnabled			= [SOURCE].SMSEnabled,
		[TARGET].PushEnabled		= [SOURCE].PushEnabled,
		[TARGET].MailEnabled		= [SOURCE].MailEnabled,
		[TARGET].IsOptIn			= [SOURCE].IsOptIn,
		[TARGET].PromotionsEnabled	= [SOURCE].PromotionsEnabled,

		[TARGET].PromotionsMailEnabled	= [SOURCE].PromotionsMailEnabled,
		[TARGET].PromotionsSMSEnabled	= [SOURCE].PromotionsSMSEnabled,
		[TARGET].PromotionsPushEnabled	= [SOURCE].PromotionsPushEnabled,
		[TARGET].PromotionsPhoneEnabled	= [SOURCE].PromotionsPhoneEnabled,
		[TARGET].PromotionsPostEnabled	= [SOURCE].PromotionsPostEnabled,
		[TARGET].PromotionsPartnerEnabled	= [SOURCE].PromotionsPartnerEnabled,

		[TARGET].PromotionalCasinoEmailEnabled	= [SOURCE].PromotionalCasinoEmailEnabled,
		[TARGET].PromotionalCasinoSMSEnabled	= [SOURCE].PromotionalCasinoSMSEnabled,
		[TARGET].PromotionalBingoEmailEnabled	= [SOURCE].PromotionalBingoEmailEnabled,
		[TARGET].PromotionalBingoSMSEnabled		= [SOURCE].PromotionalBingoSMSEnabled,
		[TARGET].PromotionalSportsEmailEnabled	= [SOURCE].PromotionalSportsEmailEnabled,
		[TARGET].PromotionalSportsSMSEnabled	= [SOURCE].PromotionalSportsSMSEnabled,
		[TARGET].PromotionalPushEnabled			= [SOURCE].PromotionalPushEnabled,
		[TARGET].PromotionalPhoneEnabled 		= [SOURCE].PromotionalPhoneEnabled,
		[TARGET].PromotionalPostEnabled			= [SOURCE].PromotionalPostEnabled,
		[TARGET].PromotionalPartnerEnabled		= [SOURCE].PromotionalPartnerEnabled,

		[TARGET].BonusesEnabled		= [SOURCE].BonusesEnabled,
		[TARGET].LoggedIn			= [SOURCE].LoggedIn,
		[TARGET].IsTest				= [SOURCE].IsTest,	
		[TARGET].[Status]			= [SOURCE].[Status],
		[TARGET].IsBlocked			= [SOURCE].IsBlocked,
		[TARGET].BlockDate			= [SOURCE].BlockDate,
		[TARGET].BlockReason		= [SOURCE].BlockReason,
		[TARGET].BlockReleaseDate	= [SOURCE].BlockReleaseDate,
		[TARGET].BlockType			= [SOURCE].BlockType,
		[TARGET].BOAgent			= [SOURCE].BOAgent,
		[TARGET].AccountBalance		= [SOURCE].AccountBalance,
		[TARGET].BonusBalance		= [SOURCE].BonusBalance,
		[TARGET].Balance			= [SOURCE].Balance,
		[TARGET].OriginalBalance	= [SOURCE].OriginalBalance,
		[TARGET].MaxBalance			= [SOURCE].MaxBalance,
		[TARGET].DepositsCount		= [SOURCE].DepositsCount,
		[TARGET].TotalDeposits		= [SOURCE].TotalDeposits,
		[TARGET].TotalWithdrawals	= [SOURCE].TotalWithdrawals,
		[TARGET].TotalChargeBacks	= [SOURCE].TotalChargeBacks,
		[TARGET].TotalChargebackReverses	= [SOURCE].TotalChargebackReverses,
		[TARGET].TotalVoids					= [SOURCE].TotalVoids,
		[TARGET].TotalBonuses				= [SOURCE].TotalBonuses,
		[TARGET].TotalCustomerClubPoints	= [SOURCE].TotalCustomerClubPoints,
		[TARGET].CustomerClubPoints			= [SOURCE].CustomerClubPoints,
		[TARGET].Wagered					= [SOURCE].Wagered,
		[TARGET].LastUpdated				= [SOURCE].LastUpdated,
		[TARGET].LastUpdate					= [SOURCE].LastUpdate,
		[TARGET].RevenueEUR					= [SOURCE].RevenueEUR,

		[TARGET].WelcomeBonusSport					= [SOURCE].WelcomeBonusSport,


		[TARGET].WelcomeBonusSportCode		= [SOURCE].WelcomeBonusSportCode,
		[TARGET].WelcomeBonusSportDesc		= [SOURCE].WelcomeBonusSportDesc,

		[TARGET].RegistrationPlayMode				= [SOURCE].RegistrationPlayMode,
		[TARGET].TotalBetsCasino					= [SOURCE].TotalBetsCasino,
		[TARGET].TotalBetsSport						= [SOURCE].TotalBetsSport,
		[TARGET].TotalBetsLive						= [SOURCE].TotalBetsLive,
		[TARGET].TotalBetsBingo						= [SOURCE].TotalBetsBingo,

		[TARGET].DepositsCountCasino				= [SOURCE].DepositsCountCasino,
		[TARGET].DepositsCountSport					= [SOURCE].DepositsCountSport,
		[TARGET].DepositsCountLive					= [SOURCE].DepositsCountLive,
		[TARGET].DepositsCountBingo					= [SOURCE].DepositsCountBingo,
		[TARGET].BonusBalanceSport					= [SOURCE].BonusBalanceSport,
		[TARGET].CountryID							= [SOURCE].CountryID,
		[TARGET].JurisdictionID						= [SOURCE].JurisdictionID,
		[TARGET].Locale								= [SOURCE].Locale,
		[TARGET].IsActivated						= [SOURCE].IsActivated,
		[TARGET].AffordabilityAttempts				= [SOURCE].AffordabilityAttempts,
		[TARGET].AffordabilityTreshold				= [SOURCE].AffordabilityTreshold,
		[TARGET].AffordabilityBalance				= [SOURCE].AffordabilityBalance,
		[TARGET].AffordabilityStatus				= [SOURCE].AffordabilityStatus,
		[TARGET].AffordabilityIncomeRangeChoice		= [SOURCE].AffordabilityIncomeRangeChoice,
		[TARGET].AffordabilityLastUpdate			= [SOURCE].AffordabilityLastUpdate,
		[TARGET].LastLoginPlatform					= [SOURCE].LastLoginPlatform,
		[TARGET].WinningsRestriction				= [SOURCE].WinningsRestriction,
		[TARGET].CurrentWinnings					= [SOURCE].CurrentWinnings,
		[TARGET].WinningsRestrictionFailedDate		= [SOURCE].WinningsRestrictionFailedDate,
		[TARGET].PendingWithdrawals					= [SOURCE].PendingWithdrawals,
		[TARGET].Occupation							= [SOURCE].Occupation,
		[TARGET].FTDAmount							= [SOURCE].FTDAmount,
		[TARGET].FTDSettlementCompanyID				= [SOURCE].FTDSettlementCompanyID,
		[TARGET].Age								= [SOURCE].Age,
		[TARGET].OccupationID						= [SOURCE].OccupationID,
		[TARGET].OccupationYearlyIncome				= [SOURCE].OccupationYearlyIncome
WHEN NOT MATCHED BY TARGET
THEN INSERT (PlayerID,
			CasinoName,
			CasinoID,
			Email,
			FirstName,
			LastName,		
			Alias,
			Currency,
			CurrencySymbol,
			AffiliateID,
			DynamicParameter,
			ClickID,
			PromotionCode,
			CountryCode,
			MobileNumber,
			Country,
			City,
			Address,
			ZipCode,
			Gender,
			DateOfBirth,
			[Language],
			IP,
			RegisteredDate,
			FirstDepositDate,
			LastLoginDate,
			LastDepositDate,
			VIPLevel,
			Ranking,
			RegisteredPlatform,
			PlatformString,
			WelcomeBonus,
			DocumentsStatus,
			SMSEnabled,
			PushEnabled,
			MailEnabled,
			IsOptIn,
			PromotionsEnabled,

			PromotionsMailEnabled,
			PromotionsSMSEnabled,
			PromotionsPushEnabled,
			PromotionsPhoneEnabled,
			PromotionsPostEnabled,
			PromotionsPartnerEnabled,

			PromotionalCasinoEmailEnabled,
			PromotionalCasinoSMSEnabled,
			PromotionalBingoEmailEnabled,
			PromotionalBingoSMSEnabled,
			PromotionalSportsEmailEnabled,
			PromotionalSportsSMSEnabled,
			PromotionalPushEnabled,
			PromotionalPhoneEnabled,
			PromotionalPostEnabled,
			PromotionalPartnerEnabled,

			BonusesEnabled,
			LoggedIn,
			IsTest,	
			[Status],
			IsBlocked,
			BlockDate,
			BlockReason,
			BlockReleaseDate,
			BlockType,
			BOAgent,
			AccountBalance,
			BonusBalance,
			Balance,
			OriginalBalance,
			MaxBalance,
			DepositsCount,
			TotalDeposits,
			TotalWithdrawals,
			TotalChargeBacks,
			TotalChargebackReverses,
			TotalVoids,
			TotalBonuses,
			TotalCustomerClubPoints,
			CustomerClubPoints,
			Wagered,
			LastUpdated,
			LastUpdate,
			RevenueEUR,
			WelcomeBonusSport,
			RegistrationPlayMode,
			TotalBetsCasino,
			TotalBetsSport,
			TotalBetsLive,
			TotalBetsBingo,
			DepositsCountCasino,
			DepositsCountSport,
			DepositsCountLive,
			DepositsCountBingo,
			BonusBalanceSport,
			CountryID,
			JurisdictionID,
			Locale,
			IsActivated,
			AffordabilityAttempts,
			AffordabilityTreshold,
			AffordabilityBalance,
			AffordabilityStatus,
			AffordabilityIncomeRangeChoice,
			AffordabilityLastUpdate,
			LastLoginPlatform,
			WinningsRestriction,
			CurrentWinnings,
			WinningsRestrictionFailedDate,
			PendingWithdrawals,
			Occupation,
			FTDAmount,
			FTDSettlementCompanyID,
			Age,
			OccupationID,
			OccupationYearlyIncome)
VALUES ([SOURCE].PlayerID, 
		[SOURCE].CasinoName,
		[SOURCE].CasinoID,
		[SOURCE].Email,
		[SOURCE].FirstName,
		[SOURCE].LastName,
		[SOURCE].Alias,
		[SOURCE].Currency,
		[SOURCE].CurrencySymbol,
		[SOURCE].AffiliateID,
		[SOURCE].DynamicParameter,
		[SOURCE].ClickID,
		[SOURCE].PromotionCode,
		[SOURCE].CountryCode,
		[SOURCE].MobileNumber,
		[SOURCE].Country,
		[SOURCE].City,
		[SOURCE].Address,
		[SOURCE].ZipCode,
		[SOURCE].Gender,
		[SOURCE].DateOfBirth,
		[SOURCE].[Language],
		[SOURCE].IP,
		[SOURCE].RegisteredDate,
		[SOURCE].FirstDepositDate,
		[SOURCE].LastLoginDate,
		[SOURCE].LastDepositDate,
		[SOURCE].VIPLevel,
		[SOURCE].Ranking,
		[SOURCE].RegisteredPlatform,
		[SOURCE].PlatformString,
		[SOURCE].WelcomeBonus,
		[SOURCE].DocumentsStatus,
		[SOURCE].SMSEnabled,
		[SOURCE].PushEnabled,
		[SOURCE].MailEnabled,
		[SOURCE].IsOptIn,
		[SOURCE].PromotionsEnabled,

		[SOURCE].PromotionsMailEnabled,
		[SOURCE].PromotionsSMSEnabled,
		[SOURCE].PromotionsPushEnabled,
		[SOURCE].PromotionsPhoneEnabled,
		[SOURCE].PromotionsPostEnabled,
		[SOURCE].PromotionsPartnerEnabled,

		[SOURCE].PromotionalCasinoEmailEnabled,
		[SOURCE].PromotionalCasinoSMSEnabled,
		[SOURCE].PromotionalBingoEmailEnabled,
		[SOURCE].PromotionalBingoSMSEnabled,
		[SOURCE].PromotionalSportsEmailEnabled,
		[SOURCE].PromotionalSportsSMSEnabled,
		[SOURCE].PromotionalPushEnabled,
		[SOURCE].PromotionalPhoneEnabled,
		[SOURCE].PromotionalPostEnabled,
		[SOURCE].PromotionalPartnerEnabled,

		[SOURCE].BonusesEnabled,
		[SOURCE].LoggedIn,
		[SOURCE].IsTest,
		[SOURCE].[Status],
		[SOURCE].IsBlocked,
		[SOURCE].BlockDate,
		[SOURCE].BlockReason,
		[SOURCE].BlockReleaseDate,
		[SOURCE].BlockType,
		[SOURCE].BOAgent,
		[SOURCE].AccountBalance,
		[SOURCE].BonusBalance,
		[SOURCE].Balance,
		[SOURCE].OriginalBalance,
		[SOURCE].MaxBalance,
		[SOURCE].DepositsCount,
		[SOURCE].TotalDeposits,
		[SOURCE].TotalWithdrawals,
		[SOURCE].TotalChargeBacks,
		[SOURCE].TotalChargebackReverses,
		[SOURCE].TotalVoids,
		[SOURCE].TotalBonuses,
		[SOURCE].TotalCustomerClubPoints,
		[SOURCE].CustomerClubPoints,
		[SOURCE].Wagered,
		[SOURCE].LastUpdated,
		[SOURCE].LastUpdate,
		[SOURCE].RevenueEUR,
		[SOURCE].WelcomeBonusSport,
		[SOURCE].RegistrationPlayMode,
		[SOURCE].TotalBetsCasino,
		[SOURCE].TotalBetsSport,
		[SOURCE].TotalBetsLive,
		[SOURCE].TotalBetsBingo,
		[SOURCE].DepositsCountCasino,
		[SOURCE].DepositsCountSport,
		[SOURCE].DepositsCountLive,
		[SOURCE].DepositsCountBingo,
		[SOURCE].BonusBalanceSport,
		[SOURCE].CountryID,
		[SOURCE].JurisdictionID,
		[SOURCE].Locale,
		[SOURCE].IsActivated,
		[SOURCE].AffordabilityAttempts,
		[SOURCE].AffordabilityTreshold,
		[SOURCE].AffordabilityBalance,
		[SOURCE].AffordabilityStatus,
		[SOURCE].AffordabilityIncomeRangeChoice,
		[SOURCE].AffordabilityLastUpdate,
		[SOURCE].LastLoginPlatform,
		[SOURCE].WinningsRestriction,
		[SOURCE].CurrentWinnings,
		[SOURCE].WinningsRestrictionFailedDate,
		[SOURCE].PendingWithdrawals,
		[SOURCE].Occupation,
		[SOURCE].FTDAmount,
		[SOURCE].FTDSettlementCompanyID,
		[SOURCE].Age,
		[SOURCE].OccupationID,
		[SOURCE].OccupationYearlyIncome);

SET @rows = @@ROWCOUNT

INSERT INTO [DailyActionsDB].common.tbl_Daily_log 
(ProcName, StartTime, EndTime, RowsStartTime, RowsEndTime, RowsAmount)
SELECT OBJECT_NAME(@@PROCID), @now, GETUTCDATE(), @players_from_date,@players_to_date, @rows

 
  END

GO
/****** Object:  StoredProcedure [dbo].[stp_DailyActions_Players_250429]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



CREATE PROCEDURE [dbo].[stp_DailyActions_Players_250429]

AS
BEGIN

-- =============================================
-- Author:		Oren.Sultan
-- Create date: 01/11/2016
-- Description:	Runs every 10 minutes to insert new transactions to the [common].[tbl_Daily_actions_players] table
-- =============================================

SET NOCOUNT ON;


IF OBJECT_ID ('tempdb..#result') IS NOT NULL
	DROP TABLE #result

DECLARE	@players_from_date		DATETIME
DECLARE	@players_to_date		DATETIME
DECLARE @now					DATETIME = GETUTCDATE()
DECLARE @rows					INT

SELECT @players_from_date = DATEADD(MILLISECOND,-1,ISNULL(MAX(LastUpdate),'1900-01-01')) FROM [DailyActionsDB].common.tbl_Daily_actions_players (NOLOCK)
SELECT @players_to_date =	DATEADD(MILLISECOND,-1,GETUTCDATE())

--SELECT @players_from_date, @players_to_date

SELECT	players.player_id								AS PlayerID,
		whiteLabels.label_name							AS CasinoName,	
		whiteLabels.label_id							AS CasinoID,
		players.email									AS Email,
		players.first_name								AS FirstName,
		players.last_name								AS LastName,
		players.first_name + ' ' + players.last_name	AS Alias,
		currencies.currency_code						AS Currency,		
		currencies.currency_symbol						AS CurrencySymbol,
		players.tracker_id								AS AffiliateID,
		''												AS ReferralType,
		players.dynamic_parameter						AS DynamicParameter,
		players.click_id								AS ClickID,
		players.promotion_code							AS PromotionCode,
		countries.phone_code							AS CountryCode,
		players.phone_number							AS PhoneNumber,
		players.cellphone_number						AS MobileNumber,
		SUBSTRING(CONCAT(countries.phone_code, REPLACE(LTRIM(REPLACE(players.cellphone_number,'0',' ')),' ','0')),0, 64) AS FullMobileNumber,
		countries.country_name							AS Country,
		players.city									AS City,
		players.[address]								AS Address,
		players.zipcode									AS ZipCode,
		luts_gender.lut_name							AS Gender,
		players.birthday								AS DateOfBirth,	
		luts_lang.lut_name								AS [Language],		
		players.last_ip									AS IP, 
		players.registration_date						AS RegisteredDate,
		players.ftd_date								AS FirstDepositDate,
		players.last_login_date							AS LastLoginDate,
		players.last_deposit_date						AS LastDepositDate, 	
		account_info.ranking							AS VIPLevel,
		account_info.ranking							AS Ranking, 
		players.platform_registered_in					AS RegisteredPlatform,
		players.lucky_charm_image						AS PlatformString,
		players.welcome_bonus_desc						AS WelcomeBonus, 
		SUBSTRING(players.welcome_bonus_desc,CHARINDEX('|',players.welcome_bonus_desc)+1,LEN(players.welcome_bonus_desc)) AS WelcomeBonusCode,
		SUBSTRING(players.welcome_bonus_desc,0,CHARINDEX('|',players.welcome_bonus_desc)) AS WelcomeBonusDesc,
		luts_risk.lut_name								AS DocumentsStatus,
		players.sms_notifications_enabled				AS SMSEnabled,
		players.is_push_enabled							AS PushEnabled,
		players.mail_notifications_enabled				AS MailEnabled,

		--CASE WHEN players.block_type = 663 THEN 0 ELSE players.promotional_mail_enabled	END	AS IsOptIn,
		--CASE WHEN players.block_type = 663 THEN 0 ELSE players.promotional_mail_enabled	END	AS PromotionsEnabled,
		--CASE WHEN players.block_type = 663 THEN 0 ELSE players.promotional_mail_enabled	END	AS PromotionsMailEnabled,
		--CASE WHEN players.block_type = 663 THEN 0 ELSE players.promotional_sms_enabled	END	AS PromotionsSMSEnabled,
		--CASE WHEN players.block_type = 663 THEN 0 ELSE players.promotional_push_enabled	END	AS PromotionsPushEnabled,
		--CASE WHEN players.block_type = 663 THEN 0 ELSE players.promotional_phone_enabled END AS PromotionsPhoneEnabled,
		--CASE WHEN players.block_type = 663 THEN 0 ELSE players.promotional_post_enabled	END AS PromotionsPostEnabled,
		--CASE WHEN players.block_type = 663 THEN 0 ELSE players.promotional_partner_enabled END AS PromotionsPartnerEnabled,	
		--CASE WHEN players.block_type = 663 THEN 0 ELSE players.bonuses_enabled END AS BonusesEnabled,

		players.promotional_mail_enabled AS IsOptIn,
		players.promotional_mail_enabled AS PromotionsEnabled,
		players.promotional_mail_enabled AS PromotionsMailEnabled,
		players.promotional_sms_enabled	AS PromotionsSMSEnabled,
		players.promotional_push_enabled AS PromotionsPushEnabled,
		players.promotional_phone_enabled AS PromotionsPhoneEnabled,
		players.promotional_post_enabled AS PromotionsPostEnabled,
		players.promotional_partner_enabled AS PromotionsPartnerEnabled,
		
		consents.PromotionalCasinoEmailEnabled	AS PromotionalCasinoEmailEnabled,
		consents.PromotionalCasinoSMSEnabled	AS PromotionalCasinoSMSEnabled,
		consents.PromotionalBingoEmailEnabled	AS PromotionalBingoEmailEnabled,
		consents.PromotionalBingoSMSEnabled		AS PromotionalBingoSMSEnabled,
		consents.PromotionalSportsEmailEnabled	AS PromotionalSportsEmailEnabled,
		consents.PromotionalSportsSMSEnabled	AS PromotionalSportsSMSEnabled,
		consents.PromotionalPushEnabled			AS PromotionalPushEnabled,
		consents.PromotionalPhoneEnabled		AS PromotionalPhoneEnabled,
		consents.PromotionalPostEnabled			AS PromotionalPostEnabled,
		consents.PromotionalPartnerEnabled		AS PromotionalPartnerEnabled,

		players.bonuses_enabled AS BonusesEnabled,

		players.logged_in								AS LoggedIn,
		players.is_internal								AS IsTest,
		statuses.status_name							AS Status,
		CASE	WHEN players.status_id = 9 THEN 1 ELSE 0 END						AS IsBlocked,

		players.block_date AS BlockDate,
		players.block_release_date AS BlockReleaseDate,
		players.block_reason AS BlockReason,
		luts_block.lut_name AS BlockType,
		bousers.username								AS BOAgent, 
		account_info.account_balance					AS AccountBalance, 
		account_info.bonus_balance						AS BonusBalance, 
		(ISNULL(account_info.account_balance,0) + ISNULL(account_info.bonus_balance,0)) 		AS Balance,
		ISNULL(account_info.account_balance,0) + ISNULL(account_info.bonus_balance,0)			AS OriginalBalance,
		account_info.max_balance												AS MaxBalance, 
		players.deposits_count													AS DepositsCount, 
		ISNULL(account_info.total_deposits, 0.00)								AS TotalDeposits,
		ISNULL(account_info.total_withdrawals, 0.00)							AS TotalWithdrawals,
		ISNULL(account_info.total_chargebacks, 0.00)							AS TotalChargeBacks, 
		ISNULL(account_info.total_chargeback_reverses, 0.00)					AS TotalChargebackReverses,
		ISNULL(account_info.total_voids, 0.00)									AS TotalVoids, 
		ISNULL(account_info.total_bonuses, 0.00)								AS TotalBonuses, 
		ISNULL(account_info.total_customer_club_points, 0.00)					AS TotalCustomerClubPoints, 
		ISNULL(account_info.customer_club_points, 0.00)							AS CustomerClubPoints, 
		ISNULL(account_info.wagered, 0.00)										AS Wagered,
		players.updated_dt														AS LastUpdated,
		CASE WHEN ISNULL(players.last_update, players.updated_dt) > account_info.updated_dt THEN ISNULL(players.last_update, players.updated_dt) ELSE account_info.updated_dt END AS LastUpdate,
		[ProgressPlayDB].dbo.fnc_GetPlayerRevenue(players.player_id)			AS RevenueEUR,
		players.welcome_bonus_desc_sport	AS	WelcomeBonusSport,
		SUBSTRING(players.welcome_bonus_desc_sport,CHARINDEX('|',players.welcome_bonus_desc_sport)+1,LEN(players.welcome_bonus_desc_sport)) AS WelcomeBonusSportCode,
		SUBSTRING(players.welcome_bonus_desc_sport,0,CHARINDEX('|',players.welcome_bonus_desc_sport)) AS WelcomeBonusSportDesc,
		luts_reg_playmode.lut_name AS RegistrationPlayMode,
		account_info.total_bets AS TotalBetsCasino,
		account_info.total_bets_sport AS TotalBetsSport,
		account_info.total_bets_live AS TotalBetsLive,
		account_info.total_bets_bingo AS TotalBetsBingo,
		players.deposits_count_casino AS DepositsCountCasino,
		players.deposits_count_sport AS DepositsCountSport,
		players.deposits_count_live AS DepositsCountLive,
		players.deposits_count_bingo AS DepositsCountBingo,
		account_info.bonus_balance_sport AS BonusBalanceSport,
		countries.country_id AS CountryID,
		countries.jurisdiction_id AS JurisdictionID,
		locales.Locale AS Locale,
		CASE WHEN players.activation_code IS NULL THEN 1 ELSE 0 END AS IsActivated,
		luts_aff_attempts.lut_name AS AffordabilityAttempts,
		account_info.affordability_treshold AS AffordabilityTreshold,
		account_info.affordability_balance AS AffordabilityBalance,
		luts_aff_status.lut_name AS AffordabilityStatus,
		players.aff_income_range_avg AS AffordabilityIncomeRangeChoice,
		players.affordability_last_update AS AffordabilityLastUpdate,
		players.platform_login_in AS LastLoginPlatform,
		players.winnings_restriction AS WinningsRestriction,
		(ISNULL(total_wins,0) + ISNULL(total_wins_sport,0) - ISNULL(total_bets, 0) - ISNULL(total_bets_sport, 0)) AS CurrentWinnings,
		(SELECT TOP 1 action_date
			FROM [ProgressPlayDB].common.tbl_Players_logins pl (NOLOCK)
			WHERE pl.player_id = players.player_id 
			AND action_type = 5
			AND action_desc = 'RG Event triggered : WinningsRestrictionFailed rg_event_cooloff - SoftBlock for 1440 minutes') AS WinningsRestrictionFailedDate,
		ISNULL((	SELECT	SUM(wr.requested_amount) 
					FROM	[ProgressPlayDB].crm.tbl_Withdrawal_requests AS wr  (NOLOCK)
					WHERE	wr.player_id = account_info.player_id 
					AND		wr.status_id IN (36,37,39,52)), 0) AS PendingWithdrawals,
		prof.ProfessionName AS Occupation,
		account_info.ftd_amount AS FTDAmount,
		account_info.ftd_settlement_company_id AS FTDSettlementCompanyID,
		DATEDIFF(YEAR, players.birthday, GETUTCDATE()) - CASE WHEN DATEADD(YEAR, DATEDIFF(YEAR, players.birthday, GETUTCDATE()), players.birthday) > GETUTCDATE() THEN 1 ELSE 0 END AS Age,
		prof.ProfessionID AS OccupationID,
		prof.YearlyIncome AS OccupationYearlyIncome
INTO #result
FROM   [ProgressPlayDB].common.tbl_Players AS players (NOLOCK)
OUTER APPLY (
    SELECT 
        v.PromotionalCasinoEmailEnabled,
		v.PromotionalCasinoSMSEnabled,
        v.PromotionalSportsEmailEnabled,
        v.PromotionalSportsSMSEnabled,
		v.PromotionalBingoEmailEnabled,
        v.PromotionalBingoSMSEnabled,
        v.PromotionalPostEnabled,
		v.PromotionalPushEnabled,
		v.PromotionalPhoneEnabled,
		v.PromotionalPartnerEnabled		
    FROM [ProgressPlayDB].common.vw_player_communication v
    WHERE v.player_id = players.player_id
) consents
INNER MERGE JOIN [ProgressPlayDB].accounts.tbl_Account_Info AS account_info on account_info.player_id = players.player_id 
INNER JOIN [ProgressPlayDB].common.tbl_White_labels AS whiteLabels on whiteLabels.label_id = players.white_label_id
INNER JOIN [ProgressPlayDB].common.tbl_Statuses AS statuses on statuses.status_id = players.status_id
INNER JOIN [ProgressPlayDB].common.tbl_Countries AS countries on countries.country_id = players.country_id
INNER JOIN [ProgressPlayDB].common.tbl_Currencies AS currencies on currencies.currency_id = players.currency_id
INNER JOIN [ProgressPlayDB].common.tbl_Luts AS luts_lang on luts_lang.lut_id = players.language_id
INNER JOIN [ProgressPlayDB].common.tbl_Locales AS locales on locales.ID = players.language_id
LEFT JOIN [ProgressPlayDB].common.tbl_Luts AS luts_risk on luts_risk.lut_id = players.risk_level_id
LEFT JOIN [ProgressPlayDB].common.tbl_Luts AS luts_block ON luts_block.lut_id = players.block_type 
LEFT JOIN [ProgressPlayDB].common.tbl_Luts AS luts_gender on luts_gender.lut_id = players.gender_id
LEFT JOIN [ProgressPlayDB].common.tbl_Back_office_users AS bousers ON bousers.[user_id] = players.bo_agent
LEFT JOIN [ProgressPlayDB].common.tbl_Luts AS luts_aff_attempts on luts_aff_attempts.lut_id = players.affordability_attempts
LEFT JOIN [ProgressPlayDB].common.tbl_Luts AS luts_aff_status on luts_aff_status.lut_id = players.aff_status
LEFT JOIN [ProgressPlayDB].common.tbl_Professions prof on prof.ProfessionID = players.profession_id
LEFT JOIN [ProgressPlayDB].common.tbl_Luts AS luts_reg_playmode on luts_reg_playmode.lut_id = players.registration_play_mode
WHERE 	(ISNULL(players.last_update, players.updated_dt) >= @players_from_date AND ISNULL(players.last_update, players.updated_dt) <= @players_to_date) OR	
		(account_info.updated_dt >= @players_from_date AND account_info.updated_dt <= @players_to_date)
OPTION(MAXDOP 1)

CREATE UNIQUE CLUSTERED INDEX [IX_#result] ON #result(PlayerID) WITH (DATA_COMPRESSION = PAGE);

-- Update DB [DailyActionsDB]

MERGE INTO [DailyActionsDB].common.tbl_Daily_actions_players AS [TARGET]
USING #result AS [SOURCE]
ON [SOURCE].PlayerID = [TARGET].PlayerID 
WHEN MATCHED THEN UPDATE 
SET		[TARGET].CasinoName			= [SOURCE].CasinoName,
		[TARGET].CasinoID			= [SOURCE].CasinoID,
		[TARGET].Email				= [SOURCE].Email,
		[TARGET].FirstName			= [SOURCE].FirstName,
		[TARGET].LastName			= [SOURCE].LastName,		
		[TARGET].Alias				= [SOURCE].Alias,
		[TARGET].Currency			= [SOURCE].Currency,
		[TARGET].CurrencySymbol 	= [SOURCE].CurrencySymbol,
		[TARGET].AffiliateID		= [SOURCE].AffiliateID,
		[TARGET].DynamicParameter	= [SOURCE].DynamicParameter,
		[TARGET].ClickID			= [SOURCE].ClickID,
		[TARGET].PromotionCode		= [SOURCE].PromotionCode,
		[TARGET].CountryCode		= [SOURCE].CountryCode,
		[TARGET].MobileNumber		= [SOURCE].MobileNumber,
		[TARGET].FullMobileNumber   = [SOURCE].FullMobileNumber,
		[TARGET].Country			= [SOURCE].Country,
		[TARGET].City				= [SOURCE].City,
		[TARGET].Address			= [SOURCE].Address,
		[TARGET].ZipCode			= [SOURCE].ZipCode,
		[TARGET].Gender				= [SOURCE].Gender,
		[TARGET].DateOfBirth		= [SOURCE].DateOfBirth,
		[TARGET].[Language]			= [SOURCE].[Language],
		[TARGET].IP					= [SOURCE].IP,
		[TARGET].RegisteredDate		= [SOURCE].RegisteredDate,
		[TARGET].FirstDepositDate	= [SOURCE].FirstDepositDate,
		[TARGET].LastLoginDate		= [SOURCE].LastLoginDate,
		[TARGET].LastDepositDate	= [SOURCE].LastDepositDate,
		[TARGET].VIPLevel			= [SOURCE].VIPLevel,
		[TARGET].Ranking			= [SOURCE].Ranking,
		[TARGET].RegisteredPlatform	= [SOURCE].RegisteredPlatform,
		[TARGET].PlatformString		= [SOURCE].PlatformString,
		[TARGET].WelcomeBonus		= [SOURCE].WelcomeBonus,

		[TARGET].WelcomeBonusCode		= [SOURCE].WelcomeBonusCode,
		[TARGET].WelcomeBonusDesc		= [SOURCE].WelcomeBonusDesc,

		[TARGET].DocumentsStatus	= [SOURCE].DocumentsStatus,
		[TARGET].SMSEnabled			= [SOURCE].SMSEnabled,
		[TARGET].PushEnabled		= [SOURCE].PushEnabled,
		[TARGET].MailEnabled		= [SOURCE].MailEnabled,
		[TARGET].IsOptIn			= [SOURCE].IsOptIn,
		[TARGET].PromotionsEnabled	= [SOURCE].PromotionsEnabled,

		[TARGET].PromotionsMailEnabled	= [SOURCE].PromotionsMailEnabled,
		[TARGET].PromotionsSMSEnabled	= [SOURCE].PromotionsSMSEnabled,
		[TARGET].PromotionsPushEnabled	= [SOURCE].PromotionsPushEnabled,
		[TARGET].PromotionsPhoneEnabled	= [SOURCE].PromotionsPhoneEnabled,
		[TARGET].PromotionsPostEnabled	= [SOURCE].PromotionsPostEnabled,
		[TARGET].PromotionsPartnerEnabled	= [SOURCE].PromotionsPartnerEnabled,

		[TARGET].PromotionalCasinoEmailEnabled	= [SOURCE].PromotionalCasinoEmailEnabled,
		[TARGET].PromotionalCasinoSMSEnabled	= [SOURCE].PromotionalCasinoSMSEnabled,
		[TARGET].PromotionalBingoEmailEnabled	= [SOURCE].PromotionalBingoEmailEnabled,
		[TARGET].PromotionalBingoSMSEnabled		= [SOURCE].PromotionalBingoSMSEnabled,
		[TARGET].PromotionalSportsEmailEnabled	= [SOURCE].PromotionalSportsEmailEnabled,
		[TARGET].PromotionalSportsSMSEnabled	= [SOURCE].PromotionalSportsSMSEnabled,
		[TARGET].PromotionalPushEnabled			= [SOURCE].PromotionalPushEnabled,
		[TARGET].PromotionalPhoneEnabled 		= [SOURCE].PromotionalPhoneEnabled,
		[TARGET].PromotionalPostEnabled			= [SOURCE].PromotionalPostEnabled,
		[TARGET].PromotionalPartnerEnabled		= [SOURCE].PromotionalPartnerEnabled,

		[TARGET].BonusesEnabled		= [SOURCE].BonusesEnabled,
		[TARGET].LoggedIn			= [SOURCE].LoggedIn,
		[TARGET].IsTest				= [SOURCE].IsTest,	
		[TARGET].[Status]			= [SOURCE].[Status],
		[TARGET].IsBlocked			= [SOURCE].IsBlocked,
		[TARGET].BlockDate			= [SOURCE].BlockDate,
		[TARGET].BlockReason		= [SOURCE].BlockReason,
		[TARGET].BlockReleaseDate	= [SOURCE].BlockReleaseDate,
		[TARGET].BlockType			= [SOURCE].BlockType,
		[TARGET].BOAgent			= [SOURCE].BOAgent,
		[TARGET].AccountBalance		= [SOURCE].AccountBalance,
		[TARGET].BonusBalance		= [SOURCE].BonusBalance,
		[TARGET].Balance			= [SOURCE].Balance,
		[TARGET].OriginalBalance	= [SOURCE].OriginalBalance,
		[TARGET].MaxBalance			= [SOURCE].MaxBalance,
		[TARGET].DepositsCount		= [SOURCE].DepositsCount,
		[TARGET].TotalDeposits		= [SOURCE].TotalDeposits,
		[TARGET].TotalWithdrawals	= [SOURCE].TotalWithdrawals,
		[TARGET].TotalChargeBacks	= [SOURCE].TotalChargeBacks,
		[TARGET].TotalChargebackReverses	= [SOURCE].TotalChargebackReverses,
		[TARGET].TotalVoids					= [SOURCE].TotalVoids,
		[TARGET].TotalBonuses				= [SOURCE].TotalBonuses,
		[TARGET].TotalCustomerClubPoints	= [SOURCE].TotalCustomerClubPoints,
		[TARGET].CustomerClubPoints			= [SOURCE].CustomerClubPoints,
		[TARGET].Wagered					= [SOURCE].Wagered,
		[TARGET].LastUpdated				= [SOURCE].LastUpdated,
		[TARGET].LastUpdate					= [SOURCE].LastUpdate,
		[TARGET].RevenueEUR					= [SOURCE].RevenueEUR,

		[TARGET].WelcomeBonusSport					= [SOURCE].WelcomeBonusSport,


		[TARGET].WelcomeBonusSportCode		= [SOURCE].WelcomeBonusSportCode,
		[TARGET].WelcomeBonusSportDesc		= [SOURCE].WelcomeBonusSportDesc,

		[TARGET].RegistrationPlayMode				= [SOURCE].RegistrationPlayMode,
		[TARGET].TotalBetsCasino					= [SOURCE].TotalBetsCasino,
		[TARGET].TotalBetsSport						= [SOURCE].TotalBetsSport,
		[TARGET].TotalBetsLive						= [SOURCE].TotalBetsLive,
		[TARGET].TotalBetsBingo						= [SOURCE].TotalBetsBingo,

		[TARGET].DepositsCountCasino				= [SOURCE].DepositsCountCasino,
		[TARGET].DepositsCountSport					= [SOURCE].DepositsCountSport,
		[TARGET].DepositsCountLive					= [SOURCE].DepositsCountLive,
		[TARGET].DepositsCountBingo					= [SOURCE].DepositsCountBingo,
		[TARGET].BonusBalanceSport					= [SOURCE].BonusBalanceSport,
		[TARGET].CountryID							= [SOURCE].CountryID,
		[TARGET].JurisdictionID						= [SOURCE].JurisdictionID,
		[TARGET].Locale								= [SOURCE].Locale,
		[TARGET].IsActivated						= [SOURCE].IsActivated,
		[TARGET].AffordabilityAttempts				= [SOURCE].AffordabilityAttempts,
		[TARGET].AffordabilityTreshold				= [SOURCE].AffordabilityTreshold,
		[TARGET].AffordabilityBalance				= [SOURCE].AffordabilityBalance,
		[TARGET].AffordabilityStatus				= [SOURCE].AffordabilityStatus,
		[TARGET].AffordabilityIncomeRangeChoice		= [SOURCE].AffordabilityIncomeRangeChoice,
		[TARGET].AffordabilityLastUpdate			= [SOURCE].AffordabilityLastUpdate,
		[TARGET].LastLoginPlatform					= [SOURCE].LastLoginPlatform,
		[TARGET].WinningsRestriction				= [SOURCE].WinningsRestriction,
		[TARGET].CurrentWinnings					= [SOURCE].CurrentWinnings,
		[TARGET].WinningsRestrictionFailedDate		= [SOURCE].WinningsRestrictionFailedDate,
		[TARGET].PendingWithdrawals					= [SOURCE].PendingWithdrawals,
		[TARGET].Occupation							= [SOURCE].Occupation,
		[TARGET].FTDAmount							= [SOURCE].FTDAmount,
		[TARGET].FTDSettlementCompanyID				= [SOURCE].FTDSettlementCompanyID,
		[TARGET].Age								= [SOURCE].Age,
		[TARGET].OccupationID						= [SOURCE].OccupationID,
		[TARGET].OccupationYearlyIncome				= [SOURCE].OccupationYearlyIncome
WHEN NOT MATCHED BY TARGET
THEN INSERT (PlayerID,
			CasinoName,
			CasinoID,
			Email,
			FirstName,
			LastName,		
			Alias,
			Currency,
			CurrencySymbol,
			AffiliateID,
			DynamicParameter,
			ClickID,
			PromotionCode,
			CountryCode,
			MobileNumber,
			Country,
			City,
			Address,
			ZipCode,
			Gender,
			DateOfBirth,
			[Language],
			IP,
			RegisteredDate,
			FirstDepositDate,
			LastLoginDate,
			LastDepositDate,
			VIPLevel,
			Ranking,
			RegisteredPlatform,
			PlatformString,
			WelcomeBonus,
			DocumentsStatus,
			SMSEnabled,
			PushEnabled,
			MailEnabled,
			IsOptIn,
			PromotionsEnabled,

			PromotionsMailEnabled,
			PromotionsSMSEnabled,
			PromotionsPushEnabled,
			PromotionsPhoneEnabled,
			PromotionsPostEnabled,
			PromotionsPartnerEnabled,

			PromotionalCasinoEmailEnabled,
			PromotionalCasinoSMSEnabled,
			PromotionalBingoEmailEnabled,
			PromotionalBingoSMSEnabled,
			PromotionalSportsEmailEnabled,
			PromotionalSportsSMSEnabled,
			PromotionalPushEnabled,
			PromotionalPhoneEnabled,
			PromotionalPostEnabled,
			PromotionalPartnerEnabled,

			BonusesEnabled,
			LoggedIn,
			IsTest,	
			[Status],
			IsBlocked,
			BlockDate,
			BlockReason,
			BlockReleaseDate,
			BlockType,
			BOAgent,
			AccountBalance,
			BonusBalance,
			Balance,
			OriginalBalance,
			MaxBalance,
			DepositsCount,
			TotalDeposits,
			TotalWithdrawals,
			TotalChargeBacks,
			TotalChargebackReverses,
			TotalVoids,
			TotalBonuses,
			TotalCustomerClubPoints,
			CustomerClubPoints,
			Wagered,
			LastUpdated,
			LastUpdate,
			RevenueEUR,
			WelcomeBonusSport,
			RegistrationPlayMode,
			TotalBetsCasino,
			TotalBetsSport,
			TotalBetsLive,
			TotalBetsBingo,
			DepositsCountCasino,
			DepositsCountSport,
			DepositsCountLive,
			DepositsCountBingo,
			BonusBalanceSport,
			CountryID,
			JurisdictionID,
			Locale,
			IsActivated,
			AffordabilityAttempts,
			AffordabilityTreshold,
			AffordabilityBalance,
			AffordabilityStatus,
			AffordabilityIncomeRangeChoice,
			AffordabilityLastUpdate,
			LastLoginPlatform,
			WinningsRestriction,
			CurrentWinnings,
			WinningsRestrictionFailedDate,
			PendingWithdrawals,
			Occupation,
			FTDAmount,
			FTDSettlementCompanyID,
			Age,
			OccupationID,
			OccupationYearlyIncome)
VALUES ([SOURCE].PlayerID, 
		[SOURCE].CasinoName,
		[SOURCE].CasinoID,
		[SOURCE].Email,
		[SOURCE].FirstName,
		[SOURCE].LastName,
		[SOURCE].Alias,
		[SOURCE].Currency,
		[SOURCE].CurrencySymbol,
		[SOURCE].AffiliateID,
		[SOURCE].DynamicParameter,
		[SOURCE].ClickID,
		[SOURCE].PromotionCode,
		[SOURCE].CountryCode,
		[SOURCE].MobileNumber,
		[SOURCE].Country,
		[SOURCE].City,
		[SOURCE].Address,
		[SOURCE].ZipCode,
		[SOURCE].Gender,
		[SOURCE].DateOfBirth,
		[SOURCE].[Language],
		[SOURCE].IP,
		[SOURCE].RegisteredDate,
		[SOURCE].FirstDepositDate,
		[SOURCE].LastLoginDate,
		[SOURCE].LastDepositDate,
		[SOURCE].VIPLevel,
		[SOURCE].Ranking,
		[SOURCE].RegisteredPlatform,
		[SOURCE].PlatformString,
		[SOURCE].WelcomeBonus,
		[SOURCE].DocumentsStatus,
		[SOURCE].SMSEnabled,
		[SOURCE].PushEnabled,
		[SOURCE].MailEnabled,
		[SOURCE].IsOptIn,
		[SOURCE].PromotionsEnabled,

		[SOURCE].PromotionsMailEnabled,
		[SOURCE].PromotionsSMSEnabled,
		[SOURCE].PromotionsPushEnabled,
		[SOURCE].PromotionsPhoneEnabled,
		[SOURCE].PromotionsPostEnabled,
		[SOURCE].PromotionsPartnerEnabled,

		[SOURCE].PromotionalCasinoEmailEnabled,
		[SOURCE].PromotionalCasinoSMSEnabled,
		[SOURCE].PromotionalBingoEmailEnabled,
		[SOURCE].PromotionalBingoSMSEnabled,
		[SOURCE].PromotionalSportsEmailEnabled,
		[SOURCE].PromotionalSportsSMSEnabled,
		[SOURCE].PromotionalPushEnabled,
		[SOURCE].PromotionalPhoneEnabled,
		[SOURCE].PromotionalPostEnabled,
		[SOURCE].PromotionalPartnerEnabled,

		[SOURCE].BonusesEnabled,
		[SOURCE].LoggedIn,
		[SOURCE].IsTest,
		[SOURCE].[Status],
		[SOURCE].IsBlocked,
		[SOURCE].BlockDate,
		[SOURCE].BlockReason,
		[SOURCE].BlockReleaseDate,
		[SOURCE].BlockType,
		[SOURCE].BOAgent,
		[SOURCE].AccountBalance,
		[SOURCE].BonusBalance,
		[SOURCE].Balance,
		[SOURCE].OriginalBalance,
		[SOURCE].MaxBalance,
		[SOURCE].DepositsCount,
		[SOURCE].TotalDeposits,
		[SOURCE].TotalWithdrawals,
		[SOURCE].TotalChargeBacks,
		[SOURCE].TotalChargebackReverses,
		[SOURCE].TotalVoids,
		[SOURCE].TotalBonuses,
		[SOURCE].TotalCustomerClubPoints,
		[SOURCE].CustomerClubPoints,
		[SOURCE].Wagered,
		[SOURCE].LastUpdated,
		[SOURCE].LastUpdate,
		[SOURCE].RevenueEUR,
		[SOURCE].WelcomeBonusSport,
		[SOURCE].RegistrationPlayMode,
		[SOURCE].TotalBetsCasino,
		[SOURCE].TotalBetsSport,
		[SOURCE].TotalBetsLive,
		[SOURCE].TotalBetsBingo,
		[SOURCE].DepositsCountCasino,
		[SOURCE].DepositsCountSport,
		[SOURCE].DepositsCountLive,
		[SOURCE].DepositsCountBingo,
		[SOURCE].BonusBalanceSport,
		[SOURCE].CountryID,
		[SOURCE].JurisdictionID,
		[SOURCE].Locale,
		[SOURCE].IsActivated,
		[SOURCE].AffordabilityAttempts,
		[SOURCE].AffordabilityTreshold,
		[SOURCE].AffordabilityBalance,
		[SOURCE].AffordabilityStatus,
		[SOURCE].AffordabilityIncomeRangeChoice,
		[SOURCE].AffordabilityLastUpdate,
		[SOURCE].LastLoginPlatform,
		[SOURCE].WinningsRestriction,
		[SOURCE].CurrentWinnings,
		[SOURCE].WinningsRestrictionFailedDate,
		[SOURCE].PendingWithdrawals,
		[SOURCE].Occupation,
		[SOURCE].FTDAmount,
		[SOURCE].FTDSettlementCompanyID,
		[SOURCE].Age,
		[SOURCE].OccupationID,
		[SOURCE].OccupationYearlyIncome);

SET @rows = @@ROWCOUNT

INSERT INTO [DailyActionsDB].common.tbl_Daily_log 
(ProcName, StartTime, EndTime, RowsStartTime, RowsEndTime, RowsAmount)
SELECT OBJECT_NAME(@@PROCID), @now, GETUTCDATE(), @players_from_date,@players_to_date, @rows

  END

GO
/****** Object:  StoredProcedure [dbo].[stp_DailyActions_Players_old]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[stp_DailyActions_Players_old]

AS
BEGIN

-- =============================================
-- Author:		Rotem.Madeira
-- Create date: 26/7/2016
-- Description:	Runs every 10 minutes to insert new transactions to the [common].[tbl_Daily_actions_players] table
-- =============================================

SET NOCOUNT ON;


IF OBJECT_ID ('tempdb..#Result') IS NOT NULL
	DROP TABLE #Result

DECLARE	@players_from_date		DATETIME2
DECLARE	@players_to_date		DATETIME2
DECLARE @now					DATETIME = GETUTCDATE()
DECLARE @rows					INT

SELECT @players_from_date = ISNULL(MAX(LastUpdated),'1900-01-01') FROM [DailyActionsDB].common.tbl_Daily_actions_players (NOLOCK)
SELECT @players_to_date =	DATEADD(MINUTE,-1,GETUTCDATE())

SELECT @players_from_date, @players_to_date


SELECT	players.player_id								AS PlayerID,
		whiteLabels.label_name							AS CasinoName,
		players.first_name + ' ' + players.last_name	AS Alias,
		players.registration_date						AS RegisteredDate,
		players.ftd_date								AS FirstDepositDate,
		players.birthday								AS DateOfBirth,
		luts_genders.lut_name							AS Gender,
		countries.country_name							AS Country,
		currencies.currency_code						AS Currency,
		''												AS ReferralType,
		(ISNULL(account_info.account_balance,0) + 
		ISNULL(account_info.bonus_balance,0)) * 
		currencies.rate_in_EUR							AS Balance,
		ISNULL(account_info.account_balance,0) + 
		ISNULL(account_info.bonus_balance,0)			AS OriginalBalance,
		players.tracker_id								AS AffiliateID,
		luts_languages.lut_name							AS [Language],
		CASE	WHEN players.lucky_charm_image = '|W' 
				THEN 'WEB' ELSE 'MOBILE' END			AS RegisteredPlatform,
		players.email									AS Email,
		players.promotional_mail_enabled				AS IsOptIn,
		CASE	WHEN players.status_id = 9 
				THEN 1 ELSE 0 END						AS IsBlocked,
		players.is_internal								AS IsTest,
		players.last_login_date							AS LastLoginDate,
		account_info.ranking							AS VIPLevel,
		ISNULL(account_info.total_deposits, 0.00)		AS TotalDeposits,
		ISNULL(account_info.total_withdrawals, 0.00)	AS TotalWithdrawals,
		players.updated_dt								AS LastUpdated
INTO #result
FROM   [ProgressPlayDB].common.vew_Players AS players WITH (NOLOCK)
inner join [ProgressPlayDB].common.vew_White_labels as whiteLabels on whiteLabels.label_id = players.white_label_id
inner join [ProgressPlayDB].accounts.vew_Account_Info as account_info on account_info.player_id = players.player_id 
inner join [ProgressPlayDB].common.vew_Statuses as statuses on statuses.status_id = players.status_id
inner join [ProgressPlayDB].common.tbl_Countries as countries on countries.country_id = players.country_id
inner join [ProgressPlayDB].common.vew_Currencies as currencies on currencies.currency_id = players.currency_id
inner join [ProgressPlayDB].common.vew_Luts as luts_languages on luts_languages.lut_id = players.language_id
left outer join [ProgressPlayDB].common.vew_Luts as luts_genders on luts_genders.lut_id = players.gender_id
WHERE 	(players.updated_dt > @players_from_date AND players.updated_dt <= @players_to_date) OR	
		(account_info.updated_dt > @players_from_date AND account_info.updated_dt <= @players_to_date)


-- Update DB [DailyActionsDB]

MERGE INTO [DailyActionsDB].common.tbl_Daily_actions_players AS [TARGET]
USING #result AS [SOURCE]
ON [SOURCE].PlayerID = [TARGET].PlayerID 
WHEN MATCHED AND SOURCE.LastUpdated > TARGET.LastUpdated THEN UPDATE 
SET		[TARGET].CasinoName			= [SOURCE].CasinoName,
		[TARGET].Alias				= [SOURCE].Alias,
		[TARGET].RegisteredDate		= [SOURCE].RegisteredDate,
		[TARGET].FirstDepositDate	= [SOURCE].FirstDepositDate,
		[TARGET].DateOfBirth		= [SOURCE].DateOfBirth,
		[TARGET].Gender				= [SOURCE].Gender,
		[TARGET].Country			= [SOURCE].Country,
		[TARGET].Currency			= [SOURCE].Currency,
		[TARGET].Balance			= [SOURCE].Balance,			
		[TARGET].OriginalBalance	= [SOURCE].OriginalBalance,
		[TARGET].AffiliateID		= [SOURCE].AffiliateID,
		[TARGET].[Language]			= [SOURCE].[Language],	
		[TARGET].RegisteredPlatform = [SOURCE].RegisteredPlatform,
		[TARGET].Email				= [SOURCE].Email,
		[TARGET].IsOptIn			= [SOURCE].IsOptIn,
		[TARGET].IsBlocked			= [SOURCE].IsBlocked,
		[TARGET].IsTest				= [SOURCE].IsTest,
		[TARGET].LastLoginDate		= [SOURCE].LastLoginDate,
		[TARGET].VIPLevel			= [SOURCE].VIPLevel,
		[TARGET].TotalDeposits		= [SOURCE].TotalDeposits,
		[TARGET].TotalWithdrawals	= [SOURCE].TotalWithdrawals,
		[TARGET].LastUpdated		= [SOURCE].LastUpdated
WHEN NOT MATCHED BY TARGET
THEN INSERT (PlayerId, CasinoName,Alias,RegisteredDate,FirstDepositDate	
,DateOfBirth,Gender,Country,Currency,Balance			
,OriginalBalance,AffiliateID,[Language],RegisteredPlatform
,Email,IsOptIn,IsBlocked,IsTest,LastLoginDate,
VIPLevel, TotalDeposits, TotalWithdrawals, LastUpdated)
VALUES ([SOURCE].PlayerID, [SOURCE].CasinoName,[SOURCE].Alias,[SOURCE].RegisteredDate,[SOURCE].FirstDepositDate,[SOURCE].DateOfBirth,
[SOURCE].Gender,[SOURCE].Country,[SOURCE].Currency,[SOURCE].Balance,[SOURCE].OriginalBalance,[SOURCE].AffiliateID,
[SOURCE].[Language],[SOURCE].RegisteredPlatform,[SOURCE].Email,[SOURCE].IsOptIn,[SOURCE].IsBlocked,
[SOURCE].IsTest,[SOURCE].LastLoginDate,[SOURCE].VIPLevel,[SOURCE].TotalDeposits,[SOURCE].TotalWithdrawals,[SOURCE].LastUpdated);

SET @rows = @@ROWCOUNT

INSERT INTO [DailyActionsDB].common.tbl_Daily_log 
(ProcName, StartTime, EndTime, RowsStartTime, RowsEndTime, RowsAmount)
SELECT OBJECT_NAME(@@PROCID), @now, GETUTCDATE(), @players_from_date,@players_to_date, @rows

  END
GO
/****** Object:  StoredProcedure [dbo].[stp_DailyActions_Players_old_promotions]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



CREATE PROCEDURE [dbo].[stp_DailyActions_Players_old_promotions]

AS
BEGIN

-- =============================================
-- Author:		Oren.Sultan
-- Create date: 01/11/2016
-- Description:	Runs every 10 minutes to insert new transactions to the [common].[tbl_Daily_actions_players] table
-- =============================================

SET NOCOUNT ON;


IF OBJECT_ID ('tempdb..#result') IS NOT NULL
	DROP TABLE #result

DECLARE	@players_from_date		DATETIME
DECLARE	@players_to_date		DATETIME
DECLARE @now					DATETIME = GETUTCDATE()
DECLARE @rows					INT

SELECT @players_from_date = DATEADD(MILLISECOND,-1,ISNULL(MAX(LastUpdate),'1900-01-01')) FROM [DailyActionsDB].common.tbl_Daily_actions_players (NOLOCK)
SELECT @players_to_date =	DATEADD(MILLISECOND,-1,GETUTCDATE())

--SELECT @players_from_date, @players_to_date

SELECT	players.player_id								AS PlayerID,
		whiteLabels.label_name							AS CasinoName,	
		whiteLabels.label_id							AS CasinoID,
		players.email									AS Email,
		players.first_name								AS FirstName,
		players.last_name								AS LastName,
		players.first_name + ' ' + players.last_name	AS Alias,
		currencies.currency_code						AS Currency,		
		currencies.currency_symbol						AS CurrencySymbol,
		players.tracker_id								AS AffiliateID,
		''												AS ReferralType,
		players.dynamic_parameter						AS DynamicParameter,
		players.click_id								AS ClickID,
		players.promotion_code							AS PromotionCode,
		countries.phone_code							AS CountryCode,
		players.phone_number							AS PhoneNumber,
		players.cellphone_number						AS MobileNumber,
		SUBSTRING(CONCAT(countries.phone_code, REPLACE(LTRIM(REPLACE(players.cellphone_number,'0',' ')),' ','0')),0, 64) AS FullMobileNumber,
		countries.country_name							AS Country,
		players.city									AS City,
		players.[address]								AS Address,
		players.zipcode									AS ZipCode,
		luts_gender.lut_name							AS Gender,
		players.birthday								AS DateOfBirth,	
		luts_lang.lut_name								AS [Language],		
		players.last_ip									AS IP, 
		players.registration_date						AS RegisteredDate,
		players.ftd_date								AS FirstDepositDate,
		players.last_login_date							AS LastLoginDate,
		players.last_deposit_date						AS LastDepositDate, 	
		account_info.ranking							AS VIPLevel,
		account_info.ranking							AS Ranking, 
		players.platform_registered_in					AS RegisteredPlatform,
		players.lucky_charm_image						AS PlatformString,
		players.welcome_bonus_desc						AS WelcomeBonus, 
		SUBSTRING(players.welcome_bonus_desc,CHARINDEX('|',players.welcome_bonus_desc)+1,LEN(players.welcome_bonus_desc)) AS WelcomeBonusCode,
		SUBSTRING(players.welcome_bonus_desc,0,CHARINDEX('|',players.welcome_bonus_desc)) AS WelcomeBonusDesc,
		luts_risk.lut_name								AS DocumentsStatus,
		players.sms_notifications_enabled				AS SMSEnabled,
		players.is_push_enabled							AS PushEnabled,
		players.mail_notifications_enabled				AS MailEnabled,

		--CASE WHEN players.block_type = 663 THEN 0 ELSE players.promotional_mail_enabled	END	AS IsOptIn,
		--CASE WHEN players.block_type = 663 THEN 0 ELSE players.promotional_mail_enabled	END	AS PromotionsEnabled,
		--CASE WHEN players.block_type = 663 THEN 0 ELSE players.promotional_mail_enabled	END	AS PromotionsMailEnabled,
		--CASE WHEN players.block_type = 663 THEN 0 ELSE players.promotional_sms_enabled	END	AS PromotionsSMSEnabled,
		--CASE WHEN players.block_type = 663 THEN 0 ELSE players.promotional_push_enabled	END	AS PromotionsPushEnabled,
		--CASE WHEN players.block_type = 663 THEN 0 ELSE players.promotional_phone_enabled END AS PromotionsPhoneEnabled,
		--CASE WHEN players.block_type = 663 THEN 0 ELSE players.promotional_post_enabled	END AS PromotionsPostEnabled,
		--CASE WHEN players.block_type = 663 THEN 0 ELSE players.promotional_partner_enabled END AS PromotionsPartnerEnabled,	
		--CASE WHEN players.block_type = 663 THEN 0 ELSE players.bonuses_enabled END AS BonusesEnabled,

		players.promotional_mail_enabled AS IsOptIn,
		players.promotional_mail_enabled AS PromotionsEnabled,
		players.promotional_mail_enabled AS PromotionsMailEnabled,
		players.promotional_sms_enabled	AS PromotionsSMSEnabled,
		players.promotional_push_enabled AS PromotionsPushEnabled,
		players.promotional_phone_enabled AS PromotionsPhoneEnabled,
		players.promotional_post_enabled AS PromotionsPostEnabled,
		players.promotional_partner_enabled AS PromotionsPartnerEnabled,	
		players.bonuses_enabled AS BonusesEnabled,

		players.logged_in								AS LoggedIn,
		players.is_internal								AS IsTest,
		statuses.status_name							AS Status,
		CASE	WHEN players.status_id = 9 THEN 1 ELSE 0 END						AS IsBlocked,

		players.block_date AS BlockDate,
		players.block_release_date AS BlockReleaseDate,
		players.block_reason AS BlockReason,
		luts_block.lut_name AS BlockType,
		bousers.username								AS BOAgent, 
		account_info.account_balance					AS AccountBalance, 
		account_info.bonus_balance						AS BonusBalance, 
		(ISNULL(account_info.account_balance,0) + ISNULL(account_info.bonus_balance,0)) 		AS Balance,
		ISNULL(account_info.account_balance,0) + ISNULL(account_info.bonus_balance,0)			AS OriginalBalance,
		account_info.max_balance												AS MaxBalance, 
		players.deposits_count													AS DepositsCount, 
		ISNULL(account_info.total_deposits, 0.00)								AS TotalDeposits,
		ISNULL(account_info.total_withdrawals, 0.00)							AS TotalWithdrawals,
		ISNULL(account_info.total_chargebacks, 0.00)							AS TotalChargeBacks, 
		ISNULL(account_info.total_chargeback_reverses, 0.00)					AS TotalChargebackReverses,
		ISNULL(account_info.total_voids, 0.00)									AS TotalVoids, 
		ISNULL(account_info.total_bonuses, 0.00)								AS TotalBonuses, 
		ISNULL(account_info.total_customer_club_points, 0.00)					AS TotalCustomerClubPoints, 
		ISNULL(account_info.customer_club_points, 0.00)							AS CustomerClubPoints, 
		ISNULL(account_info.wagered, 0.00)										AS Wagered,
		players.updated_dt														AS LastUpdated,
		CASE WHEN ISNULL(players.last_update, players.updated_dt) > account_info.updated_dt THEN ISNULL(players.last_update, players.updated_dt) ELSE account_info.updated_dt END AS LastUpdate,
		[ProgressPlayDB].dbo.fnc_GetPlayerRevenue(players.player_id)			AS RevenueEUR,
		players.welcome_bonus_desc_sport	AS	WelcomeBonusSport,
		SUBSTRING(players.welcome_bonus_desc_sport,CHARINDEX('|',players.welcome_bonus_desc_sport)+1,LEN(players.welcome_bonus_desc_sport)) AS WelcomeBonusSportCode,
		SUBSTRING(players.welcome_bonus_desc_sport,0,CHARINDEX('|',players.welcome_bonus_desc_sport)) AS WelcomeBonusSportDesc,
		luts_reg_playmode.lut_name AS RegistrationPlayMode,
		account_info.total_bets AS TotalBetsCasino,
		account_info.total_bets_sport AS TotalBetsSport,
		account_info.total_bets_live AS TotalBetsLive,
		account_info.total_bets_bingo AS TotalBetsBingo,
		players.deposits_count_casino AS DepositsCountCasino,
		players.deposits_count_sport AS DepositsCountSport,
		players.deposits_count_live AS DepositsCountLive,
		players.deposits_count_bingo AS DepositsCountBingo,
		account_info.bonus_balance_sport AS BonusBalanceSport,
		countries.country_id AS CountryID,
		countries.jurisdiction_id AS JurisdictionID,
		locales.Locale AS Locale,
		CASE WHEN players.activation_code IS NULL THEN 1 ELSE 0 END AS IsActivated,
		luts_aff_attempts.lut_name AS AffordabilityAttempts,
		account_info.affordability_treshold AS AffordabilityTreshold,
		account_info.affordability_balance AS AffordabilityBalance,
		luts_aff_status.lut_name AS AffordabilityStatus,
		players.aff_income_range_avg AS AffordabilityIncomeRangeChoice,
		players.affordability_last_update AS AffordabilityLastUpdate,
		players.platform_login_in AS LastLoginPlatform,
		players.winnings_restriction AS WinningsRestriction,
		(ISNULL(total_wins,0) + ISNULL(total_wins_sport,0) - ISNULL(total_bets, 0) - ISNULL(total_bets_sport, 0)) AS CurrentWinnings,
		(SELECT TOP 1 action_date
			FROM [ProgressPlayDB].common.tbl_Players_logins pl (NOLOCK)
			WHERE pl.player_id = players.player_id 
			AND action_type = 5
			AND action_desc = 'RG Event triggered : WinningsRestrictionFailed rg_event_cooloff - SoftBlock for 1440 minutes') AS WinningsRestrictionFailedDate,
		ISNULL((	SELECT	SUM(wr.requested_amount) 
					FROM	[ProgressPlayDB].crm.tbl_Withdrawal_requests AS wr  (NOLOCK)
					WHERE	wr.player_id = account_info.player_id 
					AND		wr.status_id IN (36,37,39,52)), 0) AS PendingWithdrawals,
		prof.ProfessionName AS Occupation,
		account_info.ftd_amount AS FTDAmount,
		account_info.ftd_settlement_company_id AS FTDSettlementCompanyID,
		DATEDIFF(YEAR, players.birthday, GETUTCDATE()) - CASE WHEN DATEADD(YEAR, DATEDIFF(YEAR, players.birthday, GETUTCDATE()), players.birthday) > GETUTCDATE() THEN 1 ELSE 0 END AS Age,
		prof.ProfessionID AS OccupationID,
		prof.YearlyIncome AS OccupationYearlyIncome
INTO #result
FROM   [ProgressPlayDB].common.tbl_Players AS players (NOLOCK)
INNER MERGE JOIN [ProgressPlayDB].accounts.tbl_Account_Info AS account_info on account_info.player_id = players.player_id 
INNER JOIN [ProgressPlayDB].common.tbl_White_labels AS whiteLabels on whiteLabels.label_id = players.white_label_id
INNER JOIN [ProgressPlayDB].common.tbl_Statuses AS statuses on statuses.status_id = players.status_id
INNER JOIN [ProgressPlayDB].common.tbl_Countries AS countries on countries.country_id = players.country_id
INNER JOIN [ProgressPlayDB].common.tbl_Currencies AS currencies on currencies.currency_id = players.currency_id
INNER JOIN [ProgressPlayDB].common.tbl_Luts AS luts_lang on luts_lang.lut_id = players.language_id
INNER JOIN [ProgressPlayDB].common.tbl_Locales AS locales on locales.ID = players.language_id
LEFT JOIN [ProgressPlayDB].common.tbl_Luts AS luts_risk on luts_risk.lut_id = players.risk_level_id
LEFT JOIN [ProgressPlayDB].common.tbl_Luts AS luts_block ON luts_block.lut_id = players.block_type 
LEFT JOIN [ProgressPlayDB].common.tbl_Luts AS luts_gender on luts_gender.lut_id = players.gender_id
LEFT JOIN [ProgressPlayDB].common.tbl_Back_office_users AS bousers ON bousers.[user_id] = players.bo_agent
LEFT JOIN [ProgressPlayDB].common.tbl_Luts AS luts_aff_attempts on luts_aff_attempts.lut_id = players.affordability_attempts
LEFT JOIN [ProgressPlayDB].common.tbl_Luts AS luts_aff_status on luts_aff_status.lut_id = players.aff_status
LEFT JOIN [ProgressPlayDB].common.tbl_Professions prof on prof.ProfessionID = players.profession_id
LEFT JOIN [ProgressPlayDB].common.tbl_Luts AS luts_reg_playmode on luts_reg_playmode.lut_id = players.registration_play_mode
WHERE 	(ISNULL(players.last_update, players.updated_dt) >= @players_from_date AND ISNULL(players.last_update, players.updated_dt) <= @players_to_date) OR	
		(account_info.updated_dt >= @players_from_date AND account_info.updated_dt <= @players_to_date)
OPTION(MAXDOP 1)

CREATE UNIQUE CLUSTERED INDEX [IX_#result] ON #result(PlayerID) WITH (DATA_COMPRESSION = PAGE);

-- Update DB [DailyActionsDB]

MERGE INTO [DailyActionsDB].common.tbl_Daily_actions_players AS [TARGET]
USING #result AS [SOURCE]
ON [SOURCE].PlayerID = [TARGET].PlayerID 
WHEN MATCHED THEN UPDATE 
SET		[TARGET].CasinoName			= [SOURCE].CasinoName,
		[TARGET].CasinoID			= [SOURCE].CasinoID,
		[TARGET].Email				= [SOURCE].Email,
		[TARGET].FirstName			= [SOURCE].FirstName,
		[TARGET].LastName			= [SOURCE].LastName,		
		[TARGET].Alias				= [SOURCE].Alias,
		[TARGET].Currency			= [SOURCE].Currency,
		[TARGET].CurrencySymbol 	= [SOURCE].CurrencySymbol,
		[TARGET].AffiliateID		= [SOURCE].AffiliateID,
		[TARGET].DynamicParameter	= [SOURCE].DynamicParameter,
		[TARGET].ClickID			= [SOURCE].ClickID,
		[TARGET].PromotionCode		= [SOURCE].PromotionCode,
		[TARGET].CountryCode		= [SOURCE].CountryCode,
		[TARGET].MobileNumber		= [SOURCE].MobileNumber,
		[TARGET].FullMobileNumber   = [SOURCE].FullMobileNumber,
		[TARGET].Country			= [SOURCE].Country,
		[TARGET].City				= [SOURCE].City,
		[TARGET].Address			= [SOURCE].Address,
		[TARGET].ZipCode			= [SOURCE].ZipCode,
		[TARGET].Gender				= [SOURCE].Gender,
		[TARGET].DateOfBirth		= [SOURCE].DateOfBirth,
		[TARGET].[Language]			= [SOURCE].[Language],
		[TARGET].IP					= [SOURCE].IP,
		[TARGET].RegisteredDate		= [SOURCE].RegisteredDate,
		[TARGET].FirstDepositDate	= [SOURCE].FirstDepositDate,
		[TARGET].LastLoginDate		= [SOURCE].LastLoginDate,
		[TARGET].LastDepositDate	= [SOURCE].LastDepositDate,
		[TARGET].VIPLevel			= [SOURCE].VIPLevel,
		[TARGET].Ranking			= [SOURCE].Ranking,
		[TARGET].RegisteredPlatform	= [SOURCE].RegisteredPlatform,
		[TARGET].PlatformString		= [SOURCE].PlatformString,
		[TARGET].WelcomeBonus		= [SOURCE].WelcomeBonus,

		[TARGET].WelcomeBonusCode		= [SOURCE].WelcomeBonusCode,
		[TARGET].WelcomeBonusDesc		= [SOURCE].WelcomeBonusDesc,

		[TARGET].DocumentsStatus	= [SOURCE].DocumentsStatus,
		[TARGET].SMSEnabled			= [SOURCE].SMSEnabled,
		[TARGET].PushEnabled		= [SOURCE].PushEnabled,
		[TARGET].MailEnabled		= [SOURCE].MailEnabled,
		[TARGET].IsOptIn			= [SOURCE].IsOptIn,
		[TARGET].PromotionsEnabled	= [SOURCE].PromotionsEnabled,

		[TARGET].PromotionsMailEnabled	= [SOURCE].PromotionsMailEnabled,
		[TARGET].PromotionsSMSEnabled	= [SOURCE].PromotionsSMSEnabled,
		[TARGET].PromotionsPushEnabled	= [SOURCE].PromotionsPushEnabled,
		[TARGET].PromotionsPhoneEnabled	= [SOURCE].PromotionsPhoneEnabled,
		[TARGET].PromotionsPostEnabled	= [SOURCE].PromotionsPostEnabled,
		[TARGET].PromotionsPartnerEnabled	= [SOURCE].PromotionsPartnerEnabled,



		[TARGET].BonusesEnabled		= [SOURCE].BonusesEnabled,
		[TARGET].LoggedIn			= [SOURCE].LoggedIn,
		[TARGET].IsTest				= [SOURCE].IsTest,	
		[TARGET].[Status]			= [SOURCE].[Status],
		[TARGET].IsBlocked			= [SOURCE].IsBlocked,
		[TARGET].BlockDate			= [SOURCE].BlockDate,
		[TARGET].BlockReason		= [SOURCE].BlockReason,
		[TARGET].BlockReleaseDate	= [SOURCE].BlockReleaseDate,
		[TARGET].BlockType			= [SOURCE].BlockType,
		[TARGET].BOAgent			= [SOURCE].BOAgent,
		[TARGET].AccountBalance		= [SOURCE].AccountBalance,
		[TARGET].BonusBalance		= [SOURCE].BonusBalance,
		[TARGET].Balance			= [SOURCE].Balance,
		[TARGET].OriginalBalance	= [SOURCE].OriginalBalance,
		[TARGET].MaxBalance			= [SOURCE].MaxBalance,
		[TARGET].DepositsCount		= [SOURCE].DepositsCount,
		[TARGET].TotalDeposits		= [SOURCE].TotalDeposits,
		[TARGET].TotalWithdrawals	= [SOURCE].TotalWithdrawals,
		[TARGET].TotalChargeBacks	= [SOURCE].TotalChargeBacks,
		[TARGET].TotalChargebackReverses	= [SOURCE].TotalChargebackReverses,
		[TARGET].TotalVoids					= [SOURCE].TotalVoids,
		[TARGET].TotalBonuses				= [SOURCE].TotalBonuses,
		[TARGET].TotalCustomerClubPoints	= [SOURCE].TotalCustomerClubPoints,
		[TARGET].CustomerClubPoints			= [SOURCE].CustomerClubPoints,
		[TARGET].Wagered					= [SOURCE].Wagered,
		[TARGET].LastUpdated				= [SOURCE].LastUpdated,
		[TARGET].LastUpdate					= [SOURCE].LastUpdate,
		[TARGET].RevenueEUR					= [SOURCE].RevenueEUR,

		[TARGET].WelcomeBonusSport					= [SOURCE].WelcomeBonusSport,


		[TARGET].WelcomeBonusSportCode		= [SOURCE].WelcomeBonusSportCode,
		[TARGET].WelcomeBonusSportDesc		= [SOURCE].WelcomeBonusSportDesc,

		[TARGET].RegistrationPlayMode				= [SOURCE].RegistrationPlayMode,
		[TARGET].TotalBetsCasino					= [SOURCE].TotalBetsCasino,
		[TARGET].TotalBetsSport						= [SOURCE].TotalBetsSport,
		[TARGET].TotalBetsLive						= [SOURCE].TotalBetsLive,
		[TARGET].TotalBetsBingo						= [SOURCE].TotalBetsBingo,

		[TARGET].DepositsCountCasino				= [SOURCE].DepositsCountCasino,
		[TARGET].DepositsCountSport					= [SOURCE].DepositsCountSport,
		[TARGET].DepositsCountLive					= [SOURCE].DepositsCountLive,
		[TARGET].DepositsCountBingo					= [SOURCE].DepositsCountBingo,
		[TARGET].BonusBalanceSport					= [SOURCE].BonusBalanceSport,
		[TARGET].CountryID							= [SOURCE].CountryID,
		[TARGET].JurisdictionID						= [SOURCE].JurisdictionID,
		[TARGET].Locale								= [SOURCE].Locale,
		[TARGET].IsActivated						= [SOURCE].IsActivated,
		[TARGET].AffordabilityAttempts				= [SOURCE].AffordabilityAttempts,
		[TARGET].AffordabilityTreshold				= [SOURCE].AffordabilityTreshold,
		[TARGET].AffordabilityBalance				= [SOURCE].AffordabilityBalance,
		[TARGET].AffordabilityStatus				= [SOURCE].AffordabilityStatus,
		[TARGET].AffordabilityIncomeRangeChoice		= [SOURCE].AffordabilityIncomeRangeChoice,
		[TARGET].AffordabilityLastUpdate			= [SOURCE].AffordabilityLastUpdate,
		[TARGET].LastLoginPlatform					= [SOURCE].LastLoginPlatform,
		[TARGET].WinningsRestriction				= [SOURCE].WinningsRestriction,
		[TARGET].CurrentWinnings					= [SOURCE].CurrentWinnings,
		[TARGET].WinningsRestrictionFailedDate		= [SOURCE].WinningsRestrictionFailedDate,
		[TARGET].PendingWithdrawals					= [SOURCE].PendingWithdrawals,
		[TARGET].Occupation							= [SOURCE].Occupation,
		[TARGET].FTDAmount							= [SOURCE].FTDAmount,
		[TARGET].FTDSettlementCompanyID				= [SOURCE].FTDSettlementCompanyID,
		[TARGET].Age								= [SOURCE].Age,
		[TARGET].OccupationID						= [SOURCE].OccupationID,
		[TARGET].OccupationYearlyIncome				= [SOURCE].OccupationYearlyIncome
WHEN NOT MATCHED BY TARGET
THEN INSERT (PlayerID,
			CasinoName,
			CasinoID,
			Email,
			FirstName,
			LastName,		
			Alias,
			Currency,
			CurrencySymbol,
			AffiliateID,
			DynamicParameter,
			ClickID,
			PromotionCode,
			CountryCode,
			MobileNumber,
			Country,
			City,
			Address,
			ZipCode,
			Gender,
			DateOfBirth,
			[Language],
			IP,
			RegisteredDate,
			FirstDepositDate,
			LastLoginDate,
			LastDepositDate,
			VIPLevel,
			Ranking,
			RegisteredPlatform,
			PlatformString,
			WelcomeBonus,
			DocumentsStatus,
			SMSEnabled,
			PushEnabled,
			MailEnabled,
			IsOptIn,
			PromotionsEnabled,

			PromotionsMailEnabled,
			PromotionsSMSEnabled,
			PromotionsPushEnabled,
			PromotionsPhoneEnabled,
			PromotionsPostEnabled,
			PromotionsPartnerEnabled,

			BonusesEnabled,
			LoggedIn,
			IsTest,	
			[Status],
			IsBlocked,
			BlockDate,
			BlockReason,
			BlockReleaseDate,
			BlockType,
			BOAgent,
			AccountBalance,
			BonusBalance,
			Balance,
			OriginalBalance,
			MaxBalance,
			DepositsCount,
			TotalDeposits,
			TotalWithdrawals,
			TotalChargeBacks,
			TotalChargebackReverses,
			TotalVoids,
			TotalBonuses,
			TotalCustomerClubPoints,
			CustomerClubPoints,
			Wagered,
			LastUpdated,
			LastUpdate,
			RevenueEUR,
			WelcomeBonusSport,
			RegistrationPlayMode,
			TotalBetsCasino,
			TotalBetsSport,
			TotalBetsLive,
			TotalBetsBingo,
			DepositsCountCasino,
			DepositsCountSport,
			DepositsCountLive,
			DepositsCountBingo,
			BonusBalanceSport,
			CountryID,
			JurisdictionID,
			Locale,
			IsActivated,
			AffordabilityAttempts,
			AffordabilityTreshold,
			AffordabilityBalance,
			AffordabilityStatus,
			AffordabilityIncomeRangeChoice,
			AffordabilityLastUpdate,
			LastLoginPlatform,
			WinningsRestriction,
			CurrentWinnings,
			WinningsRestrictionFailedDate,
			PendingWithdrawals,
			Occupation,
			FTDAmount,
			FTDSettlementCompanyID,
			Age,
			OccupationID,
			OccupationYearlyIncome)
VALUES ([SOURCE].PlayerID, 
		[SOURCE].CasinoName,
		[SOURCE].CasinoID,
		[SOURCE].Email,
		[SOURCE].FirstName,
		[SOURCE].LastName,
		[SOURCE].Alias,
		[SOURCE].Currency,
		[SOURCE].CurrencySymbol,
		[SOURCE].AffiliateID,
		[SOURCE].DynamicParameter,
		[SOURCE].ClickID,
		[SOURCE].PromotionCode,
		[SOURCE].CountryCode,
		[SOURCE].MobileNumber,
		[SOURCE].Country,
		[SOURCE].City,
		[SOURCE].Address,
		[SOURCE].ZipCode,
		[SOURCE].Gender,
		[SOURCE].DateOfBirth,
		[SOURCE].[Language],
		[SOURCE].IP,
		[SOURCE].RegisteredDate,
		[SOURCE].FirstDepositDate,
		[SOURCE].LastLoginDate,
		[SOURCE].LastDepositDate,
		[SOURCE].VIPLevel,
		[SOURCE].Ranking,
		[SOURCE].RegisteredPlatform,
		[SOURCE].PlatformString,
		[SOURCE].WelcomeBonus,
		[SOURCE].DocumentsStatus,
		[SOURCE].SMSEnabled,
		[SOURCE].PushEnabled,
		[SOURCE].MailEnabled,
		[SOURCE].IsOptIn,
		[SOURCE].PromotionsEnabled,

		[SOURCE].PromotionsMailEnabled,
		[SOURCE].PromotionsSMSEnabled,
		[SOURCE].PromotionsPushEnabled,
		[SOURCE].PromotionsPhoneEnabled,
		[SOURCE].PromotionsPostEnabled,
		[SOURCE].PromotionsPartnerEnabled,

		[SOURCE].BonusesEnabled,
		[SOURCE].LoggedIn,
		[SOURCE].IsTest,
		[SOURCE].[Status],
		[SOURCE].IsBlocked,
		[SOURCE].BlockDate,
		[SOURCE].BlockReason,
		[SOURCE].BlockReleaseDate,
		[SOURCE].BlockType,
		[SOURCE].BOAgent,
		[SOURCE].AccountBalance,
		[SOURCE].BonusBalance,
		[SOURCE].Balance,
		[SOURCE].OriginalBalance,
		[SOURCE].MaxBalance,
		[SOURCE].DepositsCount,
		[SOURCE].TotalDeposits,
		[SOURCE].TotalWithdrawals,
		[SOURCE].TotalChargeBacks,
		[SOURCE].TotalChargebackReverses,
		[SOURCE].TotalVoids,
		[SOURCE].TotalBonuses,
		[SOURCE].TotalCustomerClubPoints,
		[SOURCE].CustomerClubPoints,
		[SOURCE].Wagered,
		[SOURCE].LastUpdated,
		[SOURCE].LastUpdate,
		[SOURCE].RevenueEUR,
		[SOURCE].WelcomeBonusSport,
		[SOURCE].RegistrationPlayMode,
		[SOURCE].TotalBetsCasino,
		[SOURCE].TotalBetsSport,
		[SOURCE].TotalBetsLive,
		[SOURCE].TotalBetsBingo,
		[SOURCE].DepositsCountCasino,
		[SOURCE].DepositsCountSport,
		[SOURCE].DepositsCountLive,
		[SOURCE].DepositsCountBingo,
		[SOURCE].BonusBalanceSport,
		[SOURCE].CountryID,
		[SOURCE].JurisdictionID,
		[SOURCE].Locale,
		[SOURCE].IsActivated,
		[SOURCE].AffordabilityAttempts,
		[SOURCE].AffordabilityTreshold,
		[SOURCE].AffordabilityBalance,
		[SOURCE].AffordabilityStatus,
		[SOURCE].AffordabilityIncomeRangeChoice,
		[SOURCE].AffordabilityLastUpdate,
		[SOURCE].LastLoginPlatform,
		[SOURCE].WinningsRestriction,
		[SOURCE].CurrentWinnings,
		[SOURCE].WinningsRestrictionFailedDate,
		[SOURCE].PendingWithdrawals,
		[SOURCE].Occupation,
		[SOURCE].FTDAmount,
		[SOURCE].FTDSettlementCompanyID,
		[SOURCE].Age,
		[SOURCE].OccupationID,
		[SOURCE].OccupationYearlyIncome);

SET @rows = @@ROWCOUNT

INSERT INTO [DailyActionsDB].common.tbl_Daily_log 
(ProcName, StartTime, EndTime, RowsStartTime, RowsEndTime, RowsAmount)
SELECT OBJECT_NAME(@@PROCID), @now, GETUTCDATE(), @players_from_date,@players_to_date, @rows

  END

GO
/****** Object:  StoredProcedure [dbo].[stp_DailyActions_Transactions]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[stp_DailyActions_Transactions]

AS
BEGIN

-- =============================================
-- Author:		Rotem.Madeira
-- Create date: 26/7/2016
-- Description:	Runs every hour to insert new transactions to the [common].[tbl_Daily_actions_transactions] table
-- =============================================

SET NOCOUNT ON;


DECLARE	@from_date	DATETIME2
DECLARE	@to_date	DATETIME2
DECLARE @rows		INT
DECLARE @now		DATETIME = GETUTCDATE()

SELECT @from_date = ISNULL(MAX(LastUpdated),CAST(GETUTCDATE() AS DATE)) FROM [DailyActionsDB].[common].[tbl_Daily_actions_transactions] (NOLOCK)
SELECT @to_date =	DATEADD(MINUTE,-1,GETUTCDATE())

-- For daily runs
--SELECT @from_date = ISNULL(MAX(LastUpdated),CAST(GETUTCDATE() AS DATE)) FROM [DailyActionsDB].[common].[tbl_Daily_actions_transactions] (NOLOCK)
--SET @to_date = DATEADD(MILLISECOND,-2,CAST(DATEADD(DAY,2,CAST(@from_date AS DATE)) AS DATETIME))

SELECT @from_date , @to_date

INSERT INTO [DailyActionsDB].[common].[tbl_Daily_actions_transactions]
(OriginalTransactionID, PlayerID, TransactionDate, TransactionType, TransactionAmount, 
TransactionOriginalAmount, TransactionDetails, TransactionSubDetails, [Platform], [Status], CurrencyCode, TransactionInfoID, TransactionComments, PaymentMethod, PaymentProvider, LastUpdated)
SELECT  trans.transaction_id												AS OriginalTransactionID,
		trans.player_id														AS PlayerID,
		trans.creation_dt													AS TransactionDate,
		luts.lut_name														AS TransactionType,
		ISNULL(trans.amount, 0) * currs.rate_in_EUR							AS TransactionAmount,
		ISNULL(trans.amount, 0)												AS TransactionOriginalAmount,
		ISNULL(settlecc.name, settle.name) 									AS TransactionDetails,
		tds.settlement_company_error_code									AS TransactionSubDetails,
		(CASE WHEN draw_id = 707 THEN 'Sport' ELSE 'Casino' END)			AS [Platform],
		(CASE WHEN trans.is_done = 1 THEN 'Approved' ELSE 'Rejected' END)	AS TransactionStatus,
		currs.currency_code													AS CurrencyCode,
		0																	AS TransactionInfoID,
		SUBSTRING(trans.comments,0,500)														AS TransactionComments,
		settle.name															AS PaymentMethod,
		settlecc.name														AS PaymentProvider,
		trans.updated_dt													AS LastUpdated
FROM		
[ProgressPlayDB].accounts.tbl_Account_transactions AS trans WITH (NOLOCK, INDEX = [IX_tbl_Account_transactions_updated_dt]) 

outer apply (select top 1 * from [ProgressPlayDB].accounts.tbl_Account_transaction_details WITH (NOLOCK) where transaction_id = trans.transaction_id and (is_3d_redirect_by_settlement_company = 1 or settlement_company_error_code = '3D REDIRECT Challenge') order by 1 desc) tds

INNER JOIN [ProgressPlayDB].common.tbl_Players AS players (NOLOCK) ON players.player_id = trans.player_id
INNER JOIN [ProgressPlayDB].common.tbl_Luts AS luts (NOLOCK)  ON luts.lut_id = trans.transaction_type_id
INNER JOIN [ProgressPlayDB].common.tbl_Currencies AS currs (NOLOCK) ON currs.currency_id = players.currency_id
lEFT JOIN [ProgressPlayDB].accounts.tbl_Account_payment_methods AS payment (NOLOCK) ON trans.account_payment_method_id = payment.account_payment_method_id
LEFT JOIN [ProgressPlayDB].accounts.tbl_Settlement_companies AS settle (NOLOCK) ON payment.settlement_company_id = settle.settlement_company_id
LEFT JOIN [ProgressPlayDB].accounts.tbl_Settlement_companies AS settlecc (NOLOCK) ON payment.credit_card_provider_settlement_company_id = settlecc.settlement_company_id

WHERE	trans.updated_dt > @from_date
AND		trans.updated_dt <= @to_date
AND transaction_type_id IN (263, 264, 266, 357, 442, 556,557,558,586,587,588,605,606)

UNION  ALL

SELECT  bonusTrans.bonus_transaction_id							AS OriginalTransactionID,
		bonusTrans.player_id									AS PlayerID,
		bonusTrans.creation_dt									AS TransactionDate,
		luts.lut_name											AS TransactionType,
		ISNULL(bonusTrans.amount, 0) * currs.rate_in_EUR		AS TransactionAmount,
		ISNULL(bonusTrans.amount, 0)							AS TransactionOriginalAmount,
		SUBSTRING(ISNULL(bonus.bonus_name, ISNULL(fgp.offer_name, balance.comments)),0,500)										AS TransactionDetails,
		''														AS TransactionSubDetails,
		(CASE WHEN draw_id = 707 THEN 'Sport' ELSE 'Casino' END)			AS [Platform],
		'Approved'												AS TransactionStatus,
		currs.currency_code										AS CurrencyCode,
		bonus.bonus_id											AS TransactionInfoID,
		''														AS TransactionComments,
		bonus.bonus_name										AS PaymentMethod,
		SUBSTRING(ISNULL(fgp.offer_name, balance.comments),0,500)				AS PaymentProvider,
		bonusTrans.updated_dt									AS LastUpdated
FROM		
[ProgressPlayDB].accounts.tbl_Account_bonus_transactions AS bonusTrans WITH (NOLOCK, INDEX = [IX_tbl_Account_bonus_transactions_updated_dt]) 
INNER JOIN [ProgressPlayDB].common.tbl_Players AS players (NOLOCK) ON players.player_id = bonusTrans.player_id
INNER JOIN [ProgressPlayDB].common.tbl_Luts AS luts (NOLOCK) ON luts.lut_id = bonusTrans.transaction_type_id
INNER JOIN [ProgressPlayDB].common.tbl_Currencies AS currs (NOLOCK) ON currs.currency_id = players.currency_id
lEFT JOIN [ProgressPlayDB].accounts.tbl_Player_bonus_balance AS balance (NOLOCK) ON bonusTrans.bonus_balance_id = balance.bonus_balance_id
LEFT JOIN [ProgressPlayDB].crm.tbl_Bonuses AS bonus (NOLOCK) ON balance.bonus_id = bonus.bonus_id
LEFT JOIN ProgressPlayDB.SideGames.tblFreeGamesPlayers fgp (NOLOCK) ON fgp.freegame_player_id = balance.freegame_player_id
LEFT JOIN ProgressPlayDB.SideGames.tblFreeGames fg (NOLOCK) ON fg.freegame_id = fgp.freegame_id
WHERE	bonusTrans.updated_dt > @from_date
AND bonusTrans.updated_dt <= @to_date
AND transaction_type_id IN (436, 437,444)


SET @rows = @@ROWCOUNT

INSERT INTO [DailyActionsDB].common.tbl_Daily_log 
(ProcName, StartTime, EndTime, RowsStartTime, RowsEndTime, RowsAmount)
SELECT OBJECT_NAME(@@PROCID), @now, GETUTCDATE(), @from_date,@to_date, @rows









--GBP

SELECT @from_date = ISNULL(MAX(LastUpdated),CAST(GETUTCDATE() AS DATE)) FROM [DailyActionsDB].[common].[tbl_Daily_actionsGBP_transactions] (NOLOCK)
SELECT @to_date =	DATEADD(MINUTE,-1,GETUTCDATE())

-- For daily runs
--SELECT @from_date = ISNULL(MAX(LastUpdated),CAST(GETUTCDATE() AS DATE)) FROM [DailyActionsDB].[common].[tbl_Daily_actions_transactions] (NOLOCK)
--SET @to_date = DATEADD(MILLISECOND,-2,CAST(DATEADD(DAY,2,CAST(@from_date AS DATE)) AS DATETIME))

SELECT @from_date , @to_date

INSERT INTO [DailyActionsDB].[common].[tbl_Daily_actionsGBP_transactions]
(OriginalTransactionID, PlayerID, TransactionDate, TransactionType, TransactionAmount, 
TransactionOriginalAmount, TransactionDetails, TransactionSubDetails, [Platform], [Status], CurrencyCode, TransactionInfoID, TransactionComments, PaymentMethod, PaymentProvider, LastUpdated)
SELECT  trans.transaction_id												AS OriginalTransactionID,
		trans.player_id														AS PlayerID,
		trans.creation_dt													AS TransactionDate,
		luts.lut_name														AS TransactionType,
		ISNULL(trans.amount, 0) * currs.rate_in_GBP							AS TransactionAmount,
		ISNULL(trans.amount, 0)												AS TransactionOriginalAmount,
		ISNULL(settlecc.name, settle.name) 									AS TransactionDetails,
		tds.settlement_company_error_code									AS TransactionSubDetails,
		(CASE WHEN draw_id = 707 THEN 'Sport' ELSE 'Casino' END)			AS [Platform],
		(CASE WHEN trans.is_done = 1 THEN 'Approved' ELSE 'Rejected' END)	AS TransactionStatus,
		currs.currency_code													AS CurrencyCode,
		0																	AS TransactionInfoID,
		SUBSTRING(trans.comments,0,500)														AS TransactionComments,
		settle.name															AS PaymentMethod,
		settlecc.name														AS PaymentProvider,
		trans.updated_dt													AS LastUpdated
FROM		
[ProgressPlayDB].accounts.tbl_Account_transactions AS trans WITH (NOLOCK, INDEX = [IX_tbl_Account_transactions_updated_dt]) 

outer apply (select top 1 * from [ProgressPlayDB].accounts.tbl_Account_transaction_details WITH (NOLOCK) where transaction_id = trans.transaction_id and (is_3d_redirect_by_settlement_company = 1 or settlement_company_error_code = '3D REDIRECT Challenge') order by 1 desc) tds

INNER JOIN [ProgressPlayDB].common.tbl_Players AS players (NOLOCK) ON players.player_id = trans.player_id
INNER JOIN [ProgressPlayDB].common.tbl_Luts AS luts (NOLOCK)  ON luts.lut_id = trans.transaction_type_id
INNER JOIN [ProgressPlayDB].common.tbl_Currencies AS currs (NOLOCK) ON currs.currency_id = players.currency_id
lEFT JOIN [ProgressPlayDB].accounts.tbl_Account_payment_methods AS payment (NOLOCK) ON trans.account_payment_method_id = payment.account_payment_method_id
LEFT JOIN [ProgressPlayDB].accounts.tbl_Settlement_companies AS settle (NOLOCK) ON payment.settlement_company_id = settle.settlement_company_id
LEFT JOIN [ProgressPlayDB].accounts.tbl_Settlement_companies AS settlecc (NOLOCK) ON payment.credit_card_provider_settlement_company_id = settlecc.settlement_company_id

WHERE	trans.updated_dt > @from_date
AND		trans.updated_dt <= @to_date
AND transaction_type_id IN (263, 264, 266, 357, 442, 556,557,558,586,587,588,605,606)

UNION  ALL

SELECT  bonusTrans.bonus_transaction_id							AS OriginalTransactionID,
		bonusTrans.player_id									AS PlayerID,
		bonusTrans.creation_dt									AS TransactionDate,
		luts.lut_name											AS TransactionType,
		ISNULL(bonusTrans.amount, 0) * currs.rate_in_GBP		AS TransactionAmount,
		ISNULL(bonusTrans.amount, 0)							AS TransactionOriginalAmount,
		SUBSTRING(ISNULL(bonus.bonus_name, ISNULL(fgp.offer_name, balance.comments)),0,500)										AS TransactionDetails,
		''														AS TransactionSubDetails,
		(CASE WHEN draw_id = 707 THEN 'Sport' ELSE 'Casino' END)			AS [Platform],
		'Approved'												AS TransactionStatus,
		currs.currency_code										AS CurrencyCode,
		bonus.bonus_id											AS TransactionInfoID,
		''														AS TransactionComments,
		bonus.bonus_name										AS PaymentMethod,
		SUBSTRING(ISNULL(fgp.offer_name, balance.comments),0,500)				AS PaymentProvider,
		bonusTrans.updated_dt									AS LastUpdated
FROM		
[ProgressPlayDB].accounts.tbl_Account_bonus_transactions AS bonusTrans WITH (NOLOCK, INDEX = [IX_tbl_Account_bonus_transactions_updated_dt]) 
INNER JOIN [ProgressPlayDB].common.tbl_Players AS players (NOLOCK) ON players.player_id = bonusTrans.player_id
INNER JOIN [ProgressPlayDB].common.tbl_Luts AS luts (NOLOCK) ON luts.lut_id = bonusTrans.transaction_type_id
INNER JOIN [ProgressPlayDB].common.tbl_Currencies AS currs (NOLOCK) ON currs.currency_id = players.currency_id
lEFT JOIN [ProgressPlayDB].accounts.tbl_Player_bonus_balance AS balance (NOLOCK) ON bonusTrans.bonus_balance_id = balance.bonus_balance_id
LEFT JOIN [ProgressPlayDB].crm.tbl_Bonuses AS bonus (NOLOCK) ON balance.bonus_id = bonus.bonus_id
LEFT JOIN ProgressPlayDB.SideGames.tblFreeGamesPlayers fgp (NOLOCK) ON fgp.freegame_player_id = balance.freegame_player_id
LEFT JOIN ProgressPlayDB.SideGames.tblFreeGames fg (NOLOCK) ON fg.freegame_id = fgp.freegame_id
WHERE	bonusTrans.updated_dt > @from_date
AND bonusTrans.updated_dt <= @to_date
AND transaction_type_id IN (436, 437,444)


SET @rows = @@ROWCOUNT

INSERT INTO [DailyActionsDB].common.tbl_Daily_log 
(ProcName, StartTime, EndTime, RowsStartTime, RowsEndTime, RowsAmount)
SELECT OBJECT_NAME(@@PROCID)+'_gbp', @now, GETUTCDATE(), @from_date,@to_date, @rows







MERGE [DailyActionsDB].common.[tbl_Withdrawal_requests] AS trg
USING (SELECT [request_id] AS RequestID
      ,wr.[player_id] AS PlayerID
      ,[request_date] AS RequestDate
      ,[payment_amount] AS Amount
	  ,sc.sys_name AS SCName
	  ,s.status_name AS Status
      ,l.lut_name AS HandlingType
      ,wr.[updated_dt] AS UpdatedDate
  FROM [ProgressPlayDB].[crm].[tbl_Withdrawal_requests] wr (NOLOCK)
  INNER JOIN [ProgressPlayDB].common.tbl_Statuses s (NOLOCK) ON s.status_id = wr.status_id 
  INNER JOIN [ProgressPlayDB].common.tbl_Luts l (NOLOCK) ON l.lut_id = wr.handling_type
  INNER JOIN [ProgressPlayDB].accounts.tbl_Account_payment_methods apm (NOLOCK) ON apm.account_payment_method_id = wr.account_payment_method_id 
  INNER JOIN [ProgressPlayDB].accounts.tbl_Settlement_companies sc (NOLOCK) ON sc.settlement_company_id = apm.settlement_company_id
  LEFT JOIN [ProgressPlayDB].accounts.tbl_Settlement_companies scp (NOLOCK) ON scp.settlement_company_id = apm.credit_card_provider_settlement_company_id
  LEFT OUTER JOIN [DailyActionsDB].common.[tbl_Withdrawal_requests] dawr ON dawr.RequestID = wr.[request_id]
  WHERE dawr.[UpdatedDate] IS NULL OR dawr.[UpdatedDate] != wr.[updated_dt]
  ) AS src
ON (trg.RequestID = src.RequestID)

WHEN MATCHED 
THEN UPDATE 
SET 
trg.[RequestID] = src.[RequestID],
trg.[PlayerID] = src.[PlayerID],
trg.RequestDate = src.RequestDate,
trg.Amount = src.Amount,
trg.SCName = src.SCName,
trg.Status = src.Status,
trg.HandlingType = src.HandlingType,
trg.[UpdatedDate] = src.[UpdatedDate]

WHEN NOT MATCHED BY TARGET
THEN INSERT (	[RequestID]
			  ,[PlayerID]
			  ,RequestDate
			  ,Amount
			  ,SCName
			  ,Status
			  ,HandlingType
			  ,[UpdatedDate])
VALUES (src.[RequestID]
      ,src.[PlayerID]
      ,src.RequestDate
      ,src.Amount
      ,src.SCName
      ,src.Status
      ,src.HandlingType
      ,src.[UpdatedDate]);


END
GO
/****** Object:  StoredProcedure [dbo].[stp_DailyActions_Triggers]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[stp_DailyActions_Triggers]

AS
BEGIN

SET NOCOUNT ON;



DECLARE	@from_date	DATETIME2
DECLARE	@to_date	DATETIME2
DECLARE @rows		INT
DECLARE @now		DATETIME = GETUTCDATE()

SELECT @from_date = ISNULL(MAX(TriggerDate),CAST(GETUTCDATE() AS DATE)) FROM [DailyActionsDB].[common].[tbl_Daily_actions_triggers] (NOLOCK)
SELECT @to_date =	DATEADD(MINUTE,-1,GETUTCDATE())

SELECT @from_date,@to_date

IF @from_date >= @to_date
	RETURN;

INSERT INTO [DailyActionsDB].[common].[tbl_Daily_actions_triggers]
	SELECT [trigger_player_id] AS TriggerPlayerID
		,[trigger_id]		AS TriggerID
		,lut_name			AS TriggerName
		,[player_id]		AS PlayerID
		,t.[updated_dt]		AS TriggerDate
	FROM [ProgressPlayDB].[crm].[tbl_Triggers_Players] t
	INNER JOIN [ProgressPlayDB].common.tbl_Luts l on l.lut_id = t.trigger_id
	WHERE t.updated_dt > @from_date
	AND t.updated_dt <= @to_date


SET @rows = @@ROWCOUNT

INSERT INTO [DailyActionsDB].common.tbl_Daily_log 
(ProcName, StartTime, EndTime, RowsStartTime, RowsEndTime, RowsAmount)
SELECT OBJECT_NAME(@@PROCID), @now, GETUTCDATE(), @from_date,@to_date, @rows

END
GO
/****** Object:  StoredProcedure [dbo].[stp_Update_Bonuses]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[stp_Update_Bonuses]
AS

MERGE [DailyActionsDB].[common].[tbl_Bonuses] trg
USING 
       (select b.*
			,statuses_status.status_name  as [Status]
			,l2.lut_name as [GivenUpon]
			,l3.lut_name as [ConditionTrigger]
			,l4.lut_name as [ConditionFilterPlayers]
			,fg.offer_name as [FreeGame]
			,lrpm.lut_name as RegistrationPlayMode
			,lepm.lut_name as EventPlayMode
			,bt.lut_name as BonusType
		from  [ProgressPlayDB].[crm].[tbl_Bonuses]  b --3766
		left outer join [DailyActionsDB].[common].[tbl_Bonuses] tb on tb.BonusID = b.bonus_id 
		join [ProgressPlayDB].[common].tbl_Statuses as statuses_status on statuses_status.status_id = b.status_id
		left outer join [ProgressPlayDB].[SideGames].[tblFreeGames] as fg on fg.freegame_id = b.freegame_id       
		left outer join [ProgressPlayDB].[common].[tbl_Luts] l2 on b.event_id = l2.lut_id
		left outer join [ProgressPlayDB].[common].[tbl_Luts] l3 on b.condition_trigger_event_id = l3.lut_id
		left outer join [ProgressPlayDB].[common].[tbl_Luts] l4 on b.condition_filter_players_mode = l4.lut_id
		left outer join [ProgressPlayDB].[common].[tbl_Luts] lrpm on b.condition_registration_play_mode = lrpm.lut_id
		left outer join [ProgressPlayDB].[common].[tbl_Luts] lepm on b.condition_event_play_mode = lepm.lut_id
		left outer join [ProgressPlayDB].[common].[tbl_Luts] bt on b.bonus_type = bt.lut_id

		where  tb.UpdatedDate is null 
		or      b.updated_dt != tb.UpdatedDate
       ) src
ON trg.BonusID = src.bonus_id 

WHEN MATCHED THEN
  UPDATE SET
       trg.BonusName = src.bonus_name,
    trg.InternalName = src.internal_name,
    trg.[Description] = src.[description],
    trg.[Percentage] = src.[percentage],
    trg.[PercentageUpToAmount] = src.[percentage_up_to_amount],
    trg.[Divisions] = src.[divisions],
    trg.[BonusAmount] = src.[bonus_amount],
       trg.[Status] = src.[Status],
       trg.[CouponCode] = src.[coupon_code],
       trg.[GivenUpon] = src.[GivenUpon],
       trg.[StartDate] = src.[start_date],
       trg.[StartTime] = src.[start_time],
       trg.[EndDate] = src.[end_date],
       trg.[EndTime] = src.[end_time],
       trg.[ConditionFilterPlayers] = src.[ConditionFilterPlayers],
       trg.[ConditionTrigger] = src.[ConditionTrigger],
       trg.[WagerFactor] = src.[wager_factor],
       trg.[MinDeposit] = src.[min_deposit],
	   trg.[DepositNumber] = src.[draws_count],
       trg.[FreeGame] = src.[FreeGame],
       trg.[ConditionRanking] = src.[condition_ranking],
       trg.[MaxBonusMoney] = src.[max_bonus_money],
       trg.[UpdatedDate] = src.[updated_dt],
	   trg.ConditionRegistrationPlayMode = src.RegistrationPlayMode,
	   trg.ConditionEventPlatMode = src.EventPlayMode,
	   trg.ConditionPlayedCasino = src.condition_played_casino,
	   trg.ConditionPlayedSport = src.condition_played_sport,
	   trg.ConditionDepositsCountCasino = src.condition_deposits_count_casino,
	   trg.ConditionDepositsCountSport = src.condition_deposits_count_sport,
	   trg.BonusType = src.BonusType,
       trg.IsSportBonus = src.is_sport_bonus

WHEN NOT MATCHED BY TARGET THEN 
  INSERT([BonusID]
      ,[BonusName]
      ,[InternalName]
      ,[Description]
      ,[Percentage]
      ,[PercentageUpToAmount]
      ,[Divisions]
      ,[BonusAmount]
      ,[Status]
      ,[CouponCode]
      ,[GivenUpon]
      ,[StartDate]
      ,[StartTime]
      ,[EndDate]
      ,[EndTime]
      ,[ConditionFilterPlayers]
      ,[ConditionTrigger]
      ,[WagerFactor]
      ,[MinDeposit]
	  ,[DepositNumber]
      ,[FreeGame]
      ,[ConditionRanking]
      ,[MaxBonusMoney]
      ,[UpdatedDate]
	  ,ConditionRegistrationPlayMode
	  ,ConditionEventPlatMode
	  ,ConditionPlayedCasino
	  ,ConditionPlayedSport
	  ,ConditionDepositsCountCasino
	  ,ConditionDepositsCountSport
	  ,BonusType
	  ,IsSportBonus
      )
  VALUES(src.bonus_id,
       src.bonus_name,
       src.internal_name,
       src.[description],
       src.[percentage],
       src.[percentage_up_to_amount],
       src.[divisions],
       src.[bonus_amount],
       src.[Status],
       src.[coupon_code],
       src.[GivenUpon],
       src.[start_date],
       src.[start_time],
       src.[end_date],
       src.[end_time],
       src.[ConditionFilterPlayers],
       src.[ConditionTrigger],
       src.[wager_factor],
       src.[min_deposit],
	   src.[draws_count],
       src.[FreeGame],
       src.[condition_ranking],
       src.[max_bonus_money],
       src.[updated_dt],
	   src.RegistrationPlayMode,
	   src.EventPlayMode,
	   src.condition_played_casino,
	   src.condition_played_sport,
	   src.condition_deposits_count_casino,
	   src.condition_deposits_count_sport,
	   src.BonusType,
	   src.is_sport_bonus     
  );






MERGE [DailyActionsDB].common.tbl_Bonus_balances AS trg
USING (	SELECT	bonus_balance_id AS [BonusBalanceID],
				pbb.[player_id] AS [PlayerID],
				pbb.[currency_id] AS [CurrencyID],
				pbb.[bonus_id] AS [BonusID],
				pbb.[amount] AS [Amount],
				pbb.[balance] AS [Balance],
				s.status_name AS [Status],
				pbb.[WagerLeft] AS [WagerLeft],
				pbb.[OriginalDepositAmount] AS [OriginalDepositAmount],
				pbb.[MaxCashableWinnings] AS [MaxCashableWinnings],
				[AmountReleased] AS [AmountConverted],
				b.[is_sport_bonus] AS [IsSportBonus],
				fg.offer_name AS [FreeSpinsOffer],
				fgp.amount AS [FreeSpinsAmount],
				fgp.balance AS [FreeSpinsLeft],
				pbb.comments AS Comments,
				CASE WHEN pbb.comments LIKE 'Deposit %' THEN REPLACE(pbb.comments, 'Deposit ', '') ELSE NULL END AS [DepositCode],
				pbb.[updated_dt] AS [UpdatedDate],
				pbb.[creation_dt] AS [CreationDate],
				pbb.[loss_condition_date] AS [LossConditionDate]
		FROM [ProgressPlayDB].[accounts].[tbl_Player_bonus_balance] pbb (NOLOCK)
		LEFT JOIN DailyActionsDB.common.tbl_Bonus_balances dbb (NOLOCK) ON dbb.BonusBalanceID = pbb.bonus_balance_id
		LEFT JOIN [ProgressPlayDB].crm.tbl_Bonuses b (NOLOCK) ON b.bonus_id = pbb.bonus_id
		LEFT JOIN [ProgressPlayDB].SideGames.tblFreeGamesPlayers fgp (NOLOCK) ON fgp.freegame_player_id = pbb.freegame_player_id
		LEFT JOIN [ProgressPlayDB].SideGames.tblFreeGames fg (NOLOCK) ON fg.freegame_id = fgp.freegame_id
		INNER JOIN ProgressPlayDB.common.tbl_Statuses s (NOLOCK) ON s.status_id = pbb.status_id
		WHERE dbb.UpdatedDate IS NULL
		OR dbb.UpdatedDate != pbb.[updated_dt] ) 
AS src ON (trg.[BonusBalanceID] = src.[BonusBalanceID])
WHEN MATCHED 
THEN UPDATE 
SET trg.[BonusBalanceID] = src.[BonusBalanceID] ,
	trg.[PlayerID] = src.[PlayerID],
	trg.[CurrencyID]  = src.[CurrencyID],
	trg.[BonusID]  = src.[BonusID],
	trg.[Amount]  = src.[Amount],
	trg.[Balance]  = src.[Balance],
	trg.[Status]  = src.[Status],
	trg.[WagerLeft]  = src.[WagerLeft],
	trg.[OriginalDepositAmount]  = src.[OriginalDepositAmount],
	trg.[MaxCashableWinnings]  = src.[MaxCashableWinnings],
	trg.[AmountConverted]  = src.[AmountConverted],
	trg.[IsSportBonus]  = src.[IsSportBonus],
	trg.[FreeSpinsOffer]  = src.[FreeSpinsOffer],
	trg.[FreeSpinsAmount]  = src.[FreeSpinsAmount],
	trg.[FreeSpinsLeft]  = src.[FreeSpinsLeft],
	trg.Comments  = src.Comments,
	trg.[DepositCode]  = src.[DepositCode],
	trg.[UpdatedDate]  = src.[UpdatedDate],
	trg.[CreationDate]  = src.[CreationDate],
	trg.[LossConditionDate]  = src.[LossConditionDate]
WHEN NOT MATCHED BY TARGET
THEN INSERT (	[BonusBalanceID],
				[PlayerID],
				[CurrencyID],
				[BonusID],
				[Amount],
				[Balance],
				[Status],
				[WagerLeft],
				[OriginalDepositAmount],
				[MaxCashableWinnings],
				[AmountConverted],
				[IsSportBonus],
				[FreeSpinsOffer],
				[FreeSpinsAmount],
				[FreeSpinsLeft],
				Comments,
				[DepositCode],
				UpdatedDate,
				[CreationDate],
				[LossConditionDate])
VALUES (		src.[BonusBalanceID],
				src.[PlayerID],
				src.[CurrencyID],
				src.[BonusID],
				src.[Amount],
				src.[Balance],
				src.[Status],
				src.[WagerLeft],
				src.[OriginalDepositAmount],
				src.[MaxCashableWinnings],
				src.[AmountConverted],
				src.[IsSportBonus],
				src.[FreeSpinsOffer],
				src.[FreeSpinsAmount],
				src.[FreeSpinsLeft],
				src.Comments,
				src.[DepositCode],
				src.UpdatedDate,
				src.[CreationDate],
				src.[LossConditionDate]);




  
MERGE [DailyActionsDB].dbo.GamesFreeSpinsOffers trg
USING 
       (	SELECT	freegame_id AS OfferID,
					offer_name AS OfferCode,
					multiplier AS SpinsNumber,
					game_id AS GameID,
					is_active AS IsActive,
					description AS OfferDescription,
					updated_dt AS UpdatedDate
			FROM  [ProgressPlayDB].[SideGames].[tblFreeGames] fg (NOLOCK)
			LEFT JOIN DailyActionsDB.dbo.GamesFreeSpinsOffers gfs (NOLOCK) ON fg.freegame_id = gfs.OfferID

			
		where  gfs.UpdatedDate is null 
		or      fg.updated_dt != gfs.UpdatedDate
       ) src
ON trg.OfferID = src.OfferID

WHEN MATCHED THEN
  UPDATE SET
		trg.OfferID = src.OfferID,
		trg.OfferCode = src.OfferCode,
		trg.SpinsNumber = src.SpinsNumber,
		trg.GameID = src.GameID,
		trg.IsActive = src.IsActive,
		trg.OfferDescription = src.OfferDescription,
		trg.UpdatedDate = src.UpdatedDate
      

WHEN NOT MATCHED BY TARGET THEN 
  INSERT(	OfferID
           ,OfferCode
           ,SpinsNumber
           ,GameID
           ,IsActive
           ,OfferDescription
		   ,UpdatedDate)
  VALUES(	src.OfferID,
			src.OfferCode,
			src.SpinsNumber,
			src.GameID,
			src.IsActive,
			src.OfferDescription,
			src.UpdatedDate     
		);
GO
/****** Object:  StoredProcedure [dbo].[stp_Update_Games]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[stp_Update_Games]
AS

  /* LABELS */

	  
MERGE [DailyActionsDB].[common].[tbl_White_labels] trg
USING 
       (	SELECT	label_id AS [LabelID],
					label_name AS [LabelName],
					label_url_name AS [LabelUrlName],
					label_url AS [LabelUrl],
					url_play AS [UrlPlay],
					system_name AS [UrlPlayShort],
					default_language AS [DefaultLanguage],
					default_country AS [DefaultCountry],
					default_currency AS  [DefaultCurrency],
					welcome_bonus_desc AS [WelcomeBonusDesc],
					restricted_countries AS [RestrictedCountries],
					founded_year AS [FoundedYear],
					sport_enabled AS [SportEnabled],
					wl.updated_dt AS [UpdatedDate],
					pm.lut_name AS DefaultPlayMode,
					wl.is_active AS IsActive,
					label_title AS LabelTitle,
					ga_code_web AS GACode,
					integration_id AS IntileryCode,
					label_support_mail_display_name AS EmailDisplayName,
					url_facebook AS LabelNameShort,
					excluded_jurisdictions AS ExcludedJurisdictions,
					is_new_site AS IsNewSite
			FROM  [ProgressPlayDB].[common].[tbl_White_labels] wl (NOLOCK)
			left outer join [DailyActionsDB].[common].[tbl_White_labels] dawl (NOLOCK) on dawl.LabelID = wl.label_id
			left outer join ProgressPlayDB.common.tbl_Luts pm (NOLOCK) ON pm.lut_id = wl.default_playmode
			WHERE dawl.UpdatedDate IS NULL OR wl.updated_dt != dawl.UpdatedDate
       ) src		
ON trg.LabelID = src.LabelID

WHEN MATCHED THEN
  UPDATE SET
		trg.LabelName = src.LabelName,
		trg.LabelUrlName = src.LabelUrlName,
		trg.LabelUrl = src.LabelUrl,
		trg.UrlPlay = src.UrlPlay,
		trg.UrlPlayShort = src.UrlPlayShort,
		trg.DefaultLanguage = src.DefaultLanguage,
		trg.DefaultCountry = src.DefaultCountry,
		trg.DefaultCurrency = src.DefaultCurrency,
		trg.WelcomeBonusDesc = src.WelcomeBonusDesc,
		trg.RestrictedCountries = src.RestrictedCountries,
		trg.FoundedYear = src.FoundedYear,
		trg.SportEnabled = src.SportEnabled,
		trg.UpdatedDate = src.UpdatedDate,
		trg.DefaultPlayMode = src.DefaultPlayMode,
		trg.IsActive = src.IsActive,
		trg.LabelTitle = src.LabelTitle,
		trg.GACode = src.GACode,
		trg.IntileryCode = src.IntileryCode,
		trg.EmailDisplayName = src.EmailDisplayName,
		trg.LabelNameShort = src.LabelNameShort,
		trg.ExcludedJurisdictions = src.ExcludedJurisdictions,
		trg.IsNewSite = src.IsNewSite

WHEN NOT MATCHED BY TARGET THEN 
  INSERT(	[LabelID]
           ,[LabelName]
           ,[LabelUrlName]
           ,[LabelUrl]
           ,[UrlPlay]
           ,[UrlPlayShort]
           ,[DefaultLanguage]
           ,[DefaultCountry]
           ,[DefaultCurrency]
           ,[WelcomeBonusDesc]
           ,[RestrictedCountries]
           ,[FoundedYear]
           ,[SportEnabled]
           ,[UpdatedDate]
		   ,DefaultPlayMode
		   ,IsActive
		   ,LabelTitle
		   ,GACode
		   ,IntileryCode
		   ,EmailDisplayName
		   ,LabelNameShort
		   ,ExcludedJurisdictions
		   ,IsNewSite)
  VALUES(	src.[LabelID],
			src.[LabelName],
			src.[LabelUrlName],
			src.[LabelUrl],
			src.[UrlPlay],
			src.[UrlPlayShort],
			src.[DefaultLanguage],
			src.[DefaultCountry],
			src.[DefaultCurrency],
			src.[WelcomeBonusDesc],
			src.[RestrictedCountries],
			src.[FoundedYear],
			src.[SportEnabled],
			src.[UpdatedDate],
			src.DefaultPlayMode,
			src.IsActive,
			src.LabelTitle,
			src.GACode,
			src.IntileryCode,
			src.EmailDisplayName,
			src.LabelNameShort,
			src.ExcludedJurisdictions,
			src.IsNewSite
  );


  /* Countries */

  MERGE [DailyActionsDB].[common].[tbl_Countries] trg
USING 
       (	SELECT	country_id AS [CountryID],
					country_name AS [CountryName],
					c.is_active AS [IsActive],
					country_intl_code AS [CountryIntlCode],
					phone_code AS [PhoneCode],
					iso_code AS [IsoCode],
					lj.lut_name AS [JurisdictionCode],
					default_language_id AS [DefaultLanguage],
					default_currency_id AS [DefaultCurrency],
					c.updated_dt AS UpdatedDate,
					c.jurisdiction_id AS JurisdictionID,
						(SELECT  STUFF((
						 SELECT ',' + Locale
							FROM ProgressPlayDB.common.tbl_Locales l (NOLOCK)
							INNER JOIN ProgressPlayDB.common.tbl_LocalesByLocalesGroups llg (NOLOCK) ON llg.LocaleID = l.ID
							WHERE llg.GroupID = C.locales_group_id
							FOR XML PATH('')
						 ), 1, 1, '')) as Locales
			FROM  [ProgressPlayDB].[common].[tbl_Countries] c (NOLOCK)
			inner join ProgressPlayDB.common.tbl_Luts lj (NOLOCK) ON lj.lut_id = c.jurisdiction_id
			left outer join [DailyActionsDB].[common].[tbl_Countries] dac on dac.CountryID = c.country_id
			WHERE dac.UpdatedDate IS NULL OR c.updated_dt != dac.UpdatedDate
       ) src
ON trg.CountryID = src.CountryID

WHEN MATCHED THEN
  UPDATE SET
		trg.[CountryName] = src.[CountryName],
		trg.[IsActive] = src.[IsActive],
		trg.[CountryIntlCode] = src.[CountryIntlCode],
		trg.[PhoneCode] = src.[PhoneCode],
		trg.[IsoCode] = src.[IsoCode],
		trg.[JurisdictionCode] = src.[JurisdictionCode],
		trg.[DefaultLanguage] = src.[DefaultLanguage],
		trg.[DefaultCurrency] = src.[DefaultCurrency],
		trg.UpdatedDate = src.UpdatedDate,
		trg.JurisdictionID = src.JurisdictionID,
		trg.Locales = src.Locales
     
WHEN NOT MATCHED BY TARGET THEN 
  INSERT(	[CountryID]
           ,[CountryName]
           ,[IsActive]
           ,[CountryIntlCode]
           ,[PhoneCode]
           ,[IsoCode]
           ,[JurisdictionCode]
           ,[DefaultLanguage]
           ,[DefaultCurrency]
           ,UpdatedDate
		   ,JurisdictionID
		   ,Locales)
  VALUES(	src.[CountryID],
			src.[CountryName],
			src.[IsActive],
			src.[CountryIntlCode],
			src.[PhoneCode],
			src.[IsoCode],
			src.[JurisdictionCode],
			src.[DefaultLanguage],
			src.[DefaultCurrency],
			src.[UpdatedDate],
			src.JurisdictionID,
			src.Locales
		);




/* CURRENCIES */


MERGE [DailyActionsDB].[common].[tbl_Currencies] trg
USING 
       (	SELECT	currency_id AS [CurrencyID],
					currency_name AS [CurrencyName],
					currency_symbol AS [CurrencySymbol],
					currency_code AS [CurrencyCode],
					rate_in_eur AS [RateInEUR],
					rate_in_usd AS [RateInUSD],
					rate_in_gbp AS [RateInGBP],
					order_by AS [OrderBy],
					c.multiplier AS [Multiplier],
					for_language_id AS [ForLanguagesID],
					for_languages AS [ForLanguages],
					c.updated_dt AS UpdatedDate
			FROM  [ProgressPlayDB].[common].[tbl_Currencies] c (NOLOCK)
			left outer join [DailyActionsDB].[common].[tbl_Currencies] dac (NOLOCK) on dac.CurrencyID = c.currency_id
			WHERE dac.UpdatedDate IS NULL OR c.updated_dt != dac.UpdatedDate
       ) src
ON trg.CurrencyID = src.CurrencyID

WHEN MATCHED THEN
  UPDATE SET
		trg.[CurrencyName] = src.[CurrencyName],
		trg.[CurrencySymbol] = src.[CurrencySymbol],
		trg.[CurrencyCode] = src.[CurrencyCode],
		trg.[RateInEUR] = src.[RateInEUR],
		trg.[RateInUSD] = src.[RateInUSD],
		trg.[RateInGBP] = src.[RateInGBP],
		trg.[OrderBy] = src.[OrderBy],
		trg.[Multiplier] = src.[Multiplier],
		trg.[ForLanguagesID] = src.[ForLanguagesID],
		trg.[ForLanguages] = src.[ForLanguages],
		trg.UpdatedDate = src.UpdatedDate
     

WHEN NOT MATCHED BY TARGET THEN 
  INSERT(	[CurrencyID]
           ,[CurrencyName]
           ,[CurrencySymbol]
           ,[CurrencyCode]
           ,[RateInEUR]
           ,[RateInUSD]
           ,[RateInGBP]
           ,[OrderBy]
           ,[Multiplier]
		   ,[ForLanguagesID]
		   ,[ForLanguages]
           ,UpdatedDate)
  VALUES(	src.[CurrencyID],
			src.[CurrencyName],
			src.[CurrencySymbol],
			src.[CurrencyCode],
			src.[RateInEUR],
			src.[RateInUSD],
			src.[RateInGBP],
			src.[OrderBy],
			src.[Multiplier],
			src.[ForLanguagesID],
			src.[ForLanguages],
			src.[UpdatedDate]      
		);


MERGE [DailyActionsDB].dbo.[Games] AS trg
USING (	SELECT	 g.[GameID]
				,g.[GameName]	
				,gp.Name AS Provider
				,gsp.Name AS SubProvider
				,gt.Name AS GameType
				,STUFF((SELECT ',' + Name 
					FROM [ProgressPlayDB].[Games].[Games_GameFilter] gf (NOLOCK)
					INNER JOIN [ProgressPlayDB].Games.Games_GamesFilters gff (NOLOCK) ON gff.ID = gf.GameFilterID
					WHERE GameID = g.GameID
					FOR XML PATH('')) ,1,1,'') AS GameFilters
				,g.[GameOrder]
				,g.[IsActive]
				,g.[DemoEnabled]
				,g.[WagerPercent]
				,g.[JackpotContribution]
				,g.[PayoutLow]
				,g.[PayoutHigh]
				,gv.VolatilityValue AS Volatility
				,g.[UKCompliant]
				,g.[IsDesktop]
				,g.[ServerGameID]
				,g.[ProviderTitle]
				,g.[IsMobile]
				,g.[MobileServerGameID]
				,g.[MobileProviderTitle]
				,g.[CreatedDate]
				,g.[ReleaseDate]
				,g.[UpdatedDate]	
				,STUFF((SELECT ',' + c.country_intl_code
					FROM [ProgressPlayDB].[Games].Games_ExcludedByCountry gec (NOLOCK)
					INNER JOIN ProgressPlayDB.common.tbl_Countries c (NOLOCK) ON c.country_id = gec.CountryID
					WHERE GameID = g.GameID
					FOR XML PATH('')) ,1,1,'') AS ExcludedCountries		
				,STUFF((SELECT ',' + l.lut_name
					FROM [ProgressPlayDB].[Games].Games_ExcludedByJurisdiction gej (NOLOCK)
					INNER JOIN ProgressPlayDB.common.tbl_Luts l (NOLOCK) ON l.lut_id = gej.JurisdictionID
					WHERE GameID = g.GameID
					FOR XML PATH('')) ,1,1,'') AS ExcludedJurisdictions
				,g.HideInLobby						
		FROM [ProgressPlayDB].[Games].[Games] g (NOLOCK)
		left outer join [DailyActionsDB].dbo.Games dg on dg.GameID = g.GameID
		INNER JOIN [ProgressPlayDB].Games.Games_Providers gp (NOLOCK) ON gp.ID = g.ProviderID
		LEFT JOIN [ProgressPlayDB].Games.Games_SubProviders gsp (NOLOCK) ON gsp.Id = g.SubProviderID
		INNER JOIN [ProgressPlayDB].Games.Games_GameTypes gt (NOLOCK) ON gt.ID = g.GameTypeID
		INNER JOIN [ProgressPlayDB].Games.Games_Volatilities gv (NOLOCK) ON gv.VolatilityID = g.VolatilityID 
		WHERE (dg.UpdatedDate IS NULL OR g.[UpdatedDate] != dg.UpdatedDate)

	) AS src
ON (trg.GameID = src.GameID)
WHEN MATCHED 
THEN UPDATE 
SET trg.GameName = src.GameName,
	trg.Provider = src.Provider,
	trg.SubProvider  = src.SubProvider,
	trg.GameType  = src.GameType,
	trg.GameFilters  = src.GameFilters,
	trg.[GameOrder]  = src.[GameOrder],
	trg.[IsActive]  = src.[IsActive],
	trg.[DemoEnabled]  = src.[DemoEnabled],
	trg.[WagerPercent]  = src.[WagerPercent],
	trg.[JackpotContribution]  = src.[JackpotContribution],
	trg.[PayoutLow]  = src.[PayoutLow],
	trg.[PayoutHigh]  = src.[PayoutHigh],
	trg.Volatility  = src.Volatility,
	trg.[UKCompliant]  = src.[UKCompliant],
	trg.[IsDesktop]  = src.[IsDesktop],
	trg.[ServerGameID]  = src.[ServerGameID],
	trg.[ProviderTitle]  = src.[ProviderTitle],
	trg.[IsMobile]  = src.[IsMobile],
	trg.[MobileServerGameID]  = src.[MobileServerGameID],
	trg.[MobileProviderTitle]  = src.[MobileProviderTitle],
	trg.[CreatedDate]  = src.[CreatedDate],
	trg.[ReleaseDate]  = src.[ReleaseDate],
	trg.[UpdatedDate]  = src.[UpdatedDate],
	trg.ExcludedCountries = src.ExcludedCountries,
	trg.ExcludedJurisdictions = src.ExcludedJurisdictions,
	trg.HideInLobby = src.HideInLobby
WHEN NOT MATCHED BY TARGET
THEN INSERT ([GameID]
           ,[GameName]
           ,[Provider]
           ,[SubProvider]
           ,[GameType]
           ,[GameFilters]
           ,[GameOrder]
           ,[IsActive]
           ,[DemoEnabled]
           ,[WagerPercent]
           ,[JackpotContribution]
           ,[PayoutLow]
           ,[PayoutHigh]
           ,[Volatility]
           ,[UKCompliant]
           ,[IsDesktop]
           ,[ServerGameID]
           ,[ProviderTitle]
           ,[IsMobile]
           ,[MobileServerGameID]
           ,[MobileProviderTitle]
           ,[CreatedDate]
           ,[ReleaseDate]
           ,[UpdatedDate]
		   ,ExcludedCountries
		   ,ExcludedJurisdictions
		   ,HideInLobby)
VALUES (src.GameID, src.GameName, src.[Provider], src.[SubProvider]  ,src.[GameType]
           ,src.[GameFilters]
           ,src.[GameOrder]
           ,src.[IsActive]
           ,src.[DemoEnabled]
           ,src.[WagerPercent]
           ,src.[JackpotContribution]
           ,src.[PayoutLow]
           ,src.[PayoutHigh]
           ,src.[Volatility]
           ,src.[UKCompliant]
           ,src.[IsDesktop]
           ,src.[ServerGameID]
           ,src.[ProviderTitle]
           ,src.[IsMobile]
           ,src.[MobileServerGameID]
           ,src.[MobileProviderTitle]
           ,src.[CreatedDate]
           ,src.[ReleaseDate]
           ,src.[UpdatedDate]
		   ,src.ExcludedCountries
		   ,src.ExcludedJurisdictions
		   ,src.HideInLobby)
;



MERGE [DailyActionsDB].dbo.[GamesDescriptions] AS trg
USING (	SELECT	gd.GameID,
				gd.LanguageID,
				gd.Description,
				gd.CreatedDate,
				gd.UpdatedDate
  FROM [ProgressPlayDB].Games.Games_GameDescription as gd (NOLOCK)
  left outer join [DailyActionsDB].dbo.GamesDescriptions dgd (NOLOCK) on dgd.GameID = gd.GameID and dgd.LanguageID = gd.LanguageID
  WHERE dgd.UpdatedDate IS NULL OR gd.UpdatedDate != dgd.UpdatedDate) AS src
ON (trg.GameID = src.GameID AND trg.LanguageID = src.LanguageID)

WHEN MATCHED 
THEN UPDATE 
SET trg.GameID = src.GameID ,
	trg.LanguageID = src.LanguageID,
	trg.Description  = src.Description,
	trg.CreatedDate  = src.CreatedDate,
	trg.UpdatedDate  = src.UpdatedDate

WHEN NOT MATCHED BY TARGET
THEN INSERT (	GameID,
				LanguageID,
				Description,
				CreatedDate,
				UpdatedDate)
VALUES (src.GameID, src.LanguageID, src.Description, src.CreatedDate, src.UpdatedDate);


MERGE [DailyActionsDB].dbo.[GamesExcludedByCountry] AS trg
USING (	SELECT	ec.GameID,
				ec.CountryID,
				UpdatedDate = MAX(ec.UpdatedDate)
  FROM [ProgressPlayDB].Games.Games_ExcludedByCountry ec (NOLOCK)
  LEFT JOIN DailyActionsDB.dbo.GamesExcludedByCountry decc (NOLOCK) ON decc.GameID = ec.GameID AND decc.CountryID = ec.CountryID
  WHERE decc.UpdatedDate IS NULL OR ec.UpdatedDate != decc.UpdatedDate
  GROUP BY	ec.GameID,
				ec.CountryID
  ) AS src
ON (trg.GameID = src.GameID AND trg.CountryID = src.CountryID)

WHEN MATCHED 
THEN UPDATE 
SET trg.GameID = src.GameID ,
	trg.CountryID = src.CountryID,
	trg.UpdatedDate  = src.UpdatedDate

WHEN NOT MATCHED BY TARGET
THEN INSERT (	GameID,
				CountryID,
				UpdatedDate)
VALUES (src.GameID, src.CountryID, src.UpdatedDate);

MERGE [DailyActionsDB].dbo.[GamesExcludedByLabel] AS trg
USING (	SELECT	el.GameID,
				el.LabelID,
				el.UpdatedDate
  FROM [ProgressPlayDB].Games.Games_ExcludedByLabel el (NOLOCK)
  INNER JOIN DailyActionsDB.dbo.GamesExcludedByLabel del (NOLOCK) ON el.GameID = del.GameID AND el.LabelID = del.LabelID
  WHERE del.UpdatedDate IS NULL OR el.UpdatedDate != del.UpdatedDate) AS src
ON (trg.GameID = src.GameID AND trg.LabelID = src.LabelID)

WHEN MATCHED 
THEN UPDATE 
SET trg.GameID = src.GameID ,
	trg.LabelID = src.LabelID,
	trg.UpdatedDate  = src.UpdatedDate

WHEN NOT MATCHED BY TARGET
THEN INSERT (	GameID,
				LabelID,
				UpdatedDate)
VALUES (src.GameID, src.LabelID, src.UpdatedDate);






MERGE [DailyActionsDB].common.[tbl_Leaderboards] AS trg
USING (	SELECT	lb.[leaderboard_id]
      ,lb.[bonus_id]
      ,lb.[player_id]
      ,lb.[creation_dt]
      ,lb.[updated_dt]
      ,lb.[result_total]
      ,lb.[result_rank]
      ,lb.[bets]
      ,lb.[wins]
      ,lb.[bets_count]
      ,lb.[status_id]
      ,lb.[deposits]
  FROM [ProgressPlayDB].crm.tbl_Leaderboards lb (NOLOCK)
  left outer JOIN DailyActionsDB.common.[tbl_Leaderboards] dlb (NOLOCK) ON dlb.[leaderboard_id] = lb.[leaderboard_id]
  WHERE dlb.[updated_dt] IS NULL OR dlb.[updated_dt] != lb.[updated_dt]
  ) AS src
ON (trg.[leaderboard_id] = src.[leaderboard_id])

WHEN MATCHED 
THEN UPDATE 
SET 
trg.[leaderboard_id] = src.[leaderboard_id],
trg.[bonus_id] = src.[bonus_id],
trg.[player_id] = src.[player_id],
trg.[creation_dt] = src.[creation_dt],
trg.[updated_dt] = src.[updated_dt],
trg.[result_total] = src.[result_total],
trg.[result_rank] = src.[result_rank],
trg.[bets] = src.[bets],
trg.[wins] = src.[wins],
trg.[bets_count] = src.[bets_count],
trg.[status_id] = src.[status_id],
trg.[deposits] = src.[deposits]

WHEN NOT MATCHED BY TARGET
THEN INSERT (	[leaderboard_id]
      ,[bonus_id]
      ,[player_id]
      ,[creation_dt]
      ,[updated_dt]
      ,[result_total]
      ,[result_rank]
      ,[bets]
      ,[wins]
      ,[bets_count]
      ,[status_id]
      ,[deposits])
VALUES (src.[leaderboard_id]
      ,src.[bonus_id]
      ,src.[player_id]
      ,src.[creation_dt]
      ,src.[updated_dt]
      ,src.[result_total]
      ,src.[result_rank]
      ,src.[bets]
      ,src.[wins]
      ,src.[bets_count]
      ,src.[status_id]
      ,src.[deposits]);







MERGE [DailyActionsDB].common.[tbl_Interactions_checks] AS trg
USING (	SELECT ch.[ID]
      ,ch.[PlayerID]
      ,ch.[RuleID]
	  ,r.RuleCode
      ,ch.[ValueID]
	  ,rv.ValueCode
      ,ch.[PlayerValue]
      ,ch.[Score]
      ,ch.[UpdatedDate]
      ,ch.[ExpiredAt]
  FROM [ProgressPlayDB].[interactions].[tbl_Checks] ch (NOLOCK)
  INNER JOIN [ProgressPlayDB].interactions.tbl_Rules r (NOLOCK) ON r.RuleID = ch.RuleID
  INNER JOIN [ProgressPlayDB].interactions.tbl_RulesValues rv (NOLOCK) ON rv.ID = ch.ValueID
  LEFT OUTER JOIN [DailyActionsDB].common.[tbl_Interactions_checks] dach ON dach.ID = ch.ID
  WHERE dach.[UpdatedDate] IS NULL OR dach.[UpdatedDate] != ch.[UpdatedDate]
  ) AS src
ON (trg.ID = src.ID)

WHEN MATCHED 
THEN UPDATE 
SET 
trg.[ID] = src.[ID],
trg.[PlayerID] = src.[PlayerID],
trg.[RuleID] = src.[RuleID],
trg.RuleCode = src.RuleCode,
trg.[ValueID] = src.[ValueID],
trg.ValueCode = src.ValueCode,
trg.[PlayerValue] = src.[PlayerValue],
trg.[Score] = src.[Score],
trg.[UpdatedDate] = src.[UpdatedDate],
trg.[ExpiredAt] = src.[ExpiredAt]

WHEN NOT MATCHED BY TARGET
THEN INSERT (	[ID]
      ,[PlayerID]
      ,[RuleID]
      ,RuleCode
      ,[ValueID]
      ,ValueCode
      ,[PlayerValue]
      ,[Score]
      ,[UpdatedDate]
      ,[ExpiredAt])
VALUES (src.[ID]
      ,src.[PlayerID]
      ,src.[RuleID]
      ,src.RuleCode
      ,src.[ValueID]
      ,src.ValueCode
      ,src.[PlayerValue]
      ,src.[Score]
      ,src.[UpdatedDate]
      ,src.[ExpiredAt]);





MERGE [DailyActionsDB].common.[tbl_Interactions_ScoreChecks] AS trg
USING (	SELECT sc.[ID]
      ,sc.[PlayerID]
      ,sc.[ScoreSum]
      ,sc.[ValueID]
	  ,rv.ValueCode
      ,sc.[ChecksIDs]
      ,sc.[ChecksDetails]
      ,sc.[UpdatedDate]
  FROM [ProgressPlayDB].[interactions].[tbl_ScoreChecks] sc (NOLOCK)
  INNER JOIN [ProgressPlayDB].interactions.tbl_RulesValues rv (NOLOCK) ON rv.ID = sc.ValueID
  LEFT OUTER JOIN [DailyActionsDB].common.[tbl_Interactions_ScoreChecks] dasc ON dasc.ID = sc.ID
  WHERE dasc.[UpdatedDate] IS NULL OR dasc.[UpdatedDate] != sc.[UpdatedDate]
  ) AS src
ON (trg.ID = src.ID)

WHEN MATCHED 
THEN UPDATE 
SET 
trg.[ID] = src.[ID],
trg.[PlayerID] = src.[PlayerID],
trg.[ScoreSum] = src.[ScoreSum],
trg.[ValueID] = src.[ValueID],
trg.ValueCode = src.ValueCode,
trg.[ChecksIDs] = src.[ChecksIDs],
trg.[ChecksDetails] = src.[ChecksDetails],
trg.[UpdatedDate] = src.[UpdatedDate]

WHEN NOT MATCHED BY TARGET
THEN INSERT (	[ID]
      ,[PlayerID]
      ,[ScoreSum]
      ,[ValueID]
      ,ValueCode
      ,[ChecksIDs]
      ,[ChecksDetails]
      ,[UpdatedDate])
VALUES (src.[ID]
      ,src.[PlayerID]
      ,src.[ScoreSum]
      ,src.[ValueID]
      ,src.ValueCode
      ,src.[ChecksIDs]
      ,src.[ChecksDetails]
      ,src.[UpdatedDate]);

GO
/****** Object:  StoredProcedure [dbo].[stp_Update_Sports]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[stp_Update_Sports]
AS

-- Merge dimension tables

MERGE [DailyActionsDB].dbo.SportBetStates trg
USING (	SELECT	bs.[ID],
				bs.[BetStateID],
				bs.[BetStateName],
				bs.[CreatedDate]
		FROM [ProgressPlayDB].[Games].[Games_BetConstruct_BetStates] bs (NOLOCK)
		left outer join [DailyActionsDB].dbo.SportBetStates dbs on dbs.ID = bs.ID
		WHERE dbs.[CreatedDate] IS NULL OR bs.[CreatedDate] != dbs.[CreatedDate] ) src		
ON trg.ID = src.ID
WHEN MATCHED THEN
UPDATE SET	trg.[BetStateID] = src.[BetStateID],
			trg.[BetStateName] = src.[BetStateName],
			trg.[CreatedDate] = src.[CreatedDate]
WHEN NOT MATCHED BY TARGET THEN 
	INSERT(	[ID],
			[BetStateID],
			[BetStateName],
			[CreatedDate])
	VALUES(	src.[ID],
			src.[BetStateID],
			src.[BetStateName],
			src.[CreatedDate]);


MERGE [DailyActionsDB].dbo.SportBetTypes trg
USING (	SELECT	bs.[ID],
				bs.BetTypeID,
				bs.BetTypeName,
				bs.[CreatedDate]
		FROM [ProgressPlayDB].[Games].[Games_BetConstruct_BetTypes] bs (NOLOCK)
		left outer join [DailyActionsDB].dbo.SportBetTypes dbs on dbs.ID = bs.ID
		WHERE dbs.[CreatedDate] IS NULL OR bs.[CreatedDate] != dbs.[CreatedDate] ) src		
ON trg.ID = src.ID
WHEN MATCHED THEN
UPDATE SET	trg.BetTypeID = src.BetTypeID,
			trg.BetTypeName = src.BetTypeName,
			trg.[CreatedDate] = src.[CreatedDate]
WHEN NOT MATCHED BY TARGET THEN 
	INSERT(	[ID],
			BetTypeID,
			BetTypeName,
			[CreatedDate])
	VALUES(	src.[ID],
			src.BetTypeID,
			src.BetTypeName,
			src.[CreatedDate]);




MERGE [DailyActionsDB].dbo.SportCompetitions trg
USING (	SELECT	bs.[ID],
				bs.[CompetitionID],
				bs.[CompetitionName],
				bs.[CreatedDate]
		FROM [ProgressPlayDB].[Games].[Games_BetConstruct_Competitions] bs (NOLOCK)
		left outer join [DailyActionsDB].dbo.SportCompetitions dbs on dbs.ID = bs.ID
		WHERE dbs.[CreatedDate] IS NULL OR bs.[CreatedDate] != dbs.[CreatedDate] ) src		
ON trg.ID = src.ID
WHEN MATCHED THEN
UPDATE SET	trg.[CompetitionID] = src.[CompetitionID],
			trg.[CompetitionName] = src.[CompetitionName],
			trg.[CreatedDate] = src.[CreatedDate]
WHEN NOT MATCHED BY TARGET THEN 
	INSERT(	[ID],
			[CompetitionID],
			[CompetitionName],
			[CreatedDate])
	VALUES(	src.[ID],
			src.[CompetitionID],
			src.[CompetitionName],
			src.[CreatedDate]);


MERGE [DailyActionsDB].dbo.SportMarkets trg
USING (	SELECT	bs.[ID],
				bs.[MarketTypeID],
				bs.[MarketName],
				bs.[CreatedDate]
		FROM [ProgressPlayDB].[Games].[Games_BetConstruct_Markets] bs (NOLOCK)
		left outer join [DailyActionsDB].dbo.SportMarkets dbs on dbs.ID = bs.ID
		WHERE dbs.[CreatedDate] IS NULL OR bs.[CreatedDate] != dbs.[CreatedDate] ) src		
ON trg.ID = src.ID
WHEN MATCHED THEN
UPDATE SET	trg.[MarketTypeID] = src.[MarketTypeID],
			trg.[MarketName] = src.[MarketName],
			trg.[CreatedDate] = src.[CreatedDate]
WHEN NOT MATCHED BY TARGET THEN 
	INSERT(	[ID],
			[MarketTypeID],
			[MarketName],
			[CreatedDate])
	VALUES(	src.[ID],
			src.[MarketTypeID],
			src.[MarketName],
			src.[CreatedDate]);

			
MERGE [DailyActionsDB].dbo.SportMatches trg
USING (	SELECT	bs.[ID],
				bs.[MatchID],
				bs.[MatchName],
				bs.[CreatedDate]
		FROM [ProgressPlayDB].[Games].[Games_BetConstruct_Matches] bs (NOLOCK)
		left outer join [DailyActionsDB].dbo.SportMatches dbs on dbs.ID = bs.ID
		WHERE dbs.[CreatedDate] IS NULL OR bs.[CreatedDate] != dbs.[CreatedDate] ) src		
ON trg.ID = src.ID
WHEN MATCHED THEN
UPDATE SET	trg.[MatchID] = src.[MatchID],
			trg.[MatchName] = src.[MatchName],
			trg.[CreatedDate] = src.[CreatedDate]
WHEN NOT MATCHED BY TARGET THEN 
	INSERT(	[ID],
			[MatchID],
			[MatchName],
			[CreatedDate])
	VALUES(	src.[ID],
			src.[MatchID],
			src.[MatchName],
			src.[CreatedDate]);


MERGE [DailyActionsDB].dbo.SportOddsTypes trg
USING (	SELECT	bs.[ID],
				bs.[OddTypeID],
				bs.[OddTypeName],
				bs.[CreatedDate]
		FROM [ProgressPlayDB].[Games].[Games_BetConstruct_OddsTypes] bs (NOLOCK)
		left outer join [DailyActionsDB].dbo.SportOddsTypes dbs on dbs.ID = bs.ID
		WHERE dbs.[CreatedDate] IS NULL OR bs.[CreatedDate] != dbs.[CreatedDate] ) src		
ON trg.ID = src.ID
WHEN MATCHED THEN
UPDATE SET	trg.[OddTypeID] = src.[OddTypeID],
			trg.[OddTypeName] = src.[OddTypeName],
			trg.[CreatedDate] = src.[CreatedDate]
WHEN NOT MATCHED BY TARGET THEN 
	INSERT(	[ID],
			[OddTypeID],
			[OddTypeName],
			[CreatedDate])
	VALUES(	src.[ID],
			src.[OddTypeID],
			src.[OddTypeName],
			src.[CreatedDate]);

MERGE [DailyActionsDB].dbo.SportRegions trg
USING (	SELECT	bs.[ID],
				bs.[RegionID],
				bs.[RegionName],
				bs.[CreatedDate]
		FROM [ProgressPlayDB].[Games].[Games_BetConstruct_Regions] bs (NOLOCK)
		left outer join [DailyActionsDB].dbo.SportRegions dbs on dbs.ID = bs.ID
		WHERE dbs.[CreatedDate] IS NULL OR bs.[CreatedDate] != dbs.[CreatedDate] ) src		
ON trg.ID = src.ID
WHEN MATCHED THEN
UPDATE SET	trg.[RegionID] = src.[RegionID],
			trg.[RegionName] = src.[RegionName],
			trg.[CreatedDate] = src.[CreatedDate]
WHEN NOT MATCHED BY TARGET THEN 
	INSERT(	[ID],
			[RegionID],
			[RegionName],
			[CreatedDate])
	VALUES(	src.[ID],
			src.[RegionID],
			src.[RegionName],
			src.[CreatedDate]);



MERGE [DailyActionsDB].dbo.SportSports trg
USING (	SELECT	bs.[ID],
				bs.[SportID],
				bs.[SportName],
				bs.[CreatedDate]
		FROM [ProgressPlayDB].[Games].[Games_BetConstruct_Sports] bs (NOLOCK)
		left outer join [DailyActionsDB].dbo.SportSports dbs on dbs.ID = bs.ID
		WHERE dbs.[CreatedDate] IS NULL OR bs.[CreatedDate] != dbs.[CreatedDate] ) src		
ON trg.ID = src.ID
WHEN MATCHED THEN
UPDATE SET	trg.[SportID] = src.[SportID],
			trg.[SportName] = src.[SportName],
			trg.[CreatedDate] = src.[CreatedDate]
WHEN NOT MATCHED BY TARGET THEN 
	INSERT(	[ID],
			[SportID],
			[SportName],
			[CreatedDate])
	VALUES(	src.[ID],
			src.[SportID],
			src.[SportName],
			src.[CreatedDate]);



			
GO
/****** Object:  StoredProcedure [dbo].[stp_Update_SportsBets]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- EXEC dbo.stp_Update_SportsBets '2018-05-01', '2019-01-01'
-- DROP PROCEDURE dbo.stp_Update_SportsBets
CREATE PROCEDURE [dbo].[stp_Update_SportsBets]
	@FromDate DATETIME = NULL,
	@ToDate DATETIME = NULL
AS

	IF @FromDate IS NULL
		SELECT @FromDate = MAX(UpdatedDate) FROM dbo.SportBets;

	IF @FromDate IS NULL
		SELECT @FromDate = MIN(UpdatedDate) FROM [ProgressPlayDB].Games.Games_BetConstruct_Bet_Selection;

	IF @ToDate IS NULL
		SELECT @ToDate = MAX(UpdatedDate) FROM [ProgressPlayDB].Games.Games_BetConstruct_Bet_Selection;

	IF OBJECT_ID('tempdb..#Temp') IS NOT NULL DROP TABLE #Temp;
	
	select 
		RelativeBet = SUM(TotalBet * rate_in_EUR * (Price/CASE WHEN PriceForBet = 0 THEN 1 ELSE PriceForBet END)),
		RelativeWin = SUM(TotalWin * rate_in_EUR * (Price/CASE WHEN PriceForBet = 0 THEN 1 ELSE PriceForBet END)),
		player_id,
		RegionId,
		SportId,
		CompetitionId,
		MatchId,
		IsLive,
		UpdatedDate
	into #Temp
	from
	(
	select 
		pg.TotalBet,
		pg.TotalWin,
		c.rate_in_EUR,
		s.Price,
		p.player_id,
		s.RegionId,
		s.SportId,
		s.CompetitionId,
		s.MatchId,
		s.IsLive,
		CONVERT(date, s.UpdatedDate) AS UpdatedDate,
		PriceForBet = SUM(s.Price) OVER (PARTITION BY s.InternalBetId, CONVERT(date, s.UpdatedDate))
	from [ProgressPlayDB].Games.Games_BetConstruct_Bet_Selection s with(nolock)
	left join [ProgressPlayDB].Games.Games_BetConstruct_Bet b with(NOLOCK) ON b.ID = s.InternalBetId
	INNER JOIN [ProgressPlayDB].Games.Games_PlayedGameActions pga with(NOLOCK) ON pga.ID = b.PlayedGameActionID
	INNER JOIN [ProgressPlayDB].Games.Games_PlayedGames pg with(NOLOCK) ON pg.ID = pga.PlayedGameID
	inner join [ProgressPlayDB].common.tbl_Players p with(NOLOCK) ON p.player_id = b.PlayerID
	inner join [ProgressPlayDB].common.tbl_Currencies c with(NOLOCK) ON p.currency_id = c.currency_id

	WHERE p.is_internal != 1
	and s.UpdatedDate BETWEEN @FromDate AND @ToDate
	and b.BetState != 1
	) AS p
	GROUP BY player_id, RegionId, SportId,
		 CompetitionId,
		 MatchId,
		 IsLive,
		 UpdatedDate
	OPTION(RECOMPILE);

	RAISERROR(N'Loaded %d rows into temp table.',0,1,@@ROWCOUNT) WITH NOWAIT;

	CREATE UNIQUE CLUSTERED INDEX [IX_SportBets] ON #Temp
	(
		[player_id] ASC,
		[RegionId] ASC,
		[SportId] ASC,
		[CompetitionId] ASC,
		[MatchId] ASC,
		[IsLive] ASC,
		[UpdatedDate] ASC
	);

	MERGE INTO [DailyActionsDB].dbo.SportBets AS trgt
	USING #Temp AS Src
	ON
	trgt.player_id = Src.player_id
	AND trgt.RegionId = Src.RegionId
	AND trgt.SportId = Src.SportId
	AND trgt.CompetitionId = Src.CompetitionId
	AND trgt.MatchId = Src.MatchId
	AND trgt.IsLive = Src.IsLive
	AND trgt.UpdatedDate = Src.UpdatedDate
	WHEN MATCHED THEN
		UPDATE SET
			[RelativeBet] = Src.[RelativeBet],
			[RelativeWin] = Src.[RelativeWin],
			[LastUpdate] = GETUTCDATE()
	WHEN NOT MATCHED BY TARGET THEN
		INSERT ([RelativeBet], [RelativeWin], [player_id], [RegionId], [SportId], [CompetitionId], [MatchId], [IsLive], [UpdatedDate], [LastUpdate])
		VALUES ([RelativeBet], [RelativeWin], [player_id], [RegionId], [SportId], [CompetitionId], [MatchId], [IsLive], [UpdatedDate], GETUTCDATE())
	;
GO
/****** Object:  StoredProcedure [dbo].[stp_Update_SportsBets_old]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- EXEC dbo.stp_Update_SportsBets '2018-05-01', '2019-01-01'
-- DROP PROCEDURE dbo.stp_Update_SportsBets
CREATE PROCEDURE [dbo].[stp_Update_SportsBets_old]
	@FromDate DATETIME = NULL,
	@ToDate DATETIME = NULL
AS

	IF @FromDate IS NULL
		SELECT @FromDate = MAX(UpdatedDate) FROM dbo.SportBets;

	IF @FromDate IS NULL
		SELECT @FromDate = MIN(UpdatedDate) FROM [ProgressPlayDB].Games.Games_BetConstruct_Bet_Selection;

	IF @ToDate IS NULL
		SELECT @ToDate = MAX(UpdatedDate) FROM [ProgressPlayDB].Games.Games_BetConstruct_Bet_Selection;

	IF OBJECT_ID('tempdb..#Temp') IS NOT NULL DROP TABLE #Temp;
	
	select 
		RelativeBet = SUM(TotalBet * rate_in_EUR * (Price/PriceForBet)),
		RelativeWin = SUM(TotalWin * rate_in_EUR * (Price/PriceForBet)),
		player_id,
		RegionId,
		SportId,
		CompetitionId,
		MatchId,
		UpdatedDate
	into #Temp
	from
	(
	select 
		pg.TotalBet,
		pg.TotalWin,
		c.rate_in_EUR,
		s.Price,
		p.player_id,
		s.RegionId,
		s.SportId,
		s.CompetitionId,
		s.MatchId,
		CONVERT(date, s.UpdatedDate) AS UpdatedDate,
		PriceForBet = SUM(s.Price) OVER (PARTITION BY s.InternalBetId, CONVERT(date, s.UpdatedDate))
	from [ProgressPlayDB].Games.Games_BetConstruct_Bet_Selection s with(nolock)
	left join [ProgressPlayDB].Games.Games_BetConstruct_Bet b with(NOLOCK) ON b.ID = s.InternalBetId
	INNER JOIN [ProgressPlayDB].Games.Games_PlayedGameActions pga with(NOLOCK) ON pga.ID = b.PlayedGameActionID
	INNER JOIN [ProgressPlayDB].Games.Games_PlayedGames pg with(NOLOCK) ON pg.ID = pga.PlayedGameID
	inner join [ProgressPlayDB].common.tbl_Players p with(NOLOCK) ON p.player_id = b.PlayerID
	inner join [ProgressPlayDB].common.tbl_Currencies c with(NOLOCK) ON p.currency_id = c.currency_id

	WHERE p.is_internal != 1
	and s.UpdatedDate BETWEEN @FromDate AND @ToDate
	and b.BetState != 1
	) AS p
	GROUP BY player_id, RegionId, SportId,
		 CompetitionId,
		 MatchId,
		 UpdatedDate
	OPTION(RECOMPILE);

	RAISERROR(N'Loaded %d rows into temp table.',0,1,@@ROWCOUNT) WITH NOWAIT;

	CREATE UNIQUE CLUSTERED INDEX [IX_SportBets] ON #Temp
	(
		[player_id] ASC,
		[RegionId] ASC,
		[SportId] ASC,
		[CompetitionId] ASC,
		[MatchId] ASC,
		[UpdatedDate] ASC
	);

	MERGE INTO [DailyActionsDB].dbo.SportBets AS trgt
	USING #Temp AS Src
	ON
	trgt.player_id = Src.player_id
	AND trgt.RegionId = Src.RegionId
	AND trgt.SportId = Src.SportId
	AND trgt.CompetitionId = Src.CompetitionId
	AND trgt.MatchId = Src.MatchId
	AND trgt.UpdatedDate = Src.UpdatedDate
	WHEN MATCHED THEN
		UPDATE SET
			[RelativeBet] = Src.[RelativeBet],
			[RelativeWin] = Src.[RelativeWin],
			LastUpdate = GETUTCDATE()
	WHEN NOT MATCHED BY TARGET THEN
		INSERT ([RelativeBet], [RelativeWin], [player_id], [RegionId], [SportId], [CompetitionId], [MatchId], [UpdatedDate], LastUpdate)
		VALUES ([RelativeBet], [RelativeWin], [player_id], [RegionId], [SportId], [CompetitionId], [MatchId], [UpdatedDate], GETUTCDATE())
	;
GO
/****** Object:  StoredProcedure [dbo].[stp_Update_SportsBets_test]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- EXEC dbo.stp_Update_SportsBets '2018-05-01', '2019-01-01'
-- DROP PROCEDURE dbo.stp_Update_SportsBets
CREATE PROCEDURE [dbo].[stp_Update_SportsBets_test]
	@FromDate DATETIME = NULL,
	@ToDate DATETIME = NULL
AS

	IF @FromDate IS NULL
		SELECT @FromDate = MAX(UpdatedDate) FROM dbo.SportBets;

	IF @FromDate IS NULL
		SELECT @FromDate = MIN(UpdatedDate) FROM [ProgressPlayDB].Games.Games_BetConstruct_Bet_Selection;

	IF @ToDate IS NULL
		SELECT @ToDate = MAX(UpdatedDate) FROM [ProgressPlayDB].Games.Games_BetConstruct_Bet_Selection;

	IF OBJECT_ID('tempdb..#Temp') IS NOT NULL DROP TABLE #Temp;
	
	select 
		RelativeBet = SUM(TotalBet * rate_in_EUR * (Price/CASE WHEN PriceForBet = 0 THEN 1 ELSE PriceForBet END)),
		RelativeWin = SUM(TotalWin * rate_in_EUR * (Price/CASE WHEN PriceForBet = 0 THEN 1 ELSE PriceForBet END)),
		player_id,
		RegionId,
		SportId,
		CompetitionId,
		MatchId,
		IsLive,
		UpdatedDate
	into #Temp
	from
	(
	select 
		pg.TotalBet,
		pg.TotalWin,
		c.rate_in_EUR,
		s.Price,
		p.player_id,
		s.RegionId,
		s.SportId,
		s.CompetitionId,
		s.MatchId,
		s.IsLive,
		CONVERT(date, s.UpdatedDate) AS UpdatedDate,
		PriceForBet = SUM(s.Price) OVER (PARTITION BY s.InternalBetId, CONVERT(date, s.UpdatedDate))
	from [ProgressPlayDB].Games.Games_BetConstruct_Bet_Selection s with(nolock)
	left join [ProgressPlayDB].Games.Games_BetConstruct_Bet b with(NOLOCK) ON b.ID = s.InternalBetId
	INNER JOIN [ProgressPlayDB].Games.Games_PlayedGameActions pga with(NOLOCK) ON pga.ID = b.PlayedGameActionID
	INNER JOIN [ProgressPlayDB].Games.Games_PlayedGames pg with(NOLOCK) ON pg.ID = pga.PlayedGameID
	inner join [ProgressPlayDB].common.tbl_Players p with(NOLOCK) ON p.player_id = b.PlayerID
	inner join [ProgressPlayDB].common.tbl_Currencies c with(NOLOCK) ON p.currency_id = c.currency_id

	WHERE p.is_internal != 1
	and s.UpdatedDate BETWEEN @FromDate AND @ToDate
	and b.BetState != 1
	) AS p
	GROUP BY player_id, RegionId, SportId,
		 CompetitionId,
		 MatchId,
		 IsLive,
		 UpdatedDate
	OPTION(RECOMPILE);

	RAISERROR(N'Loaded %d rows into temp table.',0,1,@@ROWCOUNT) WITH NOWAIT;

	CREATE UNIQUE CLUSTERED INDEX [IX_SportBets] ON #Temp
	(
		[player_id] ASC,
		[RegionId] ASC,
		[SportId] ASC,
		[CompetitionId] ASC,
		[MatchId] ASC,
		[IsLive] ASC,
		[UpdatedDate] ASC
	);

	MERGE INTO [DailyActionsDB].dbo.SportBets_test AS trgt
	USING #Temp AS Src
	ON
	trgt.player_id = Src.player_id
	AND trgt.RegionId = Src.RegionId
	AND trgt.SportId = Src.SportId
	AND trgt.CompetitionId = Src.CompetitionId
	AND trgt.MatchId = Src.MatchId
	AND trgt.IsLive = Src.IsLive
	AND trgt.UpdatedDate = Src.UpdatedDate
	WHEN MATCHED THEN
		UPDATE SET
			[RelativeBet] = Src.[RelativeBet],
			[RelativeWin] = Src.[RelativeWin],
			[LastUpdate] = GETUTCDATE()
	WHEN NOT MATCHED BY TARGET THEN
		INSERT ([RelativeBet], [RelativeWin], [player_id], [RegionId], [SportId], [CompetitionId], [MatchId], [IsLive], [UpdatedDate], [LastUpdate])
		VALUES ([RelativeBet], [RelativeWin], [player_id], [RegionId], [SportId], [CompetitionId], [MatchId], [IsLive], [UpdatedDate], GETUTCDATE())
	;
GO
/****** Object:  StoredProcedure [dbo].[stp_Update_SportsBetsEnhanced]    Script Date: 5/5/2025 10:40:23 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- EXEC dbo.stp_Update_SportsBets '2018-05-01', '2019-01-01'
-- DROP PROCEDURE dbo.stp_Update_SportsBets
CREATE PROCEDURE [dbo].[stp_Update_SportsBetsEnhanced]
	@FromDate DATETIME = NULL,
	@ToDate DATETIME = NULL
AS

	IF @FromDate IS NULL
		SELECT @FromDate = MAX(UpdatedDate) FROM dbo.SportBetsEnhanced;

	IF @FromDate IS NULL
		SELECT @FromDate = MIN(UpdatedDate) FROM [ProgressPlayDB].Games.Games_BetConstruct_Bet_Selection;

	IF @ToDate IS NULL
		SELECT @ToDate = MAX(UpdatedDate) FROM [ProgressPlayDB].Games.Games_BetConstruct_Bet_Selection;

	IF OBJECT_ID('tempdb..#Temp') IS NOT NULL DROP TABLE #Temp;
	
	select 
		RelativeBet = SUM(TotalBet * rate_in_GBP * (Price/CASE WHEN PriceForBet = 0 THEN 1 ELSE PriceForBet END)),
		RelativeWin = SUM(TotalWin * rate_in_GBP * (Price/CASE WHEN PriceForBet = 0 THEN 1 ELSE PriceForBet END)),
		PlayerId,
		BetId,
		BetType,
		RegionId,
		SportId,
		CompetitionId,
		MatchId,
		MarketId,
		IsLive,
		OddTypeId,
		BetState,
		UpdatedDate
	into #Temp
	from
	(
	select 
		pg.TotalBet,
		pg.TotalWin,
		c.rate_in_GBP,
		s.Price,
		p.player_id AS PlayerId,
		b.BetId,
		b.BetType,
		s.RegionId,
		s.SportId,
		s.CompetitionId,
		s.MatchId,
		s.MarketTypeId AS MarketId,
		b.BetState,
		b.OddType AS OddTypeId,
		s.IsLive,
		CONVERT(date, s.UpdatedDate) AS UpdatedDate,
		PriceForBet = SUM(s.Price) OVER (PARTITION BY s.InternalBetId, CONVERT(date, s.UpdatedDate))
	from [ProgressPlayDB].Games.Games_BetConstruct_Bet_Selection s with(nolock)
	left join [ProgressPlayDB].Games.Games_BetConstruct_Bet b with(NOLOCK) ON b.ID = s.InternalBetId
	INNER JOIN [ProgressPlayDB].Games.Games_PlayedGameActions pga with(NOLOCK) ON pga.ID = b.PlayedGameActionID
	INNER JOIN [ProgressPlayDB].Games.Games_PlayedGames pg with(NOLOCK) ON pg.ID = pga.PlayedGameID
	inner join [ProgressPlayDB].common.tbl_Players p with(NOLOCK) ON p.player_id = b.PlayerID
	inner join [ProgressPlayDB].common.tbl_Currencies c with(NOLOCK) ON p.currency_id = c.currency_id

	WHERE p.is_internal != 1
	and s.UpdatedDate BETWEEN @FromDate AND @ToDate
	and b.BetState != 1
	) AS p
	GROUP BY PlayerId, BetId, BetType, RegionId, SportId,
		 CompetitionId,
		 MatchId,
		 MarketId,
		 IsLive,
		 OddTypeId,
		 BetState,
		 UpdatedDate
	OPTION(RECOMPILE);

	RAISERROR(N'Loaded %d rows into temp table.',0,1,@@ROWCOUNT) WITH NOWAIT;
	
	CREATE UNIQUE CLUSTERED INDEX [IX_SportBets] ON #Temp
	(
		[PlayerId] ASC,
		[BetId] ASC,
		[BetType] ASC,
		[OddTypeId] ASC,
		[RegionId] ASC,
		[SportId] ASC,
		[CompetitionId] ASC,
		[MatchId] ASC,
		[MarketId] ASC,
		[IsLive] ASC,
		[BetState] ASC,
		[UpdatedDate] ASC
	);

	MERGE INTO [DailyActionsDB].dbo.SportBetsEnhanced AS trgt
	USING #Temp AS Src
	ON
	trgt.PlayerId = Src.PlayerId
	AND trgt.BetId = Src.BetId
	AND trgt.BetType = Src.BetType
	AND trgt.OddTypeId = Src.OddTypeId
	AND trgt.RegionId = Src.RegionId
	AND trgt.SportId = Src.SportId
	AND trgt.CompetitionId = Src.CompetitionId
	AND trgt.MatchId = Src.MatchId
	AND trgt.MarketId = Src.MarketId
	AND trgt.IsLive = Src.IsLive
	AND trgt.UpdatedDate = Src.UpdatedDate
	WHEN MATCHED THEN
		UPDATE SET
			[RelativeBet] = Src.[RelativeBet],
			[RelativeWin] = Src.[RelativeWin],
			[BetState] = Src.BetState,
			[LastUpdate] = GETUTCDATE()
	WHEN NOT MATCHED BY TARGET THEN
		INSERT ([RelativeBet], [RelativeWin], [PlayerId], [BetId], [BetType], [OddTypeId], [RegionId], [SportId], [CompetitionId], [MatchId], [MarketId], [IsLive], [BetState], [UpdatedDate], [LastUpdate])
		VALUES ([RelativeBet], [RelativeWin], [PlayerId], [BetId], [BetType], [OddTypeId], [RegionId], [SportId], [CompetitionId], [MatchId], [MarketId], [IsLive], [BetState], [UpdatedDate], GETUTCDATE())
	;
GO
