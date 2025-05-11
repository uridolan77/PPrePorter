-- Script to import metadata from CSV into PPrePorterDB
-- Run this script against PPrePorterDB after creating the metadata table

-- Create the DailyActionsMetadata table if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DailyActionsMetadata' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE dbo.DailyActionsMetadata (
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
    CREATE UNIQUE INDEX IX_DailyActionsMetadata_Type_Code ON dbo.DailyActionsMetadata(MetadataType, Code);
    CREATE INDEX IX_DailyActionsMetadata_Type ON dbo.DailyActionsMetadata(MetadataType);
    CREATE INDEX IX_DailyActionsMetadata_ParentId ON dbo.DailyActionsMetadata(ParentId);

    PRINT 'Created dbo.DailyActionsMetadata table in PPrePorterDB';
END
ELSE
BEGIN
    PRINT 'dbo.DailyActionsMetadata table already exists in PPrePorterDB';
END
GO

-- Create a temporary table to hold the imported data
IF OBJECT_ID('tempdb..#ImportedMetadata') IS NOT NULL
    DROP TABLE #ImportedMetadata;

CREATE TABLE #ImportedMetadata (
    MetadataType NVARCHAR(50) NOT NULL,
    Code NVARCHAR(50) NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    IsActive NVARCHAR(10) NOT NULL,
    DisplayOrder NVARCHAR(50) NOT NULL, -- Changed from INT to NVARCHAR to handle non-numeric values
    ParentId NVARCHAR(50) NULL,
    AdditionalData NVARCHAR(MAX) NULL,
    CreatedDate NVARCHAR(50) NULL,
    UpdatedDate NVARCHAR(50) NULL
);

-- Import data from CSV file
-- Replace 'C:\path\to\metadata.csv' with the actual path to your CSV file
-- You'll need to use BULK INSERT or OPENROWSET depending on your SQL Server version and permissions

-- Option 1: Using BULK INSERT (if you have permissions)
/*
BULK INSERT #ImportedMetadata
FROM 'C:\path\to\metadata.csv'
WITH (
    FIELDTERMINATOR = ',',
    ROWTERMINATOR = '\n',
    FIRSTROW = 2, -- Skip header row
    TABLOCK
);
*/

-- Option 2: Using OPENROWSET (if you have permissions)
/*
INSERT INTO #ImportedMetadata
SELECT *
FROM OPENROWSET(
    BULK 'C:\path\to\metadata.csv',
    FORMATFILE = 'C:\path\to\metadata.fmt',
    FIRSTROW = 2
) AS ImportedData;
*/

-- Option 3: Manual import (copy-paste the CSV data here)
-- If you can't use BULK INSERT or OPENROWSET, you can manually insert the data
-- Example:
/*
INSERT INTO #ImportedMetadata (MetadataType, Code, Name, Description, IsActive, DisplayOrder, ParentId, AdditionalData, CreatedDate, UpdatedDate)
VALUES
    ('Gender', 'M', 'Male', '', 'TRUE', 1, NULL, NULL, '2023-05-15T12:00:00.000', NULL),
    ('Gender', 'F', 'Female', '', 'TRUE', 2, NULL, NULL, '2023-05-15T12:00:00.000', NULL);
*/

-- After importing the data, insert it into the actual metadata table
INSERT INTO dbo.DailyActionsMetadata (
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
)
SELECT
    MetadataType,
    Code,
    Name,
    NULLIF(Description, ''),
    CASE WHEN UPPER(IsActive) = 'TRUE' THEN 1 ELSE 0 END,
    TRY_CAST(DisplayOrder AS INT), -- Handle potential non-numeric values
    CASE WHEN ParentId = 'NULL' OR ParentId IS NULL THEN NULL ELSE TRY_CAST(ParentId AS INT) END,
    NULLIF(AdditionalData, ''),
    CASE WHEN CreatedDate = 'NULL' OR CreatedDate IS NULL THEN GETUTCDATE() ELSE TRY_CONVERT(DATETIME, CreatedDate) END,
    CASE WHEN UpdatedDate = 'NULL' OR UpdatedDate IS NULL THEN NULL ELSE TRY_CONVERT(DATETIME, UpdatedDate) END
FROM #ImportedMetadata
WHERE NOT EXISTS (
    SELECT 1
    FROM dbo.DailyActionsMetadata
    WHERE dbo.DailyActionsMetadata.MetadataType = #ImportedMetadata.MetadataType
    AND dbo.DailyActionsMetadata.Code = #ImportedMetadata.Code
);

-- Report the number of rows imported
DECLARE @RowsImported INT = @@ROWCOUNT;
PRINT 'Imported ' + CAST(@RowsImported AS NVARCHAR(10)) + ' metadata items';

-- Create a stored procedure to get metadata by type
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetMetadataByType]') AND type in (N'P', N'PC'))
BEGIN
    EXEC dbo.sp_executesql @statement = N'
    CREATE PROCEDURE [dbo].[sp_GetMetadataByType]
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
            dbo.DailyActionsMetadata WITH (NOLOCK)
        WHERE
            MetadataType = @MetadataType
            AND (@IncludeInactive = 1 OR IsActive = 1)
        ORDER BY
            DisplayOrder, Name
    END';

    PRINT 'Created stored procedure [dbo].[sp_GetMetadataByType]';
END
ELSE
BEGIN
    PRINT 'Stored procedure [dbo].[sp_GetMetadataByType] already exists';
END
GO

-- Create a stored procedure to add or update metadata
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_AddOrUpdateMetadata]') AND type in (N'P', N'PC'))
BEGIN
    EXEC dbo.sp_executesql @statement = N'
    CREATE PROCEDURE [dbo].[sp_AddOrUpdateMetadata]
        @MetadataType NVARCHAR(50),
        @Code NVARCHAR(50),
        @Name NVARCHAR(100),
        @Description NVARCHAR(500) = NULL,
        @IsActive BIT = 1,
        @DisplayOrder INT = 0,
        @ParentId INT = NULL,
        @AdditionalData NVARCHAR(MAX) = NULL
    AS
    BEGIN
        SET NOCOUNT ON;

        -- Check if the metadata item already exists
        IF EXISTS (SELECT 1 FROM dbo.DailyActionsMetadata WHERE MetadataType = @MetadataType AND Code = @Code)
        BEGIN
            -- Update existing metadata
            UPDATE dbo.DailyActionsMetadata
            SET
                Name = @Name,
                Description = @Description,
                IsActive = @IsActive,
                DisplayOrder = @DisplayOrder,
                ParentId = @ParentId,
                AdditionalData = @AdditionalData,
                UpdatedDate = GETUTCDATE()
            WHERE
                MetadataType = @MetadataType AND Code = @Code;

            SELECT Id FROM dbo.DailyActionsMetadata WHERE MetadataType = @MetadataType AND Code = @Code;
        END
        ELSE
        BEGIN
            -- Insert new metadata
            INSERT INTO dbo.DailyActionsMetadata (
                MetadataType,
                Code,
                Name,
                Description,
                IsActive,
                DisplayOrder,
                ParentId,
                AdditionalData,
                CreatedDate
            )
            VALUES (
                @MetadataType,
                @Code,
                @Name,
                @Description,
                @IsActive,
                @DisplayOrder,
                @ParentId,
                @AdditionalData,
                GETUTCDATE()
            );

            SELECT SCOPE_IDENTITY() AS Id;
        END
    END';

    PRINT 'Created stored procedure [dbo].[sp_AddOrUpdateMetadata]';
END
ELSE
BEGIN
    PRINT 'Stored procedure [dbo].[sp_AddOrUpdateMetadata] already exists';
END
GO

-- Clean up
DROP TABLE #ImportedMetadata;

-- Show the imported data
SELECT * FROM dbo.DailyActionsMetadata ORDER BY MetadataType, DisplayOrder, Name;

-- Count by type
SELECT MetadataType, COUNT(*) AS ItemCount
FROM dbo.DailyActionsMetadata
GROUP BY MetadataType
ORDER BY MetadataType;
