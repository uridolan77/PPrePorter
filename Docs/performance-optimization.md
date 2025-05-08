# Performance Optimization and Scalability

## Database Optimization Strategies

The ProgressPlay Reporting platform deals with large volumes of gaming data. Here are the key database optimization strategies implemented:

### 1. Index Strategy

Critical indexes are implemented to optimize query performance:

```sql
-- Example indexes for common reporting queries

-- Player search optimization
CREATE NONCLUSTERED INDEX [IX_Players_Search] ON [common].[tbl_Daily_actions_players]
(
    [CasinoID] ASC,
    [RegisteredDate] DESC,
    [Country] ASC
)
INCLUDE (
    [FirstName],
    [LastName],
    [Alias],
    [Email],
    [Status],
    [AffiliateID],
    [DynamicParameter]
)

-- Transaction search optimization
CREATE NONCLUSTERED INDEX [IX_Transactions_Search] ON [common].[tbl_Daily_actions_transactions]
(
    [PlayerID] ASC,
    [TransactionDate] DESC,
    [TransactionType] ASC,
    [Status] ASC
)
INCLUDE (
    [TransactionAmount],
    [CurrencyCode],
    [PaymentMethod]
)

-- Game activity optimization
CREATE NONCLUSTERED INDEX [IX_Game_Activity] ON [common].[tbl_Daily_actions_games]
(
    [GameID] ASC,
    [PlayerID] ASC,
    [GameDate] DESC
)
INCLUDE (
    [RealBetAmount],
    [RealWinAmount],
    [BonusBetAmount],
    [BonusWinAmount],
    [Platform]
)

-- Date-based reporting optimization
CREATE NONCLUSTERED INDEX [IX_Daily_actions_Date] ON [common].[tbl_Daily_actions]
(
    [Date] ASC,
    [WhiteLabelID] ASC,
    [PlayerID] ASC
)
```

### 2. Table Partitioning

For large transaction and activity tables:

```sql
-- Partition function for date-based partitioning
CREATE PARTITION FUNCTION [PF_Monthly](datetime) AS RANGE RIGHT FOR VALUES (
    '2023-01-01', '2023-02-01', '2023-03-01', /* ... continue monthly values ... */
    '2025-01-01', '2025-02-01', '2025-03-01', '2025-04-01', '2025-05-01'
)

-- Partition scheme
CREATE PARTITION SCHEME [PS_Monthly] AS PARTITION [PF_Monthly] 
TO (
    [FG_Archive_2023_01], [FG_Archive_2023_02], /* ... continue monthly filegroups ... */
    [FG_2025_01], [FG_2025_02], [FG_2025_03], [FG_2025_04], [FG_PRIMARY]
)

-- Apply partitioning to transactions table
ALTER TABLE [common].[tbl_Daily_actions_transactions] 
ADD CONSTRAINT [PK_tbl_Daily_actions_transactions] PRIMARY KEY CLUSTERED 
(
    [TransactionID] ASC,
    [TransactionDate]
)
ON [PS_Monthly]([TransactionDate])
```

### 3. Materialized Views

For frequently accessed report data:

```sql
-- Daily summary materialized view
CREATE VIEW [dbo].[mv_DailySummary]
WITH SCHEMABINDING
AS
SELECT
    CAST(da.Date AS DATE) AS ActivityDate,
    da.WhiteLabelID,
    COUNT_BIG(*) AS RowCount,
    COUNT(DISTINCT CASE WHEN da.Registration = 1 THEN da.PlayerID END) AS Registrations,
    COUNT(DISTINCT CASE WHEN da.FTD = 1 THEN da.PlayerID END) AS FTD,
    SUM(ISNULL(da.Deposits, 0)) AS TotalDeposits,
    SUM(ISNULL(da.PaidCashouts, 0)) AS TotalCashouts,
    SUM(ISNULL(da.BetsCasino, 0)) AS BetsCasino,
    SUM(ISNULL(da.WinsCasino, 0)) AS WinsCasino,
    SUM(ISNULL(da.BetsSport, 0)) AS BetsSport,
    SUM(ISNULL(da.WinsSport, 0)) AS WinsSport
FROM
    dbo.tbl_Daily_actions da
GROUP BY
    CAST(da.Date AS DATE),
    da.WhiteLabelID

-- Create unique clustered index on the view
CREATE UNIQUE CLUSTERED INDEX [IX_mv_DailySummary] ON [dbo].[mv_DailySummary]
(
    [ActivityDate] ASC,
    [WhiteLabelID] ASC
)
```

### 4. Query Optimization

All database queries are optimized for performance:

- Proper `JOIN` order to handle table size differences
- Selective column retrieval to minimize I/O
- Parameterization to avoid plan cache bloat
- Hints for specific query optimization scenarios

Example of an optimized query:

```sql
SELECT p.PlayerID, p.Alias, p.FirstName, p.LastName, wl.LabelName AS WhiteLabel
FROM common.tbl_Daily_actions_players p WITH (INDEX = IX_Players_Search)
INNER LOOP JOIN common.tbl_White_labels wl 
    ON p.CasinoID = wl.LabelID
WHERE p.CasinoID = @WhiteLabelId
  AND p.RegisteredDate >= @StartDate
  AND p.RegisteredDate <= @EndDate
  AND (@Country IS NULL OR p.Country = @Country)
OPTION (OPTIMIZE FOR (@WhiteLabelId UNKNOWN, @Country UNKNOWN))
```

## Caching Strategy

A multi-level caching approach is implemented:

### 1. Redis Distributed Cache

```csharp
// Caching service implementation
public class CachingService : ICachingService
{
    private readonly IDistributedCache _cache;
    private readonly ILogger<CachingService> _logger;
    
    public CachingService(IDistributedCache cache, ILogger<CachingService> logger)
    {
        _cache = cache;
        _logger = logger;
    }
    
    public async Task<T> GetOrCreateAsync<T>(
        string key, 
        Func<Task<T>> factory, 
        TimeSpan? slidingExpiration = null,
        TimeSpan? absoluteExpiration = null)
    {
        // Try to get from cache
        var cachedValue = await _cache.GetStringAsync(key);
        
        if (!string.IsNullOrEmpty(cachedValue))
        {
            try
            {
                return JsonSerializer.Deserialize<T>(cachedValue);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deserializing cached value for key {Key}", key);
            }
        }
        
        // Cache miss, execute factory
        var result = await factory();
        
        // Store in cache
        var options = new DistributedCacheEntryOptions();
        
        if (slidingExpiration.HasValue)
            options.SlidingExpiration = slidingExpiration.Value;
            
        if (absoluteExpiration.HasValue)
            options.AbsoluteExpirationRelativeToNow = absoluteExpiration.Value;
        
        await _cache.SetStringAsync(
            key, 
            JsonSerializer.Serialize(result),
            options);
            
        return result;
    }
    
    public async Task RemoveAsync(string key)
    {
        await _cache.RemoveAsync(key);
    }
    
    public async Task RemoveByPrefixAsync(string prefix)
    {
        // Note: This is a simplified implementation
        // In a production environment, you would use Redis SCAN with pattern matching
        // or maintain a secondary index of keys by prefix
        _logger.LogWarning("RemoveByPrefixAsync is a placeholder implementation");
    }
}
```

### 2. Cache Key Strategy

```csharp
// Report cache key generation
public static class CacheKeys
{
    // Cache key formats
    private const string DailySummaryFormat = "daily-summary:{0}:{1}:{2}";
    private const string PlayerSummaryFormat = "player-summary:{0}:{1}";
    private const string ReportCacheFormat = "report:{0}:{1}:{2}";
    
    // Cache key generation
    public static string GetDailySummaryKey(int whiteLabelId, DateTime startDate, DateTime endDate)
    {
        return string.Format(
            DailySummaryFormat,
            whiteLabelId,
            startDate.ToString("yyyyMMdd"),
            endDate.ToString("yyyyMMdd"));
    }
    
    public static string GetPlayerSummaryKey(int whiteLabelId, long playerId)
    {
        return string.Format(
            PlayerSummaryFormat,
            whiteLabelId,
            playerId);
    }
    
    public static string GetReportCacheKey(string reportType, string userId, string reportParams)
    {
        var hashedParams = GetHashString(reportParams);
        return string.Format(
            ReportCacheFormat,
            reportType,
            userId,
            hashedParams);
    }
    
    // Helper to generate a hash of report parameters
    private static string GetHashString(string text)
    {
        using (var sha = SHA256.Create())
        {
            var bytes = Encoding.UTF8.GetBytes(text);
            var hash = sha.ComputeHash(bytes);
            return BitConverter.ToString(hash).Replace("-", "");
        }
    }
}
```

### 3. Cache Invalidation Strategy

```csharp
// Cache invalidation example in a service
public class ReportingService : IReportingService
{
    private readonly IReportRepository _repository;
    private readonly ICachingService _cache;
    
    public ReportingService(IReportRepository repository, ICachingService cache)
    {
        _repository = repository;
        _cache = cache;
    }
    
    public async Task<ReportResult> GenerateReportAsync(ReportRequest request, string userId)
    {
        var cacheKey = CacheKeys.GetReportCacheKey(
            request.ReportType,
            userId,
            JsonSerializer.Serialize(request));
            
        return await _cache.GetOrCreateAsync(
            cacheKey,
            async () => await _repository.GenerateReportAsync(request),
            slidingExpiration: TimeSpan.FromMinutes(15),
            absoluteExpiration: TimeSpan.FromHours(1));
    }
    
    // Method that can trigger cache invalidation
    public async Task RefreshDataAsync(int whiteLabelId)
    {
        // Invalidate relevant caches
        await _cache.RemoveByPrefixAsync($"daily-summary:{whiteLabelId}");
        await _cache.RemoveByPrefixAsync($"player-summary:{whiteLabelId}");
        
        // Other cache invalidation as needed
    }
}
```

## Frontend Performance Optimizations

### 1. React Query for Data Fetching and Caching

```javascript
// src/hooks/useReports.js
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { reportService } from '../services/reportService';

export const useReports = () => {
  const queryClient = useQueryClient();
  
  // Get report data with caching
  const getReport = (reportType, params) => {
    return useQuery(
      ['reports', reportType, params],
      () => reportService.generateReport(reportType, params),
      {
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 30 * 60 * 1000, // 30 minutes
        keepPreviousData: true
      }
    );
  };
  
  // Save report configuration
  const saveReportConfig = useMutation(
    (config) => reportService.saveReportConfiguration(config),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('reportConfigurations');
      }
    }
  );
  
  // Get saved report configurations
  const getSavedConfigurations = useQuery(
    'reportConfigurations',
    reportService.getSavedConfigurations,
    {
      staleTime: 5 * 60 * 1000 // 5 minutes
    }
  );
  
  return {
    getReport,
    saveReportConfig,
    getSavedConfigurations
  };
};
```

### 2. Code Splitting and Lazy Loading

```javascript
// src/App.js (excerpt)
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoadingScreen from './components/LoadingScreen';

// Lazy loaded components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdvancedReport = lazy(() => import('./pages/reports/AdvancedReport'));
const PlayerDetails = lazy(() => import('./pages/players/PlayerDetails'));
const PlayerGames = lazy(() => import('./pages/players/PlayerGames'));
const PlayerSummary = lazy(() => import('./pages/players/PlayerSummary'));

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="reports/advanced" element={<AdvancedReport />} />
            <Route path="players/details" element={<PlayerDetails />} />
            <Route path="players/games" element={<PlayerGames />} />
            <Route path="players/summary" element={<PlayerSummary />} />
            {/* Other routes */}
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}
```

### 3. Virtual List for Large Data Sets

```javascript
// src/components/VirtualDataGrid.js
import React, { useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

const VirtualDataGrid = ({ data, columns, rowHeight = 48 }) => {
  const [sortBy, setSortBy] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };
  
  // Sort data if needed
  const sortedData = React.useMemo(() => {
    if (sortBy && data.length > 0) {
      return [...data].sort((a, b) => {
        if (a[sortBy] < b[sortBy]) {
          return sortDirection === 'asc' ? -1 : 1;
        }
        if (a[sortBy] > b[sortBy]) {
          return sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return data;
  }, [data, sortBy, sortDirection]);
  
  const Row = ({ index, style }) => {
    const row = sortedData[index];
    return (
      <TableRow 
        component="div" 
        style={style}
        hover
      >
        {columns.map((column) => (
          <TableCell 
            key={column.field} 
            component="div"
            style={{ width: column.width || 'auto' }}
          >
            {row[column.field]}
          </TableCell>
        ))}
      </TableRow>
    );
  };
  
  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Table component="div">
        <TableHead component="div">
          <TableRow component="div">
            {columns.map((column) => (
              <TableCell 
                key={column.field} 
                component="div"
                style={{ width: column.width || 'auto' }}
                onClick={() => handleSort(column.field)}
              >
                {column.headerName}
                {sortBy === column.field && (
                  <span>{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
      </Table>
      
      <div style={{ height: 'calc(100% - 56px)', width: '100%' }}>
        <AutoSizer>
          {({ height, width }) => (
            <List
              height={height}
              width={width}
              itemCount={sortedData.length}
              itemSize={rowHeight}
            >
              {Row}
            </List>
          )}
        </AutoSizer>
      </div>
    </div>
  );
};

export default VirtualDataGrid;
```

### 4. Memoization of Expensive Calculations

```javascript
// src/components/dashboard/RevenueChart.js
import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';

const RevenueChart = ({ data, filter, period }) => {
  // Expensive data transformation memoized
  const chartData = useMemo(() => {
    return transformDataForChart(data, filter, period);
  }, [data, filter, period]);
  
  return <Line data={chartData} options={chartOptions} />;
};

// Helper function to transform data
const transformDataForChart = (data, filter, period) => {
  // Complex data transformation...
  return transformedData;
};
```

## API Optimization

### 1. GraphQL for Flexible Data Fetching

```csharp
// GraphQL controller
[ApiController]
[Route("api/graphql")]
public class GraphQLController : ControllerBase
{
    private readonly IDocumentExecuter _documentExecuter;
    private readonly ISchema _schema;
    
    public GraphQLController(IDocumentExecuter documentExecuter, ISchema schema)
    {
        _documentExecuter = documentExecuter;
        _schema = schema;
    }
    
    [HttpPost]
    public async Task<IActionResult> Post([FromBody] GraphQLQuery query)
    {
        if (query == null)
        {
            return BadRequest("Query is null");
        }
        
        var inputs = query.Variables.ToInputs();
        
        var executionOptions = new ExecutionOptions
        {
            Schema = _schema,
            Query = query.Query,
            Inputs = inputs,
            UserContext = new GraphQLUserContext
            {
                User = User
            }
        };
        
        var result = await _documentExecuter.ExecuteAsync(executionOptions);
        
        if (result.Errors?.Count > 0)
        {
            return BadRequest(result);
        }
        
        return Ok(result);
    }
}

// GraphQL query example for flexible data fetching
/*
query {
  players(
    whiteLabelId: 1
    first: 10
    after: "cursor"
    filter: { registeredDateFrom: "2025-01-01" }
  ) {
    edges {
      node {
        id
        alias
        firstName
        lastName
        # Only request needed fields
        country
        registeredDate
        totalDeposits
        # Nested related data
        transactions(first: 5) {
          edges {
            node {
              id
              date
              amount
              type
            }
          }
        }
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
*/
```

### 2. API Response Compression

```csharp
// Startup.cs
public void ConfigureServices(IServiceCollection services)
{
    // Configure response compression
    services.AddResponseCompression(options =>
    {
        options.Providers.Add<BrotliCompressionProvider>();
        options.Providers.Add<GzipCompressionProvider>();
        options.EnableForHttps = true;
    });
    
    services.Configure<BrotliCompressionProviderOptions>(options =>
    {
        options.Level = CompressionLevel.Fastest;
    });
    
    services.Configure<GzipCompressionProviderOptions>(options =>
    {
        options.Level = CompressionLevel.Fastest;
    });
    
    // Other services configuration...
}

public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
{
    // Enable response compression
    app.UseResponseCompression();
    
    // Other middleware configuration...
}
```

### 3. Pagination and Filtering Optimization

```csharp
// Optimized pagination using keyset pagination
public async Task<PagedResult<T>> GetPagedResultsAsync<T>(
    IQueryable<T> query,
    string sortField,
    bool sortDescending,
    int pageSize,
    object lastSeenKey = null)
    where T : class
{
    // Apply sorting
    var orderedQuery = sortDescending
        ? query.OrderByDescending(e => EF.Property<object>(e, sortField))
        : query.OrderBy(e => EF.Property<object>(e, sortField));
    
    // Apply keyset pagination
    if (lastSeenKey != null)
    {
        var parameter = Expression.Parameter(typeof(T), "e");
        var property = Expression.Property(parameter, sortField);
        var constant = Expression.Constant(lastSeenKey);
        var comparison = sortDescending
            ? Expression.LessThan(property, constant)
            : Expression.GreaterThan(property, constant);
        var lambda = Expression.Lambda<Func<T, bool>>(comparison, parameter);
        
        orderedQuery = (IOrderedQueryable<T>)orderedQuery.Where(lambda);
    }
    
    // Get data
    var items = await orderedQuery.Take(pageSize + 1).ToListAsync();
    
    // Check if there are more items
    var hasMore = items.Count > pageSize;
    if (hasMore)
    {
        items.RemoveAt(items.Count - 1);
    }
    
    // Get new last seen key
    var newLastSeenKey = items.Any()
        ? EF.Property<object>(items.Last(), sortField)
        : null;
    
    return new PagedResult<T>
    {
        Items = items,
        HasMore = hasMore,
        LastSeenKey = newLastSeenKey
    };
}
```

## Background Processing

### 1. Report Generation Job

```csharp
// Background job for report generation
[DisallowConcurrentExecution]
public class ReportGenerationJob : IJob
{
    private readonly IReportService _reportService;
    private readonly INotificationService _notificationService;
    private readonly ILogger<ReportGenerationJob> _logger;
    
    public ReportGenerationJob(
        IReportService reportService,
        INotificationService notificationService,
        ILogger<ReportGenerationJob> logger)
    {
        _reportService = reportService;
        _notificationService = notificationService;
        _logger = logger;
    }
    
    public async Task Execute(IJobExecutionContext context)
    {
        try
        {
            var dataMap = context.MergedJobDataMap;
            var reportRequest = dataMap.Get("reportRequest") as ReportRequest;
            var userId = dataMap.GetString("userId");
            var notificationType = dataMap.GetString("notificationType");
            var notificationDestination = dataMap.GetString("notificationDestination");
            
            _logger.LogInformation(
                "Starting report generation job for user {UserId}, report type {ReportType}",
                userId,
                reportRequest.TemplateId);
            
            // Generate report
            var result = await _reportService.GenerateReportAsync(reportRequest, userId);
            
            // Export report
            var exportResult = await _reportService.ExportReportAsync(
                result.ReportId,
                "excel",
                new User { Id = userId });
            
            // Send notification
            await _notificationService.SendReportNotificationAsync(
                userId,
                result.ReportId,
                notificationType,
                notificationDestination,
                exportResult);
            
            _logger.LogInformation(
                "Completed report generation job for user {UserId}, report type {ReportType}",
                userId,
                reportRequest.TemplateId);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error executing report generation job");
            
            throw;
        }
    }
}
```

### 2. Data Aggregation Job

```csharp
// Background job for data aggregation
[DisallowConcurrentExecution]
public class DataAggregationJob : IJob
{
    private readonly IDataAggregationService _aggregationService;
    private readonly ILogger<DataAggregationJob> _logger;
    
    public DataAggregationJob(
        IDataAggregationService aggregationService,
        ILogger<DataAggregationJob> logger)
    {
        _aggregationService = aggregationService;
        _logger = logger;
    }
    
    public async Task Execute(IJobExecutionContext context)
    {
        try
        {
            var dataMap = context.MergedJobDataMap;
            var aggregationType = dataMap.GetString("aggregationType");
            var date = dataMap.Get("date") as DateTime? ?? DateTime.UtcNow.Date.AddDays(-1);
            
            _logger.LogInformation(
                "Starting data aggregation job for type {AggregationType}, date {Date}",
                aggregationType,
                date.ToString("yyyy-MM-dd"));
            
            switch (aggregationType)
            {
                case "DailySummary":
                    await _aggregationService.AggregateDailySummaryAsync(date);
                    break;
                    
                case "PlayerActivity":
                    await _aggregationService.AggregatePlayerActivityAsync(date);
                    break;
                    
                case "GamePerformance":
                    await _aggregationService.AggregateGamePerformanceAsync(date);
                    break;
                    
                default:
                    throw new ArgumentException($"Unknown aggregation type: {aggregationType}");
            }
            
            _logger.LogInformation(
                "Completed data aggregation job for type {AggregationType}, date {Date}",
                aggregationType,
                date.ToString("yyyy-MM-dd"));
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error executing data aggregation job");
            
            throw;
        }
    }
}
```

## Load Testing and Performance Monitoring

### 1. Load Testing Script

```csharp
// k6 load testing script (JavaScript)
/*
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users over 2 minutes
    { duration: '5m', target: 100 }, // Stay at 100 users for 5 minutes
    { duration: '2m', target: 200 }, // Ramp up to 200 users over 2 minutes
    { duration: '5m', target: 200 }, // Stay at 200 users for 5 minutes
    { duration: '2m', target: 0 },   // Ramp down to 0 users over 2 minutes
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete within 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% of requests can fail
  },
};

// Login and get token
function login() {
  const loginUrl = 'https://api.progressplay.com/api/auth/login';
  const payload = JSON.stringify({
    username: 'testuser',
    password: 'testpassword',
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const loginRes = http.post(loginUrl, payload, params);
  check(loginRes, {
    'Login successful': (r) => r.status === 200,
    'Has token': (r) => JSON.parse(r.body).accessToken !== undefined,
  });
  
  const token = JSON.parse(loginRes.body).accessToken;
  return token;
}

export default function() {
  const token = login();
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
  
  // Test dashboard endpoint
  const dashboardUrl = 'https://api.progressplay.com/api/dashboard';
  const dashboardRes = http.get(dashboardUrl, { headers });
  check(dashboardRes, {
    'Dashboard successful': (r) => r.status === 200,
  });
  
  // Test players endpoint
  const playersUrl = 'https://api.progressplay.com/api/players?pageNumber=1&pageSize=50';
  const playersRes = http.get(playersUrl, { headers });
  check(playersRes, {
    'Players successful': (r) => r.status === 200,
  });
  
  // Test report generation
  const reportUrl = 'https://api.progressplay.com/api/reports/generate';
  const reportPayload = JSON.stringify({
    templateId: 'player-summary',
    filters: [
      { field: 'registrationDate', operator: 'greaterOrEqual', value: '2025-01-01' }
    ],
    pageNumber: 1,
    pageSize: 50
  });
  
  const reportRes = http.post(reportUrl, reportPayload, { headers });
  check(reportRes, {
    'Report generation successful': (r) => r.status === 200,
  });
  
  sleep(1);
}
*/
```

### 2. Performance Monitoring Setup

```csharp
// Startup.cs
public void ConfigureServices(IServiceCollection services)
{
    // Add Application Insights telemetry
    services.AddApplicationInsightsTelemetry();
    
    // Add custom telemetry initializer
    services.AddSingleton<ITelemetryInitializer, RoleTelemetryInitializer>();
    
    // Add performance counters
    services.AddSingleton<ITelemetryInitializer, PerformanceCounterTelemetryInitializer>();
    
    // Other services configuration...
}

// Custom telemetry initializer
public class RoleTelemetryInitializer : ITelemetryInitializer
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    
    public RoleTelemetryInitializer(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }
    
    public void Initialize(ITelemetry telemetry)
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null) return;
        
        var user = httpContext.User;
        if (user?.Identity?.IsAuthenticated == true)
        {
            telemetry.Context.User.AuthenticatedUserId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            telemetry.Context.User.AccountId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            
            var roleClaim = user.FindFirstValue(ClaimTypes.Role);
            if (!string.IsNullOrEmpty(roleClaim))
            {
                telemetry.Context.GlobalProperties["UserRole"] = roleClaim;
            }
        }
        
        // Add custom dimensions
        if (telemetry is RequestTelemetry requestTelemetry)
        {
            // Track request specific properties
            var endpoint = httpContext.GetEndpoint()?.DisplayName;
            if (!string.IsNullOrEmpty(endpoint))
            {
                requestTelemetry.Properties["Endpoint"] = endpoint;
            }
        }
    }
}
```

## Scalability Planning

### 1. Horizontal Scaling Strategy

- **Frontend**: Static content delivered via CDN, application served from multiple regions
- **API Layer**: Stateless design for horizontal scaling, load balanced across multiple instances
- **Database Layer**: Read replicas for reporting queries, sharding by white label for write operations

### 2. Resource Scaling Thresholds

| Resource | Metric | Threshold | Action |
|----------|--------|-----------|--------|
| API Pods | CPU Utilization | >70% for 2 min | Scale out by 2 pods |
| API Pods | Memory Usage | >80% for 2 min | Scale out by 2 pods |
| Database | CPU Utilization | >60% for 5 min | Increase instance size |
| Database | Connection Count | >80% of max | Alert and investigate |
| Redis Cache | Memory Usage | >75% | Increase cache size |
| Redis Cache | CPU Usage | >50% | Increase cache instance size |

### 3. Load Distribution Strategy

- Use Azure Traffic Manager for geographic load distribution
- Implement priority-based routing for maintenance windows
- Leverage Azure Front Door for global HTTP load balancing
- Use Redis read replicas in each region for cached data
