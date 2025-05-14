# NOLOCK Implementation Guide

This document explains how NOLOCK hints are implemented in the PPrePorter.DailyActionsDB project to optimize database query performance.

## Overview

NOLOCK hints (equivalent to READ UNCOMMITTED isolation level) are used to improve query performance by allowing queries to read data that is being modified by other transactions without waiting for locks to be released. This can significantly improve performance in read-heavy scenarios, but it comes with the risk of reading uncommitted data (dirty reads).

## Implementation Approaches

We've implemented multiple approaches to ensure NOLOCK hints are applied to all database queries:

### 1. IsolationLevelInterceptor

The `IsolationLevelInterceptor` is a `DbCommandInterceptor` that applies the READ UNCOMMITTED isolation level to all database commands. This is the most comprehensive approach as it works at the command level and applies to all queries.

```csharp
public class IsolationLevelInterceptor : DbCommandInterceptor
{
    private readonly IsolationLevel _isolationLevel;
    private readonly ILogger<IsolationLevelInterceptor>? _logger;

    public IsolationLevelInterceptor(IsolationLevel isolationLevel, ILogger<IsolationLevelInterceptor>? logger = null)
    {
        _isolationLevel = isolationLevel;
        _logger = logger;
    }

    public override InterceptionResult<DbDataReader> ReaderExecuting(
        DbCommand command,
        CommandEventData eventData,
        InterceptionResult<DbDataReader> result)
    {
        SetTransaction(command);
        return result;
    }

    // Other interceptor methods...

    private void SetTransaction(DbCommand command)
    {
        if (command == null)
        {
            return;
        }

        try
        {
            // Only set the transaction if one doesn't already exist
            if (command.Transaction == null)
            {
                // Ensure the connection is open
                var connection = command.Connection;
                if (connection != null)
                {
                    if (connection.State != ConnectionState.Open)
                    {
                        connection.Open();
                    }

                    // Begin a transaction with the specified isolation level
                    var transaction = connection.BeginTransaction(_isolationLevel);
                    command.Transaction = transaction;
                }
            }
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex, "Error setting transaction isolation level to {IsolationLevel}", _isolationLevel);
        }
    }
}
```

### 2. Global Registration in DbContext

The interceptor is registered globally in the static constructor of the `DailyActionsDbContext`:

```csharp
static DailyActionsDbContext()
{
    // Register the IsolationLevelInterceptor globally to apply READ UNCOMMITTED isolation level to all queries
    DbInterception.Add(new IsolationLevelInterceptor(IsolationLevel.ReadUncommitted));
}
```

### 3. Registration in Service Configuration

The interceptor is also registered in the `DailyActionsServiceRegistration` class:

```csharp
services.AddDbContextPool<DailyActionsDbContext>(options =>
{
    // Other options...

    // Add the IsolationLevelInterceptor to apply READ UNCOMMITTED isolation level to all queries
    options.AddInterceptors(new IsolationLevelInterceptor(
        IsolationLevel.ReadUncommitted,
        serviceProvider.GetService<ILogger<IsolationLevelInterceptor>>()));
});
```

### 4. Extension Methods for Explicit Usage

We also provide extension methods for explicit usage:

```csharp
// Apply NOLOCK hint to a query
var query = _dbContext.DailyActions
    .AsNoTracking()
    .WithSqlNoLock()
    .Where(da => da.Date >= start && da.Date <= end);

// Execute a query with NOLOCK hint
var results = await query.ToListWithSqlNoLock();
```

## Best Practices

1. **Use AsNoTracking**: Always use `AsNoTracking()` for read-only queries to improve performance.
2. **Use WithSqlNoLock**: Use `WithSqlNoLock()` to explicitly add NOLOCK hints to queries.
3. **Use ToListWithSqlNoLock**: Use `ToListWithSqlNoLock()` to execute queries with NOLOCK hints.
4. **Be Aware of Dirty Reads**: Remember that NOLOCK hints can lead to dirty reads (reading uncommitted data), so use them only for queries where this is acceptable.

## Troubleshooting

If you encounter issues with the NOLOCK implementation:

1. Check if the interceptor is registered correctly.
2. Verify that the connection is open before setting the transaction.
3. Look for any exceptions in the logs related to setting the transaction isolation level.
4. Consider using explicit NOLOCK hints with the extension methods if the interceptor approach is not working.

## References

- [SQL Server NOLOCK Hint](https://docs.microsoft.com/en-us/sql/t-sql/queries/hints-transact-sql-table?view=sql-server-ver15#nolock)
- [Entity Framework Core Interceptors](https://docs.microsoft.com/en-us/ef/core/logging-events-diagnostics/interceptors)
- [Transaction Isolation Levels](https://docs.microsoft.com/en-us/dotnet/api/system.data.isolationlevel?view=net-6.0)
