# Generic Metadata Table Implementation

This document outlines the implementation of a generic metadata table in the PPrePorter application.

## Overview

Instead of having separate lookup tables for different types of metadata (genders, statuses, etc.), we've implemented a single `common.tbl_Metadata` table that holds all lookup items with a `MetadataType` field to distinguish between different types of metadata.

## Key Components

### 1. MetadataItem Model

The `MetadataItem` class represents a row in the metadata table:

```csharp
[Table("tbl_Metadata", Schema = "common")]
public class MetadataItem
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [StringLength(50)]
    public string MetadataType { get; set; } = string.Empty;

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

    public int? ParentId { get; set; }

    [Column(TypeName = "nvarchar(max)")]
    public string? AdditionalData { get; set; }

    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedDate { get; set; }
}
```

### 2. MetadataTypes Constants

The `MetadataTypes` class provides constants for the different types of metadata:

```csharp
public static class MetadataTypes
{
    public const string Gender = "Gender";
    public const string Status = "Status";
    public const string RegistrationPlayMode = "RegistrationPlayMode";
    public const string Language = "Language";
    public const string Platform = "Platform";
    public const string Tracker = "Tracker";
}
```

### 3. IMetadataService Interface

The `IMetadataService` interface defines methods for accessing metadata:

```csharp
public interface IMetadataService
{
    Task<List<MetadataItem>> GetMetadataByTypeAsync(string metadataType, bool includeInactive = false);
    Task<MetadataItem?> GetMetadataByTypeAndCodeAsync(string metadataType, string code);
    Task<List<MetadataItem>> GetGendersAsync(bool includeInactive = false);
    Task<List<MetadataItem>> GetStatusesAsync(bool includeInactive = false);
    Task<List<MetadataItem>> GetRegistrationPlayModesAsync(bool includeInactive = false);
    Task<List<MetadataItem>> GetLanguagesAsync(bool includeInactive = false);
    Task<List<MetadataItem>> GetPlatformsAsync(bool includeInactive = false);
    Task<List<MetadataItem>> GetTrackersAsync(bool includeInactive = false);
    Task PreloadMetadataAsync();
}
```

### 4. MetadataService Implementation

The `MetadataService` class implements the `IMetadataService` interface:

```csharp
public class MetadataService : IMetadataService
{
    private readonly DailyActionsDbContext _dbContext;
    private readonly IGlobalCacheService _cacheService;
    private readonly ILogger<MetadataService> _logger;
    private const string CacheKeyPrefix = "Metadata_";

    // Constructor and implementation of interface methods...
}
```

### 5. Database Schema

The `tbl_Metadata` table has the following schema:

```sql
CREATE TABLE common.tbl_Metadata (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    MetadataType NVARCHAR(50) NOT NULL,
    Code NVARCHAR(50) NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    DisplayOrder INT NOT NULL DEFAULT 0,
    ParentId INT NULL,
    AdditionalData NVARCHAR(MAX) NULL,
    CreatedDate DATETIME NOT NULL DEFAULT GETUTCDATE(),
    UpdatedDate DATETIME NULL
);

-- Indexes
CREATE UNIQUE INDEX IX_Metadata_Type_Code ON common.tbl_Metadata(MetadataType, Code);
CREATE INDEX IX_Metadata_Type ON common.tbl_Metadata(MetadataType);
CREATE INDEX IX_Metadata_ParentId ON common.tbl_Metadata(ParentId);
```

### 6. Stored Procedure

A stored procedure is provided to get metadata by type:

```sql
CREATE PROCEDURE [common].[sp_GetMetadataByType]
    @MetadataType NVARCHAR(50),
    @IncludeInactive BIT = 0
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        Id,
        MetadataType,
        Code,
        Name,
        Description,
        IsActive,
        DisplayOrder,
        ParentId,
        AdditionalData,
        CreatedDate,
        UpdatedDate
    FROM 
        common.tbl_Metadata WITH (NOLOCK)
    WHERE 
        MetadataType = @MetadataType
        AND (@IncludeInactive = 1 OR IsActive = 1)
    ORDER BY 
        DisplayOrder, Name
END
```

## Implementation Details

### 1. Caching

The `MetadataService` uses the `IGlobalCacheService` to cache metadata items:

```csharp
public async Task<List<MetadataItem>> GetMetadataByTypeAsync(string metadataType, bool includeInactive = false)
{
    string cacheKey = $"{CacheKeyPrefix}{metadataType}_{includeInactive}";

    // Try to get from cache first
    if (_cacheService.TryGetValue(cacheKey, out List<MetadataItem>? cachedItems) && cachedItems != null)
    {
        _logger.LogDebug("Cache HIT: Retrieved {Count} {MetadataType} items from cache", 
            cachedItems.Count, metadataType);
        return cachedItems;
    }

    // Get from database and cache the result...
}
```

### 2. Preloading

The `PreloadMetadataAsync` method preloads all metadata types into the cache:

```csharp
public async Task PreloadMetadataAsync()
{
    _logger.LogInformation("Preloading metadata into cache");

    // Get all metadata types
    var metadataTypes = await _dbContext.Metadata
        .Select(m => m.MetadataType)
        .Distinct()
        .ToListAsync();

    // Preload each metadata type
    foreach (var metadataType in metadataTypes)
    {
        _logger.LogDebug("Preloading {MetadataType} metadata", metadataType);
        
        // Preload active items
        await GetMetadataByTypeAsync(metadataType, false);
        
        // Preload all items (including inactive)
        await GetMetadataByTypeAsync(metadataType, true);
    }

    _logger.LogInformation("Preloaded {Count} metadata types into cache", metadataTypes.Count);
}
```

### 3. Integration with DailyActionsService

The `DailyActionsService` now uses the `MetadataService` to get metadata:

```csharp
public async Task PrewarmCacheAsync()
{
    try
    {
        _logger.LogInformation("Prewarming cache with commonly accessed data...");

        // Prewarm metadata using the metadata service
        await _metadataService.PreloadMetadataAsync();
        
        // Also prewarm the daily actions metadata
        var metadata = await GetDailyActionsMetadataAsync();
        
        // ...
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error prewarming cache");
    }
}
```

### 4. Integration with CachePrewarmingService

The `CachePrewarmingService` now uses the `MetadataService` to prewarm the cache:

```csharp
public async Task PrewarmCacheAsync(CancellationToken cancellationToken = default)
{
    // ...
    
    // Prewarm the metadata cache first
    _logger.LogInformation("Prewarming metadata cache...");
    await _metadataService.PreloadMetadataAsync();
    
    // Then prewarm the daily actions cache
    _logger.LogInformation("Prewarming daily actions cache...");
    await _dailyActionsService.PrewarmCacheAsync();
    
    // ...
}
```

## Migration Script

A migration script is provided to create and populate the metadata table:

```sql
-- Create Metadata table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'tbl_Metadata' AND schema_id = SCHEMA_ID('common'))
BEGIN
    CREATE TABLE common.tbl_Metadata (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        MetadataType NVARCHAR(50) NOT NULL,
        Code NVARCHAR(50) NOT NULL,
        Name NVARCHAR(100) NOT NULL,
        Description NVARCHAR(500) NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        DisplayOrder INT NOT NULL DEFAULT 0,
        ParentId INT NULL,
        AdditionalData NVARCHAR(MAX) NULL,
        CreatedDate DATETIME NOT NULL DEFAULT GETUTCDATE(),
        UpdatedDate DATETIME NULL
    );
    
    -- Add indexes for faster lookups
    CREATE UNIQUE INDEX IX_Metadata_Type_Code ON common.tbl_Metadata(MetadataType, Code);
    CREATE INDEX IX_Metadata_Type ON common.tbl_Metadata(MetadataType);
    CREATE INDEX IX_Metadata_ParentId ON common.tbl_Metadata(ParentId);
    
    PRINT 'Created common.tbl_Metadata table';
END
```

The script also populates the table with data from the existing tables:

```sql
-- Populate Metadata table with Gender values
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'tbl_Metadata' AND schema_id = SCHEMA_ID('common'))
BEGIN
    -- Check if Gender metadata already exists
    IF NOT EXISTS (SELECT * FROM common.tbl_Metadata WHERE MetadataType = 'Gender')
    BEGIN
        -- Insert Gender values from Players table
        INSERT INTO common.tbl_Metadata (MetadataType, Code, Name, IsActive, DisplayOrder, CreatedDate)
        SELECT DISTINCT 
            'Gender' AS MetadataType,
            Gender AS Code, 
            Gender AS Name, 
            1 AS IsActive,
            ROW_NUMBER() OVER (ORDER BY Gender) AS DisplayOrder,
            GETUTCDATE() AS CreatedDate
        FROM common.tbl_Daily_actions_players WITH (NOLOCK)
        WHERE Gender IS NOT NULL AND Gender <> ''
        ORDER BY Gender;
        
        PRINT 'Populated Gender metadata';
    END
END
```

## Benefits

1. **Simplified Schema**: Instead of having multiple lookup tables, we now have a single table for all metadata.
2. **Consistent API**: The `MetadataService` provides a consistent API for accessing all types of metadata.
3. **Efficient Caching**: Metadata is cached by type, making it efficient to retrieve.
4. **Hierarchical Support**: The `ParentId` field allows for hierarchical metadata.
5. **Extensibility**: New metadata types can be added without changing the schema.
6. **Additional Data**: The `AdditionalData` field allows for storing additional information in JSON format.

## How to Use

To use the metadata service, inject it into your class:

```csharp
private readonly IMetadataService _metadataService;

public MyClass(IMetadataService metadataService)
{
    _metadataService = metadataService;
}
```

Then, use it to get metadata:

```csharp
// Get all genders
var genders = await _metadataService.GetGendersAsync();

// Get all statuses, including inactive ones
var statuses = await _metadataService.GetStatusesAsync(includeInactive: true);

// Get a specific metadata item
var gender = await _metadataService.GetMetadataByTypeAndCodeAsync(MetadataTypes.Gender, "Male");

// Get a custom metadata type
var customMetadata = await _metadataService.GetMetadataByTypeAsync("CustomType");
```
