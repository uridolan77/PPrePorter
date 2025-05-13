# NOLOCK Usage Examples

This document provides examples of how to use NOLOCK hints in the PPrePorter application.

## 1. Using Extension Methods

### Basic Query with NOLOCK

```csharp
// Use ToListWithNoLockAsync to apply NOLOCK hint
var players = await _dbContext.Players
    .AsNoTracking()
    .Where(p => p.IsActive)
    .ToListWithNoLockAsync();
```

### FirstOrDefault with NOLOCK

```csharp
// Use FirstOrDefaultWithNoLockAsync to apply NOLOCK hint
var player = await _dbContext.Players
    .AsNoTracking()
    .Where(p => p.Id == playerId)
    .FirstOrDefaultWithNoLockAsync();
```

### Any with NOLOCK

```csharp
// Use AnyWithNoLockAsync to apply NOLOCK hint
bool exists = await _dbContext.Players
    .AsNoTracking()
    .Where(p => p.Alias == alias)
    .AnyWithNoLockAsync();
```

### Count with NOLOCK

```csharp
// Use CountWithNoLockAsync to apply NOLOCK hint
int count = await _dbContext.Players
    .AsNoTracking()
    .Where(p => p.IsActive)
    .CountWithNoLockAsync();
```

## 2. Using DbContext Extension

### Set Transaction Isolation Level for All Queries

```csharp
// Enable NOLOCK for all queries in this context
_dbContext.EnableNoLockForAllQueries();

// Now all queries will use NOLOCK hint
var players = await _dbContext.Players
    .AsNoTracking()
    .Where(p => p.IsActive)
    .ToListAsync();

// Reset transaction isolation level when done
_dbContext.ResetTransactionIsolationLevel();
```

## 3. Using NoLockDbContextDecorator

### Create a Decorator for a DbContext

```csharp
// Create a decorator for the DbContext
using (var noLockContext = new NoLockDbContextDecorator<DailyActionsDbContext>(_dbContext, _logger))
{
    // All queries using noLockContext.Context will use NOLOCK hint
    var players = await noLockContext.Context.Players
        .AsNoTracking()
        .Where(p => p.IsActive)
        .ToListAsync();
}
```

### Using the NoLockDbContextFactory

```csharp
// Inject the factory
private readonly NoLockDbContextFactory _noLockFactory;

public MyService(NoLockDbContextFactory noLockFactory)
{
    _noLockFactory = noLockFactory;
}

public async Task<List<Player>> GetActivePlayers()
{
    // Create a decorator for the DbContext
    using (var noLockContext = _noLockFactory.CreateNoLockContext<DailyActionsDbContext>())
    {
        // All queries using noLockContext.Context will use NOLOCK hint
        return await noLockContext.Context.Players
            .AsNoTracking()
            .Where(p => p.IsActive)
            .ToListAsync();
    }
}
```

## 4. Using TransactionScope

### Execute a Query with READ UNCOMMITTED Isolation Level

```csharp
List<Player> players;

using (var scope = new TransactionScope(
    TransactionScopeOption.Required,
    new TransactionOptions
    {
        IsolationLevel = IsolationLevel.ReadUncommitted
    },
    TransactionScopeAsyncFlowOption.Enabled))
{
    players = await _dbContext.Players
        .AsNoTracking()
        .Where(p => p.IsActive)
        .ToListAsync();
    
    scope.Complete();
}
```

## 5. Best Practices

1. **Use AsNoTracking()** with NOLOCK hints to avoid unnecessary tracking overhead.

2. **Use WithForceNoLock()** to ensure all tables in a query have NOLOCK hints.

3. **Use ToListWithNoLockAsync()** and other extension methods for simple queries.

4. **Use NoLockDbContextDecorator** for complex scenarios where you need to ensure all queries use NOLOCK.

5. **Use EnableNoLockForAllQueries()** when you need to apply NOLOCK to all queries in a specific context.

6. **Always reset the transaction isolation level** when done with NoLockDbContextDecorator or EnableNoLockForAllQueries().

7. **Be aware of the trade-offs** of using NOLOCK hints (dirty reads, phantom reads, etc.).
