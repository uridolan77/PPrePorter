# Cache and Query Performance Improvements

This document outlines the improvements made to the caching and query performance in the PPrePorter application.

## 1. Background Cache Prewarming

The cache prewarming process has been moved to a background service that runs after the application starts. This allows the application to start faster and prewarm the cache in the background.

### Key Changes:

- Created `CachePrewarmingService.cs` that runs in the background after the application starts
- Added a controller to check cache status and manually trigger prewarming
- Updated the Swagger UI to show the cache prewarming status

### How to Use:

- The cache status is displayed in the top-right corner of the Swagger UI
- The status indicator shows:
  - Yellow: Cache is being prewarmed
  - Green: Cache is ready
  - Red: Cache prewarming failed
- You can manually trigger cache prewarming by calling the `/api/CacheStatus/prewarm` endpoint

## 2. Proper NOLOCK Hints for SQL Queries

The application now adds proper NOLOCK hints to all SQL queries using the `NoLockInterceptor`. This improves query performance by reducing blocking.

### Key Changes:

- Verified that the `NoLockInterceptor` adds proper NOLOCK hints to all queries
- Created a script to add NOLOCK hints to stored procedures

### How to Use:

- The NOLOCK hints are automatically added to all queries
- You can run the `Scripts/AddNoLockHintsToStoredProcedures.sql` script to add NOLOCK hints to stored procedures

## 3. Lookup Tables for Enum Values

The application now uses dedicated lookup tables for enum values instead of using DISTINCT queries on the players table. This improves query performance by reducing the need for expensive DISTINCT operations.

### Key Changes:

- Created model classes for lookup tables:
  - Gender
  - Status
  - RegistrationPlayMode
  - Language
  - Platform
  - Tracker
- Updated the DbContext to include these lookup tables
- Created a script to create and populate the lookup tables

### How to Use:

- Run the `Scripts/CreateLookupTables.sql` script to create and populate the lookup tables
- The application will automatically use these lookup tables instead of DISTINCT queries

## 4. Swagger UI Cache Status Indicator

The Swagger UI now shows the cache prewarming status in the top-right corner. This allows you to see when the cache is ready to use.

### Key Changes:

- Created a custom JavaScript file to add a cache status indicator to Swagger UI
- Updated the Swagger UI configuration to include this file

### How to Use:

- The cache status is displayed in the top-right corner of the Swagger UI
- The status indicator shows:
  - Yellow: Cache is being prewarmed
  - Green: Cache is ready
  - Red: Cache prewarming failed
- Hover over the indicator to see more details about the cache

## Implementation Details

### CachePrewarmingService

The `CachePrewarmingService` is a background service that runs after the application starts. It prewarms the cache by calling the `PrewarmCacheAsync` method on the `IDailyActionsService`.

```csharp
public class CachePrewarmingService : BackgroundService
{
    // ...

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            // Wait for 5 seconds to allow the application to start up
            await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);

            // Prewarm the cache
            await PrewarmCacheAsync(stoppingToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing cache prewarming service");
        }
    }

    // ...
}
```

### NoLockInterceptor

The `NoLockInterceptor` adds NOLOCK hints to all SQL queries using regular expressions. It handles various SQL constructs like FROM, JOIN, INNER JOIN, LEFT JOIN, and RIGHT JOIN.

```csharp
private void ApplyNoLockHint(DbCommand command)
{
    // Only apply to SELECT statements
    if (command.CommandText.TrimStart().StartsWith("SELECT", System.StringComparison.OrdinalIgnoreCase))
    {
        // ...

        // Match FROM clause with table name in brackets
        var regex = new System.Text.RegularExpressions.Regex(@"FROM\s+\[([^\]]+)\](?!\s+WITH\s*\(NOLOCK\))");
        command.CommandText = regex.Replace(command.CommandText, "FROM [$1] WITH (NOLOCK)");

        // ...
    }
}
```

### Lookup Tables

The lookup tables are defined as entity classes that inherit from `LookupBase`. They are configured in the `DailyActionsDbContext` and populated using the `CreateLookupTables.sql` script.

```csharp
public abstract class LookupBase
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [StringLength(50)]
    public string Code { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }

    public bool IsActive { get; set; } = true;

    public int DisplayOrder { get; set; } = 0;
}
```

### Swagger UI Cache Status Indicator

The cache status indicator is implemented using a custom JavaScript file that checks the cache status using the `/api/CacheStatus` endpoint. It updates the indicator based on the response.

```javascript
function checkCacheStatus() {
    // Get the status indicator and text
    const statusIndicator = document.getElementById('cache-status-indicator');
    const statusText = document.getElementById('cache-status-text');
    
    // Make a request to the cache status endpoint
    fetch('/api/CacheStatus')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to get cache status');
            }
            return response.json();
        })
        .then(data => {
            // Update the status indicator and text based on the response
            if (data.isPrewarmed) {
                statusIndicator.style.backgroundColor = '#4caf50'; // Green for ready
                statusText.textContent = `Cache: Ready (${data.totalCacheItems} items)`;
                
                // Add tooltip with more details
                const container = document.getElementById('cache-status-container');
                container.title = `Cache Hit Ratio: ${(data.cacheHitRatio * 100).toFixed(2)}%\nTotal Hits: ${data.totalHits}\nTotal Misses: ${data.totalMisses}\nDailyActions Items: ${data.dailyActionsCacheItems}`;
            } else {
                statusIndicator.style.backgroundColor = '#ffcc00'; // Yellow for loading
                statusText.textContent = 'Cache: Prewarming...';
                
                // Check again in 2 seconds
                setTimeout(checkCacheStatus, 2000);
            }
        })
        .catch(error => {
            console.error('Error checking cache status:', error);
            statusIndicator.style.backgroundColor = '#f44336'; // Red for error
            statusText.textContent = 'Cache: Error';
            
            // Try again in 5 seconds
            setTimeout(checkCacheStatus, 5000);
        });
}
```
