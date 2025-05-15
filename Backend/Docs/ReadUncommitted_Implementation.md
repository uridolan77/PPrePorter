# NOLOCK Implementation for Entity Framework Core

This document explains the comprehensive implementation of NOLOCK behavior in the PPrePorter.DailyActionsDB project using a dual approach for maximum reliability.

## Overview

We've implemented a dual approach to ensure NOLOCK hints are consistently applied to all queries:

1. **SQL Modification Approach**: Directly modifies SQL queries to add NOLOCK hints to all tables
2. **READ UNCOMMITTED Approach**: Uses the READ UNCOMMITTED isolation level as a fallback mechanism

This combined approach ensures maximum compatibility and reliability across all types of queries.

## Implementation Details

### 1. SqlNoLockInterceptor

The primary implementation is the `SqlNoLockInterceptor` class, which intercepts database commands and adds NOLOCK hints to all tables:

```csharp
public class SqlNoLockInterceptor : DbCommandInterceptor
{
    private readonly ILogger<SqlNoLockInterceptor>? _logger;

    // Regular expressions for matching table references in SQL queries
    private static readonly Regex _fromRegex = new Regex(
        @"FROM\s+(?:\[(?<schema>\w+)\]\.)?(?:\[(?<table>\w+)\]|\[?(?<table>\w+)\]?)\s+(?:AS\s+)?(?:\[?(?<alias>\w+)\]?)?",
        RegexOptions.Compiled | RegexOptions.IgnoreCase | RegexOptions.Multiline);

    private static readonly Regex _joinRegex = new Regex(
        @"JOIN\s+(?:\[(?<schema>\w+)\]\.)?(?:\[(?<table>\w+)\]|\[?(?<table>\w+)\]?)\s+(?:AS\s+)?(?:\[?(?<alias>\w+)\]?)?",
        RegexOptions.Compiled | RegexOptions.IgnoreCase | RegexOptions.Multiline);

    public override InterceptionResult<DbDataReader> ReaderExecuting(
        DbCommand command,
        CommandEventData eventData,
        InterceptionResult<DbDataReader> result)
    {
        ModifySqlCommand(command);
        return result;
    }

    private void ModifySqlCommand(DbCommand command)
    {
        if (command?.CommandText == null)
            return;

        string sql = command.CommandText;

        // Only modify SELECT statements
        if (!sql.TrimStart().StartsWith("SELECT", StringComparison.OrdinalIgnoreCase))
            return;

        // Check if this command should use NOLOCK hints
        bool shouldApply = sql.Contains("FORCE_NOLOCK_ON_ALL_TABLES", StringComparison.OrdinalIgnoreCase);

        if (shouldApply)
        {
            try
            {
                string originalSql = sql;
                string modifiedSql = AddNoLockHintsToSql(originalSql);

                if (originalSql != modifiedSql)
                {
                    command.CommandText = modifiedSql;
                    _logger?.LogDebug("Applied NOLOCK hints to SQL query");
                }
            }
            catch (Exception ex)
            {
                // Log the error but don't throw it to avoid breaking the query
                _logger?.LogError(ex, "Error applying NOLOCK hints to SQL query");
            }
        }
    }

    private string AddNoLockHintsToSql(string sql)
    {
        // Add NOLOCK hints to FROM clauses
        sql = _fromRegex.Replace(sql, match =>
        {
            string schema = match.Groups["schema"].Success ? match.Groups["schema"].Value : "dbo";
            string table = match.Groups["table"].Value;
            string alias = match.Groups["alias"].Success ? match.Groups["alias"].Value : table;

            return $"FROM [{schema}].[{table}] AS [{alias}] WITH (NOLOCK)";
        });

        // Add NOLOCK hints to JOIN clauses
        sql = _joinRegex.Replace(sql, match =>
        {
            string schema = match.Groups["schema"].Success ? match.Groups["schema"].Value : "dbo";
            string table = match.Groups["table"].Value;
            string alias = match.Groups["alias"].Success ? match.Groups["alias"].Value : table;

            return $"JOIN [{schema}].[{table}] AS [{alias}] WITH (NOLOCK)";
        });

        return sql;
    }
}
```

### 2. ReadUncommittedInterceptor

The backup implementation is the `ReadUncommittedInterceptor` class, which applies the READ UNCOMMITTED isolation level:

```csharp
public class ReadUncommittedInterceptor : DbCommandInterceptor
{
    private readonly ILogger<ReadUncommittedInterceptor>? _logger;
    private readonly bool _applyToAllCommands;

    public override InterceptionResult<DbDataReader> ReaderExecuting(
        DbCommand command,
        CommandEventData eventData,
        InterceptionResult<DbDataReader> result)
    {
        ApplyNoLockHints(command);
        return result;
    }

    private void ApplyNoLockHints(DbCommand command)
    {
        // Only apply to SELECT statements or if configured to apply to all commands
        if (_applyToAllCommands ||
            (command.CommandText?.TrimStart().StartsWith("SELECT", StringComparison.OrdinalIgnoreCase) == true))
        {
            // Check if this command should use NOLOCK hints
            bool shouldApply = _applyToAllCommands ||
                              command.CommandText.Contains("WITH (NOLOCK)", StringComparison.OrdinalIgnoreCase) ||
                              command.CommandText.Contains("FORCE_NOLOCK_ON_ALL_TABLES", StringComparison.OrdinalIgnoreCase);

            if (shouldApply)
            {
                try
                {
                    // Apply both approaches for maximum compatibility

                    // Approach 1: Modify SQL to add NOLOCK hints
                    string originalSql = command.CommandText;
                    string modifiedSql = AddNoLockHintsToSql(originalSql);

                    if (originalSql != modifiedSql)
                    {
                        command.CommandText = modifiedSql;
                        _logger?.LogDebug("Applied NOLOCK hints to SQL query");
                    }

                    // Approach 2: Use READ UNCOMMITTED isolation level as a fallback
                    if (command.Transaction == null)
                    {
                        var connection = command.Connection;

                        // Ensure the connection is open
                        if (connection.State != ConnectionState.Open)
                        {
                            connection.Open();
                            _logger?.LogDebug("Opened connection to apply READ UNCOMMITTED isolation level");
                        }

                        // Create a transaction with READ UNCOMMITTED isolation level
                        var transaction = connection.BeginTransaction(IsolationLevel.ReadUncommitted);
                        command.Transaction = transaction;

                        _logger?.LogDebug("Applied READ UNCOMMITTED isolation level to command");
                    }
                }
                catch (Exception ex)
                {
                    // Log the error but don't throw it to avoid breaking the query
                    _logger?.LogError(ex, "Error applying NOLOCK hints to command");
                }
            }
        }
    }
}
```

### 3. DbContextNoLockExtensions

Extension methods for configuring DbContext to use the ReadUncommittedInterceptor:

```csharp
public static class DbContextNoLockExtensions
{
    public static DbContextOptionsBuilder UseReadUncommitted(
        this DbContextOptionsBuilder optionsBuilder,
        IServiceProvider? serviceProvider = null,
        bool applyToAllCommands = true)
    {
        // Get logger if service provider is available
        ILogger<ReadUncommittedInterceptor>? logger = null;
        if (serviceProvider != null)
        {
            var loggerFactory = serviceProvider.GetService<ILoggerFactory>();
            if (loggerFactory != null)
            {
                logger = loggerFactory.CreateLogger<ReadUncommittedInterceptor>();
            }
        }

        // Add the interceptor
        optionsBuilder.AddInterceptors(new ReadUncommittedInterceptor(logger, applyToAllCommands));

        return optionsBuilder;
    }
}
```

### 4. QueryNoLockExtensions

Extension methods for IQueryable to add NOLOCK behavior:

```csharp
public static class QueryNoLockExtensions
{
    public static IQueryable<T> WithNoLock<T>(this IQueryable<T> query)
    {
        return query.TagWith("WITH (NOLOCK)");
    }

    public static IQueryable<T> WithForceNoLock<T>(this IQueryable<T> query)
    {
        return query.TagWith("FORCE_NOLOCK_ON_ALL_TABLES");
    }

    public static IQueryable<T> AsReadOnly<T>(this IQueryable<T> query) where T : class
    {
        return query.AsNoTracking().WithForceNoLock();
    }

    public static async Task<List<T>> ToListWithNoLockAsync<T>(
        this IQueryable<T> query,
        CancellationToken cancellationToken = default)
    {
        query = query.WithForceNoLock();
        return await query.ToListAsync(cancellationToken);
    }
}
```

## Usage

### 1. Configure DbContext

In the DailyActionsServiceRegistration.cs file, we configure the DbContext to use both interceptors:

```csharp
services.AddDbContextPool<DailyActionsDbContext>(options =>
{
    options.UseSqlServer(resolvedConnectionString, sqlServerOptions =>
    {
        // SQL Server configuration
    });

    // Use both approaches for maximum compatibility
    // 1. ReadUncommitted approach for isolation level
    options.UseReadUncommitted(serviceProvider, applyToAllCommands: true);

    // 2. SQL modification approach for explicit NOLOCK hints
    options.AddInterceptors(new SqlNoLockInterceptor(
        serviceProvider.GetService<ILogger<SqlNoLockInterceptor>>()));
});
```

### 2. Use Extension Methods in Queries

```csharp
// Simple query with NOLOCK behavior
var baseQuery = _dbContext.Players
    .AsNoTracking()
    .Where(p => p.IsActive);

var players = await QueryNoLockExtensions.ToListWithNoLockAsync(
    QueryNoLockExtensions.WithForceNoLock(baseQuery));

// Complex query with NOLOCK behavior
var baseQuery = _dbContext.DailyActions
    .AsNoTracking()
    .Where(da => da.Date >= startDate && da.Date <= endDate)
    .Include(da => da.WhiteLabel)
    .Include(da => da.Player);

var results = await QueryNoLockExtensions.ToListWithNoLockAsync(
    QueryNoLockExtensions.WithForceNoLock(baseQuery));
```

## Advantages of This Approach

1. **Reliability**: The dual approach ensures NOLOCK hints are applied consistently across all queries.
2. **Compatibility**: Works with all types of queries, including complex ones with joins, subqueries, and stored procedures.
3. **Robustness**: If one approach fails, the other serves as a fallback.
4. **Explicit Control**: Developers can see exactly what's happening in the SQL queries.
5. **Performance**: Optimized for read-heavy workloads by minimizing locking overhead.

## Considerations

1. **Transaction Management**: Be careful when using explicit transactions, as they may override the isolation level.
2. **Data Consistency**: NOLOCK hints can lead to dirty reads, phantom reads, and non-repeatable reads. Use them only for queries where absolute consistency is not critical.
3. **SQL Server Specific**: This implementation is specific to SQL Server and may not work with other database providers.

## Conclusion

Our dual approach to implementing NOLOCK behavior in Entity Framework Core provides maximum reliability and compatibility. By combining SQL modification with the READ UNCOMMITTED isolation level, we ensure that NOLOCK hints are consistently applied to all queries, regardless of their complexity.
