# NOLOCK Implementation in PPrePorter

This document describes the implementation of NOLOCK hints in the PPrePorter application to optimize database query performance.

## Overview

NOLOCK hints are used in SQL Server to improve query performance by reducing locking overhead. When a NOLOCK hint is applied to a table, the query engine does not acquire shared locks on the table, which can significantly improve performance in read-heavy scenarios.

In PPrePorter, we've implemented a comprehensive solution to ensure that all database queries use NOLOCK hints consistently.

## Implementation Details

### 1. Extension Methods

We've created extension methods for IQueryable to make it easy to add NOLOCK hints to LINQ queries:

```csharp
// In PPrePorter.DailyActionsDB.Extensions.QueryableExtensions
public static IQueryable<T> WithNoLock<T>(this IQueryable<T> query) where T : class
{
    return query.TagWith("WITH (NOLOCK)");
}

public static IQueryable<T> WithForceNoLock<T>(this IQueryable<T> query) where T : class
{
    return query.TagWith("FORCE_NOLOCK_ON_ALL_TABLES");
}

public static IQueryable<T> AsReadOnly<T>(this IQueryable<T> query) where T : class
{
    return query.AsNoTracking().WithForceNoLock();
}
```

### 2. DbCommand Interceptors

We've implemented several DbCommand interceptors to add NOLOCK hints to SQL queries at runtime:

1. **NoLockInterceptor**: Adds NOLOCK hints to basic SELECT queries
2. **NoLockCommandInterceptor**: A more advanced interceptor that handles complex queries
3. **ComplexQueryNoLockInterceptor**: Specifically designed for complex queries with subqueries and joins
4. **StoredProcedureNoLockInterceptor**: Handles stored procedure calls and raw SQL queries

These interceptors use regular expressions to identify table references in SQL queries and add NOLOCK hints to them.

### 3. Registration

The interceptors are registered with the DbContext in the service registration:

```csharp
// In DailyActionsServiceRegistration.cs
options.AddInterceptors(new NoLockCommandInterceptor(
    serviceProvider.GetService<ILogger<NoLockCommandInterceptor>>()));
options.AddInterceptors(new ComplexQueryNoLockInterceptor(
    serviceProvider.GetService<ILogger<ComplexQueryNoLockInterceptor>>()));
options.AddInterceptors(new StoredProcedureNoLockInterceptor(
    serviceProvider.GetService<ILogger<StoredProcedureNoLockInterceptor>>()));
```

## Usage

### Basic Usage

To add NOLOCK hints to a simple query:

```csharp
var query = _dbContext.DailyActions
    .AsNoTracking()
    .WithNoLock()
    .Where(da => da.Date >= startDate && da.Date <= endDate);
```

### Force NOLOCK on All Tables

To ensure NOLOCK hints are added to all tables in a complex query:

```csharp
var query = _dbContext.DailyActions
    .AsNoTracking()
    .WithForceNoLock()
    .Where(da => da.Date >= startDate && da.Date <= endDate)
    .Include(da => da.WhiteLabel)
    .Include(da => da.Player);
```

### Optimized Read-Only Queries

For optimal read performance:

```csharp
var query = _dbContext.DailyActions
    .AsReadOnly()
    .Where(da => da.Date >= startDate && da.Date <= endDate);
```

## Considerations

1. **Data Consistency**: NOLOCK hints can lead to dirty reads, phantom reads, and non-repeatable reads. Use them only for queries where absolute consistency is not critical.

2. **Performance**: While NOLOCK hints can improve performance, they should be used judiciously. Monitor query performance to ensure they're providing the expected benefits.

3. **Debugging**: The interceptors log detailed information about the SQL transformations they perform, which can be helpful for debugging.

## Conclusion

By implementing NOLOCK hints consistently throughout the application, we've significantly improved the performance of database queries, especially for read-heavy operations like reporting and analytics.
