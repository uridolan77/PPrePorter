# Cache Logging Documentation

This document provides information about the caching system in the PPrePorter application, particularly for the DailyActions data.

## Cache Keys

The following cache keys are used in the DailyActionsService:

1. **Daily Actions Data**: `DailyActions_Data_{startDate}_{endDate}_{whiteLabelId}`
   - Format: `DailyActions_Data_yyyyMMdd_yyyyMMdd_whiteLabelId`
   - Example: `DailyActions_Data_20250509_20250510_2`

2. **Daily Action by ID**: `DailyAction_ById_{id}`
   - Format: `DailyAction_ById_id`
   - Example: `DailyAction_ById_12345`

3. **Filtered Daily Actions**: `DailyActions_Filtered_{filterHash}`
   - Format: `DailyActions_Filtered_hash`
   - Example: `DailyActions_Filtered_a1b2c3d4e5f6`

4. **Summary Metrics**: `DailyActions_Summary_{startDate}_{endDate}_{whiteLabelId}`
   - Format: `DailyActions_Summary_yyyyMMdd_yyyyMMdd_whiteLabelId`
   - Example: `DailyActions_Summary_20250509_20250510_2`

## Cache Logging

The application logs detailed information about cache operations with millisecond timestamps:

### Cache Key Generation

```log
CACHE KEY GENERATION [12:34:56.789]: Generated cache key for daily actions: DailyActions_Data_20250509_20250510_2 with parameters: startDate=2025-05-09, endDate=2025-05-10, whiteLabelId=2
```

### Cache Hit

```log
CACHE HIT [12:34:56.789]: Retrieved daily actions from cache for date range 05/09/2025 00:00:00 to 05/10/2025 00:00:00 and white label 2, cache key: DailyActions_Data_20250509_20250510_2, count: 145, retrieval time: 5.2ms
```

### Cache Miss

```log
CACHE MISS [12:34:56.789]: Getting daily actions from database for date range 05/09/2025 00:00:00 to 05/10/2025 00:00:00 and white label 2, cache key: DailyActions_Data_20250509_20250510_2
```

### Cache Set

```log
CACHE SET SUCCESS [12:34:56.789]: Cached daily actions for date range 05/09/2025 00:00:00 to 05/10/2025 00:00:00 and white label 2, cache key: DailyActions_Data_20250509_20250510_2, estimated size: 145000 bytes, count: 145
```

## Performance Metrics

The application now includes detailed performance metrics for all cache operations:

### Method Performance

```log
PERF [12:34:56.789]: Starting GetDailyActionsAsync
PERF [12:34:56.789]: GetDailyActionsAsync completed with CACHE HIT in 15.3ms
PERF [12:34:56.789]: GetDailyActionsAsync completed with CACHE MISS in 1250.7ms
```

### Cache Operation Performance

```log
PERF [12:34:56.789]: Cache set operation completed in 8.5ms
PERF [12:34:56.789]: Database query for daily actions completed in 1150.2ms
```

### Request Performance

```log
PERF [12:34:56.789]: Starting GetDailyActionsData request
PERF [12:34:56.789]: GetDailyActionsAsync completed in 15.3ms
PERF [12:34:56.789]: GetSummaryMetricsAsync completed in 12.1ms
PERF [12:34:56.789]: Total GetDailyActionsData request completed in 45.8ms
```

## Troubleshooting

If the cache is not working as expected, check the following:

1. **Cache Key Mismatch**: Ensure the cache key being used to set the data matches the key being used to retrieve it.
2. **Cache Size Limits**: Check if the cache size limit is being exceeded.
3. **Cache Expiration**: Verify that the cache entries are not expiring too quickly.
4. **Cache Eviction**: Check if cache entries are being evicted due to memory pressure.

## Common Issues

### Cache Key Format

The cache key format must be consistent between setting and getting. The format is:

```text
DailyActions_Data_yyyyMMdd_yyyyMMdd_whiteLabelId
```

Where:

- `yyyyMMdd` is the date format (e.g., 20250509 for May 9, 2025)
- `whiteLabelId` is the ID of the white label, or "all" if no specific white label is selected

### Cache Size

Each DailyAction object is estimated to be about 1000 bytes. For large result sets, the total cache size can be significant. The cache has a size limit of 200MB by default.

### Cache Verification

After setting a value in the cache, the application attempts to verify that the value was cached correctly by immediately retrieving it. If this verification fails, it indicates a problem with the caching system.

## Cache Initialization Log

=== INITIALIZING CACHE ===
23:44:40 info: PPrePorter.Core.Services.GlobalCacheService[0]
      GlobalCacheService initialized with static cache instance: 17660485
23:44:40 info: Program[0]
      Using cache service implementation: GlobalCacheService
23:44:40 info: Program[0]
      Initial cache statistics: [TotalHits, 0], [TotalMisses, 0], [HitRatio, 0], [CacheCount, 0], [TopHits, System.Collections.Generic.Dictionary`2[System.String,System.Int32]], [TopMisses, System.Collections.Generic.Dictionary`2[System.String,System.Int32]]
23:44:40 info: PPrePorter.DailyActionsDB.Services.DailyActionsService[0]
      DailyActionsService initialized with global cache service instance: 28274094, DbContext instance: 53140254
23:44:40 info: Program[0]
      Using DailyActionsService implementation: DailyActionsService
Prewarming cache with commonly accessed data...
23:44:40 info: PPrePorter.DailyActionsDB.Services.DailyActionsService[0]
      Prewarming cache with commonly accessed data...
23:44:40 dbug: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE TRY GET: Attempting to get value from cache with key: DailyActions_Metadata, type: DailyActionMetadataDto
23:44:40 dbug: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE RAW MISS: No value found in cache with key: DailyActions_Metadata
23:44:40 warn: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE MISS: Failed to retrieve value from cache with key: DailyActions_Metadata
23:44:40 warn: PPrePorter.DailyActionsDB.Services.DailyActionsService[0]
      CACHE MISS: Getting daily actions metadata from database, cache key: DailyActions_Metadata
23:44:40 info: PPrePorter.DailyActionsDB.Services.WhiteLabelService[0]
      Getting all white labels (includeInactive: True)
23:44:40 dbug: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE TRY GET: Attempting to get value from cache with key: WhiteLabel_All_True, type: Object
23:44:40 dbug: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE RAW MISS: No value found in cache with key: WhiteLabel_All_True
23:44:40 warn: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE MISS: Failed to retrieve value from cache with key: WhiteLabel_All_True
23:44:40 info: Microsoft.EntityFrameworkCore.Database.Command[20101]
      Executed DbCommand (115ms) [Parameters=[], CommandType='Text', CommandTimeout='60']
      -- WITH (NOLOCK)

      SELECT [t].[LabelID], [t].[LabelNameShort], [t].[DefaultCountry], [t].[DefaultCurrency], [t].[DefaultLanguage], [t].[IsActive], [t].[LabelName], [t].[UpdatedDate], [t].[LabelUrl], [t].[LabelUrlName]
      FROM [common].[tbl_White_labels] AS [t]
23:44:40 dbug: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE SET START: Setting value in cache with key: WhiteLabel_All_True, type: List`1, options: { Priority = Normal, Size = 272, SlidingExpiration = , AbsoluteExpiration =  }, current cache count: 0
23:44:40 info: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE SIZE PROVIDED: Using provided cache size for key WhiteLabel_All_True: 272 bytes
23:44:40 info: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE COLLECTION: Caching collection with 272 items for key WhiteLabel_All_True, total size: 272 bytes, avg size per item: 1 bytes, First item type: WhiteLabel
23:44:40 dbug: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE SET EXECUTE: About to call _staticCache.Set for key WhiteLabel_All_True
23:44:40 dbug: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE SET EXECUTE: Completed _staticCache.Set for key WhiteLabel_All_True
23:44:40 dbug: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE SET VERIFY: About to verify cache set for key WhiteLabel_All_True
23:44:40 dbug: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE COUNT CHANGE: Before: 0, After: 1, Difference: 1
23:44:40 dbug: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE SET VERIFY: Successfully verified cache set for key WhiteLabel_All_True, value type: List`1, same reference: True
23:44:40 dbug: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE SET VERIFY COLLECTION: Original count: 272, Verified count: 272, Same count: True
23:44:40 info: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE SET COMPLETE: Cached value with key: WhiteLabel_All_True, size: 272 bytes
23:44:40 dbug: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE STATS after set: TotalHits=0, TotalMisses=2, CacheCount=1
23:44:40 info: Microsoft.EntityFrameworkCore.Database.Command[20101]
      Executed DbCommand (97ms) [Parameters=[], CommandType='Text', CommandTimeout='60']
      SELECT [t].[CountryID], [t].[CountryIntlCode], [t].[CountryName], [t].[DefaultCurrency], [t].[DefaultLanguage], [t].[IsActive], [t].[IsoCode], [t].[JurisdictionCode], [t].[JurisdictionID], [t].[Locales], [t].[PhoneCode], [t].[UpdatedDate]
      FROM [common].[tbl_Countries] AS [t]
      WHERE [t].[IsActive] = CAST(1 AS bit)
      ORDER BY [t].[CountryName]
23:44:40 info: Microsoft.EntityFrameworkCore.Database.Command[20101]
      Executed DbCommand (94ms) [Parameters=[], CommandType='Text', CommandTimeout='60']
      SELECT [t].[CurrencyID], [t].[CurrencyCode], [t].[CurrencyName], [t].[CurrencySymbol], [t].[ForLanguages], [t].[ForLanguagesID], [t].[Multiplier], [t].[OrderBy], [t].[RateInEUR], [t].[RateInGBP], [t].[RateInUSD], [t].[UpdatedDate]
      FROM [common].[tbl_Currencies] AS [t]
      ORDER BY [t].[CurrencyName]
23:44:44 info: Microsoft.EntityFrameworkCore.Database.Command[20101]
      Executed DbCommand (3,596ms) [Parameters=[@__p_0='?' (DbType = Int32)], CommandType='Text', CommandTimeout='60']
      -- WITH (NOLOCK)

      SELECT TOP(@__p_0) [t0].[Language]
      FROM (
          SELECT DISTINCT [t].[Language]
          FROM [common].[tbl_Daily_actions_players] AS [t]
          WHERE [t].[Language] IS NOT NULL AND [t].[Language] NOT LIKE N''
      ) AS [t0]
      ORDER BY [t0].[Language]
23:44:47 info: Microsoft.EntityFrameworkCore.Database.Command[20101]
      Executed DbCommand (2,798ms) [Parameters=[@__p_0='?' (DbType = Int32)], CommandType='Text', CommandTimeout='60']
      -- WITH (NOLOCK)

      SELECT TOP(@__p_0) [t0].[RegisteredPlatform]
      FROM (
          SELECT DISTINCT [t].[RegisteredPlatform]
          FROM [common].[tbl_Daily_actions_players] AS [t]
          WHERE [t].[RegisteredPlatform] IS NOT NULL AND [t].[RegisteredPlatform] NOT LIKE N''
      ) AS [t0]
      ORDER BY [t0].[RegisteredPlatform]
23:44:49 info: Microsoft.EntityFrameworkCore.Database.Command[20101]
      Executed DbCommand (2,405ms) [Parameters=[@__p_0='?' (DbType = Int32)], CommandType='Text', CommandTimeout='60']
      -- WITH (NOLOCK)

      SELECT TOP(@__p_0) [t0].[Gender]
      FROM (
          SELECT DISTINCT [t].[Gender]
          FROM [common].[tbl_Daily_actions_players] AS [t]
          WHERE [t].[Gender] IS NOT NULL AND [t].[Gender] NOT LIKE N''
      ) AS [t0]
      ORDER BY [t0].[Gender]
23:44:53 info: Microsoft.EntityFrameworkCore.Database.Command[20101]
      Executed DbCommand (3,965ms) [Parameters=[@__p_0='?' (DbType = Int32)], CommandType='Text', CommandTimeout='60']
      -- WITH (NOLOCK)

      SELECT TOP(@__p_0) [t0].[Status]
      FROM (
          SELECT DISTINCT [t].[Status]
          FROM [common].[tbl_Daily_actions_players] AS [t]
          WHERE [t].[Status] IS NOT NULL AND [t].[Status] NOT LIKE N''
      ) AS [t0]
      ORDER BY [t0].[Status]
23:44:57 info: Microsoft.EntityFrameworkCore.Database.Command[20101]
      Executed DbCommand (3,772ms) [Parameters=[@__p_0='?' (DbType = Int32)], CommandType='Text', CommandTimeout='60']
      -- WITH (NOLOCK)

      SELECT TOP(@__p_0) [t0].[RegistrationPlayMode]
      FROM (
          SELECT DISTINCT [t].[RegistrationPlayMode]
          FROM [common].[tbl_Daily_actions_players] AS [t]
          WHERE [t].[RegistrationPlayMode] IS NOT NULL AND [t].[RegistrationPlayMode] NOT LIKE N''
      ) AS [t0]
      ORDER BY [t0].[RegistrationPlayMode]
23:44:59 info: Microsoft.EntityFrameworkCore.Database.Command[20101]
      Executed DbCommand (2,623ms) [Parameters=[@__p_0='?' (DbType = Int32)], CommandType='Text', CommandTimeout='60']
      -- WITH (NOLOCK)

      SELECT TOP(@__p_0) [t0].[AffiliateID]
      FROM (
          SELECT DISTINCT [t].[AffiliateID]
          FROM [common].[tbl_Daily_actions_players] AS [t]
          WHERE [t].[AffiliateID] IS NOT NULL AND [t].[AffiliateID] NOT LIKE N''
      ) AS [t0]
      ORDER BY [t0].[AffiliateID]
23:44:59 dbug: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE SET START: Setting value in cache with key: DailyActions_Metadata, type: DailyActionMetadataDto, options: { Priority = NeverRemove, Size = 77690, SlidingExpiration = 01:00:00, AbsoluteExpiration =  }, current cache count: 1
23:44:59 info: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE SIZE PROVIDED: Using provided cache size for key DailyActions_Metadata: 77690 bytes
23:45:00 dbug: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE SET EXECUTE: About to call _staticCache.Set for key DailyActions_Metadata
23:45:00 dbug: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE SET EXECUTE: Completed _staticCache.Set for key DailyActions_Metadata
23:45:00 dbug: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE SET VERIFY: About to verify cache set for key DailyActions_Metadata
23:45:00 dbug: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE COUNT CHANGE: Before: 1, After: 2, Difference: 1
23:45:00 dbug: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE SET VERIFY: Successfully verified cache set for key DailyActions_Metadata, value type: DailyActionMetadataDto, same reference: True
23:45:00 info: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE SET COMPLETE: Cached value with key: DailyActions_Metadata, size: 77690 bytes
23:45:00 dbug: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE STATS after set: TotalHits=0, TotalMisses=2, CacheCount=2
23:45:00 info: PPrePorter.DailyActionsDB.Services.DailyActionsService[0]
      Cached daily actions metadata with high priority, cache key: DailyActions_Metadata, estimated size: 77690 bytes
23:45:00 info: PPrePorter.DailyActionsDB.Services.DailyActionsService[0]
      Prewarmed metadata cache with 272 white labels, 179 countries, 14 currencies in 19901.8112ms
23:45:00 info: PPrePorter.DailyActionsDB.Services.DailyActionsService[0]
      Prewarming summary metrics for date range 2025-05-09 to 2025-05-10
23:45:00 dbug: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE TRY GET: Attempting to get value from cache with key: DailyActions_Summary_20250509_20250510_all, type: DailyActionsSummary
23:45:00 dbug: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE RAW MISS: No value found in cache with key: DailyActions_Summary_20250509_20250510_all
23:45:00 warn: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE MISS: Failed to retrieve value from cache with key: DailyActions_Summary_20250509_20250510_all
23:45:00 warn: PPrePorter.DailyActionsDB.Services.DailyActionsService[0]
      CACHE MISS: Calculating summary metrics for date range 05/09/2025 00:00:00 to 05/10/2025 00:00:00 and white label (null), cache key: DailyActions_Summary_20250509_20250510_all
23:45:00 dbug: PPrePorter.DailyActionsDB.Services.DailyActionsService[0]
      CACHE CHECK: Checking cache for daily actions with key: DailyActions_Data_20250509_20250510_all
23:45:00 dbug: PPrePorter.DailyActionsDB.Services.DailyActionsService[0]
      CACHE STATS before retrieval: TotalHits=0, TotalMisses=3, CacheCount=2
23:45:00 dbug: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE TRY GET: Attempting to get value from cache with key: DailyActions_Data_20250509_20250510_all, type: IEnumerable`1
23:45:00 dbug: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE RAW MISS: No value found in cache with key: DailyActions_Data_20250509_20250510_all
23:45:00 warn: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE MISS: Failed to retrieve value from cache with key: DailyActions_Data_20250509_20250510_all
23:45:00 dbug: PPrePorter.DailyActionsDB.Services.DailyActionsService[0]
      CACHE RESULT: TryGetValue returned False for key DailyActions_Data_20250509_20250510_all
23:45:00 warn: PPrePorter.DailyActionsDB.Services.DailyActionsService[0]
      CACHE MISS: Getting daily actions from database for date range 05/09/2025 00:00:00 to 05/10/2025 00:00:00 and white label (null), cache key: DailyActions_Data_20250509_20250510_all
23:45:00 info: PPrePorter.DailyActionsDB.Services.DailyActionsService[0]
      Setting max records limit to 1000 for date range spanning 2 days
23:45:00 info: Microsoft.EntityFrameworkCore.Database.Command[20101]
      Executed DbCommand (365ms) [Parameters=[@__p_2='?' (DbType = Int32), @__start_0='?' (DbType = DateTime2), @__end_1='?' (DbType = DateTime2)], CommandType='Text', CommandTimeout='60']
      -- WITH (NOLOCK)

      SELECT TOP(@__p_2) [t].[ID], [t].[Adjustments], [t].[AdjustmentsAdd], [t].[AdministrativeFee], [t].[AdministrativeFeeReturn], [t].[AppBets], [t].[AppBetsCasino], [t].[AppBetsSport], [t].[AppRefunds], [t].[AppRefundsCasino], [t].[AppRefundsSport], [t].[AppWins], [t].[AppWinsCasino], [t].[AppWinsSport], [t].[BankRoll], [t].[BetsBingo], [t].[BetsBingoBonus], [t].[BetsBingoReal], [t].[BetsBonus], [t].[BetsCasino], [t].[BetsCasinoBonus], [t].[BetsCasinoReal], [t].[BetsLive], [t].[BetsLiveBonus], [t].[BetsLiveReal], [t].[BetsReal], [t].[BetsSport], [t].[BetsSportBonus], [t].[BetsSportReal], [t].[BonusConverted], [t].[Bonuses], [t].[BonusesBingo], [t].[BonusesLive], [t].[BonusesSport], [t].[CashoutRequests], [t].[Chargebacks], [t].[ClearedBalance], [t].[ClubPointsConversion], [t].[CollectedBonuses], [t].[Date], [t].[Deposits], [t].[DepositsBingo], [t].[DepositsCreditCard], [t].[DepositsFee], [t].[DepositsLive], [t].[DepositsMoneyBookers], [t].[DepositsNeteller], [t].[DepositsOther], [t].[DepositsSport], [t].[EUR2GBP], [t].[ExpiredBonuses], [t].[FTD], [t].[FTDA], [t].[InsuranceContribution], [t].[JackpotContribution], [t].[LottoAdvancedBets], [t].[LottoAdvancedWins], [t].[LottoBets], [t].[LottoWins], [t].[PaidCashouts], [t].[PlayerID], [t].[RefundsBingo], [t].[RefundsBingoBonus], [t].[RefundsBingoReal], [t].[RefundsBonus], [t].[RefundsCasino], [t].[RefundsCasinoBonus], [t].[RefundsCasinoReal], [t].[RefundsLive], [t].[RefundsLiveBonus], [t].[RefundsLiveReal], [t].[RefundsReal], [t].[RefundsSport], [t].[RefundsSportBonus], [t].[RefundsSportReal], [t].[Registration], [t].[RevenueAdjustments], [t].[RevenueAdjustmentsAdd], [t].[ReverseChargebacks], [t].[SideGamesBets], [t].[SideGamesCasualGamesBets], [t].[SideGamesCasualGamesWins], [t].[SideGamesFeaturedBets], [t].[SideGamesFeaturedWins], [t].[SideGamesJackpotsBets], [t].[SideGamesJackpotsWins], [t].[SideGamesRefunds], [t].[SideGamesSlotsBets], [t].[SideGamesSlotsWins], [t].[SideGamesTableGamesBets], [t].[SideGamesTableGamesWins], [t].[SideGamesWins], [t].[UpdatedDate], [t].[Voids], [t].[WhiteLabelID], [t].[WhiteLabelId], [t].[WinsBingo], [t].[WinsBingoBonus], [t].[WinsBingoReal], [t].[WinsBonus], [t].[WinsCasino], [t].[WinsCasinoBonus], [t].[WinsCasinoReal], [t].[WinsLive], [t].[WinsLiveBonus], [t].[WinsLiveReal], [t].[WinsReal], [t].[WinsSport], [t].[WinsSportBonus], [t].[WinsSportReal]
      FROM [common].[tbl_Daily_actions] AS [t]
      WHERE [t].[Date] >= @__start_0 AND [t].[Date] <= @__end_1
      ORDER BY [t].[Date], [t].[WhiteLabelID]
23:45:03 info: PPrePorter.DailyActionsDB.Services.DailyActionsService[0]
      Retrieved 1000 daily actions from database for date range 05/09/2025 00:00:00 to 05/10/2025 00:00:00 and white label (null)
23:45:03 info: PPrePorter.DailyActionsDB.Services.DailyActionsService[0]
      First DailyAction item has 114 properties, ID: 21158317, Date: 05/09/2025 00:00:00
23:45:03 info: PPrePorter.DailyActionsDB.Services.DailyActionsService[0]
      Setting cache entry with size: 1000000 bytes for 1000 items (average 1000 bytes per item)
23:45:03 dbug: PPrePorter.DailyActionsDB.Services.DailyActionsService[0]
      CACHE SET: About to set cache with key DailyActions_Data_20250509_20250510_all, value type List`1, value count 1000, options { Priority = High, Size = 1000000, SlidingExpiration = 00:30:00, AbsoluteExpiration =  }
23:45:03 dbug: PPrePorter.DailyActionsDB.Services.DailyActionsService[0]
      CACHE SET DETAILS: Setting cache with key DailyActions_Data_20250509_20250510_all, value type List`1, value count 1000, first item ID 21158317
23:45:03 dbug: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE SET START: Setting value in cache with key: DailyActions_Data_20250509_20250510_all, type: List`1, options: { Priority = High, Size = 1000000, SlidingExpiration = 00:30:00, AbsoluteExpiration =  }, current cache count: 2
23:45:03 info: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE SIZE PROVIDED: Using provided cache size for key DailyActions_Data_20250509_20250510_all: 1000000 bytes
23:45:04 info: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE COLLECTION: Caching collection with 1000 items for key DailyActions_Data_20250509_20250510_all, total size: 1000000 bytes, avg size per item: 1000 bytes, First item type: DailyAction
23:45:04 dbug: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE SET EXECUTE: About to call _staticCache.Set for key DailyActions_Data_20250509_20250510_all
23:45:04 dbug: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE SET EXECUTE: Completed _staticCache.Set for key DailyActions_Data_20250509_20250510_all
23:45:04 dbug: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE SET VERIFY: About to verify cache set for key DailyActions_Data_20250509_20250510_all
23:45:04 dbug: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE COUNT CHANGE: Before: 2, After: 3, Difference: 1
23:45:04 dbug: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE SET VERIFY: Successfully verified cache set for key DailyActions_Data_20250509_20250510_all, value type: List`1, same reference: True
23:45:04 dbug: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE SET VERIFY COLLECTION: Original count: 1000, Verified count: 1000, Same count: True
23:45:04 info: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE SET COMPLETE: Cached value with key: DailyActions_Data_20250509_20250510_all, size: 1000000 bytes
23:45:04 dbug: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE STATS after set: TotalHits=0, TotalMisses=4, CacheCount=3
23:45:04 dbug: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE TRY GET: Attempting to get value from cache with key: DailyActions_Data_20250509_20250510_all, type: IEnumerable`1
23:45:04 dbug: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE RAW HIT: Found value in cache with key: DailyActions_Data_20250509_20250510_all, value type: List`1, is T: True
23:45:04 info: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE HIT: Retrieved value from cache with key: DailyActions_Data_20250509_20250510_all, value type: List`1, Count: 1000, First item type: DailyAction
23:45:04 dbug: PPrePorter.DailyActionsDB.Services.DailyActionsService[0]
      CACHE VERIFY SUCCESS: After Set, TryGetValue returned True for key DailyActions_Data_20250509_20250510_all, result is not null with count 1000, first item ID 21158317
23:45:04 dbug: PPrePorter.DailyActionsDB.Services.DailyActionsService[0]
      CACHE VERIFY DETAILS: Same count: True, Same first ID: True
23:45:04 info: PPrePorter.DailyActionsDB.Services.DailyActionsService[0]
      Cached daily actions for date range 05/09/2025 00:00:00 to 05/10/2025 00:00:00 and white label (null), cache key: DailyActions_Data_20250509_20250510_all, estimated size: 1000000 bytes
23:45:04 dbug: PPrePorter.DailyActionsDB.Services.DailyActionsService[0]
      CACHE STATS after set: TotalHits=1, TotalMisses=4, CacheCount=3
23:45:04 dbug: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE SET START: Setting value in cache with key: DailyActions_Summary_20250509_20250510_all, type: DailyActionsSummary, options: { Priority = High, Size = 1000, SlidingExpiration = 00:30:00, AbsoluteExpiration =  }, current cache count: 3
23:45:04 info: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE SIZE PROVIDED: Using provided cache size for key DailyActions_Summary_20250509_20250510_all: 1000 bytes
23:45:04 dbug: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE SET EXECUTE: About to call _staticCache.Set for key DailyActions_Summary_20250509_20250510_all
23:45:04 dbug: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE SET EXECUTE: Completed _staticCache.Set for key DailyActions_Summary_20250509_20250510_all
23:45:04 dbug: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE SET VERIFY: About to verify cache set for key DailyActions_Summary_20250509_20250510_all
23:45:04 dbug: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE COUNT CHANGE: Before: 3, After: 4, Difference: 1
23:45:04 dbug: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE SET VERIFY: Successfully verified cache set for key DailyActions_Summary_20250509_20250510_all, value type: DailyActionsSummary, same reference: True
23:45:04 info: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE SET COMPLETE: Cached value with key: DailyActions_Summary_20250509_20250510_all, size: 1000 bytes
23:45:04 dbug: PPrePorter.Core.Services.GlobalCacheService[0]
      CACHE STATS after set: TotalHits=1, TotalMisses=4, CacheCount=4
23:45:04 info: PPrePorter.DailyActionsDB.Services.DailyActionsService[0]
      Cached summary metrics for date range 05/09/2025 00:00:00 to 05/10/2025 00:00:00 and white label (null), cache key: DailyActions_Summary_20250509_20250510_all, estimated size: 1000 bytes
23:45:04 info: PPrePorter.DailyActionsDB.Services.DailyActionsService[0]
      Prewarmed yesterday's summary metrics cache in 4020.0168ms
23:45:04 info: PPrePorter.DailyActionsDB.Services.DailyActionsService[0]
      Cache prewarming completed successfully. Total items in cache: 4
23:45:04 info: Program[0]
      Cache statistics after prewarming: [TotalHits, 1], [TotalMisses, 4], [HitRatio, 0.2], [CacheCount, 4], [TopHits, System.Collections.Generic.Dictionary`2[System.String,System.Int32]], [TopMisses, System.Collections.Generic.Dictionary`2[System.String,System.Int32]]
23:45:04 warn: PPrePorter.Core.Services.GlobalCacheService[0]
      Could not retrieve cache keys using reflection, using cache hits/misses keys as proxy
23:45:04 info: Program[0]
      Total cache keys: 4, DailyActions cache keys: 3
CACHE INITIALIZED SUCCESSFULLY WITH 4 KEYS
=== CACHE INITIALIZATION COMPLETE ===
