-- Script to extract metadata from DailyActionsDB for export to CSV
-- Run this script against DailyActionsDB to extract all metadata values

-- Set NOCOUNT ON to prevent row count messages
SET NOCOUNT ON;

-- Create a temporary table to hold all metadata
IF OBJECT_ID('tempdb..#AllMetadata') IS NOT NULL
    DROP TABLE #AllMetadata;

CREATE TABLE #AllMetadata (
    MetadataType NVARCHAR(50) NOT NULL,
    Code NVARCHAR(50) NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    DisplayOrder INT NOT NULL DEFAULT 0
);

-- Extract Gender values - fixed to ensure true distinctness
INSERT INTO #AllMetadata (MetadataType, Code, Name, IsActive, DisplayOrder)
SELECT
    'Gender' AS MetadataType,
    Gender AS Code,
    Gender AS Name,
    1 AS IsActive,
    ROW_NUMBER() OVER (ORDER BY Gender) AS DisplayOrder
FROM (
    SELECT DISTINCT Gender
    FROM common.tbl_Daily_actions_players WITH (NOLOCK)
    WHERE Gender IS NOT NULL AND Gender <> ''
    AND EXISTS (
        SELECT 1
        FROM common.tbl_Daily_actions WITH (NOLOCK)
        WHERE common.tbl_Daily_actions.PlayerID = common.tbl_Daily_actions_players.PlayerID
        AND common.tbl_Daily_actions.Date >= '2024-01-01'
    )
) AS DistinctGenders;

PRINT 'Extracted ' + CAST(@@ROWCOUNT AS NVARCHAR(10)) + ' Gender values';

-- Extract Status values - fixed to ensure true distinctness
INSERT INTO #AllMetadata (MetadataType, Code, Name, IsActive, DisplayOrder)
SELECT
    'Status' AS MetadataType,
    Status AS Code,
    Status AS Name,
    1 AS IsActive,
    ROW_NUMBER() OVER (ORDER BY Status) AS DisplayOrder
FROM (
    SELECT DISTINCT Status
    FROM common.tbl_Daily_actions_players WITH (NOLOCK)
    WHERE Status IS NOT NULL AND Status <> ''
    AND EXISTS (
        SELECT 1
        FROM common.tbl_Daily_actions WITH (NOLOCK)
        WHERE common.tbl_Daily_actions.PlayerID = common.tbl_Daily_actions_players.PlayerID
        AND common.tbl_Daily_actions.Date >= '2024-01-01'
    )
) AS DistinctStatuses;

PRINT 'Extracted ' + CAST(@@ROWCOUNT AS NVARCHAR(10)) + ' Status values';

-- Extract RegistrationPlayMode values - fixed to ensure true distinctness
INSERT INTO #AllMetadata (MetadataType, Code, Name, IsActive, DisplayOrder)
SELECT
    'RegistrationPlayMode' AS MetadataType,
    RegistrationPlayMode AS Code,
    RegistrationPlayMode AS Name,
    1 AS IsActive,
    ROW_NUMBER() OVER (ORDER BY RegistrationPlayMode) AS DisplayOrder
FROM (
    SELECT DISTINCT RegistrationPlayMode
    FROM common.tbl_Daily_actions_players WITH (NOLOCK)
    WHERE RegistrationPlayMode IS NOT NULL AND RegistrationPlayMode <> ''
    AND EXISTS (
        SELECT 1
        FROM common.tbl_Daily_actions WITH (NOLOCK)
        WHERE common.tbl_Daily_actions.PlayerID = common.tbl_Daily_actions_players.PlayerID
        AND common.tbl_Daily_actions.Date >= '2024-01-01'
    )
) AS DistinctModes;

PRINT 'Extracted ' + CAST(@@ROWCOUNT AS NVARCHAR(10)) + ' RegistrationPlayMode values';

-- Extract Language values - fixed to ensure true distinctness
INSERT INTO #AllMetadata (MetadataType, Code, Name, IsActive, DisplayOrder)
SELECT
    'Language' AS MetadataType,
    Language AS Code,
    Language AS Name,
    1 AS IsActive,
    ROW_NUMBER() OVER (ORDER BY Language) AS DisplayOrder
FROM (
    SELECT DISTINCT Language
    FROM common.tbl_Daily_actions_players WITH (NOLOCK)
    WHERE Language IS NOT NULL AND Language <> ''
    AND EXISTS (
        SELECT 1
        FROM common.tbl_Daily_actions WITH (NOLOCK)
        WHERE common.tbl_Daily_actions.PlayerID = common.tbl_Daily_actions_players.PlayerID
        AND common.tbl_Daily_actions.Date >= '2024-01-01'
    )
) AS DistinctLanguages;

PRINT 'Extracted ' + CAST(@@ROWCOUNT AS NVARCHAR(10)) + ' Language values';

-- Extract Platform values - fixed to ensure true distinctness
INSERT INTO #AllMetadata (MetadataType, Code, Name, IsActive, DisplayOrder)
SELECT
    'Platform' AS MetadataType,
    RegisteredPlatform AS Code,
    RegisteredPlatform AS Name,
    1 AS IsActive,
    ROW_NUMBER() OVER (ORDER BY RegisteredPlatform) AS DisplayOrder
FROM (
    SELECT DISTINCT RegisteredPlatform
    FROM common.tbl_Daily_actions_players WITH (NOLOCK)
    WHERE RegisteredPlatform IS NOT NULL AND RegisteredPlatform <> ''
    AND EXISTS (
        SELECT 1
        FROM common.tbl_Daily_actions WITH (NOLOCK)
        WHERE common.tbl_Daily_actions.PlayerID = common.tbl_Daily_actions_players.PlayerID
        AND common.tbl_Daily_actions.Date >= '2024-01-01'
    )
) AS DistinctPlatforms;

PRINT 'Extracted ' + CAST(@@ROWCOUNT AS NVARCHAR(10)) + ' Platform values';

-- Extract Tracker values - fixed to ensure true distinctness
INSERT INTO #AllMetadata (MetadataType, Code, Name, IsActive, DisplayOrder)
SELECT
    'Tracker' AS MetadataType,
    AffiliateID AS Code,
    AffiliateID AS Name,
    1 AS IsActive,
    ROW_NUMBER() OVER (ORDER BY AffiliateID) AS DisplayOrder
FROM (
    SELECT DISTINCT AffiliateID
    FROM common.tbl_Daily_actions_players WITH (NOLOCK)
    WHERE AffiliateID IS NOT NULL AND AffiliateID <> ''
    AND EXISTS (
        SELECT 1
        FROM common.tbl_Daily_actions WITH (NOLOCK)
        WHERE common.tbl_Daily_actions.PlayerID = common.tbl_Daily_actions_players.PlayerID
        AND common.tbl_Daily_actions.Date >= '2024-01-01'
    )
) AS DistinctTrackers;

PRINT 'Extracted ' + CAST(@@ROWCOUNT AS NVARCHAR(10)) + ' Tracker values';

-- Extract Country values directly from the Countries table
-- Check for duplicate Country codes first and print them for debugging
SELECT 'Duplicate Country codes found:' AS Message, CountryIntlCode, COUNT(*) AS Count,
    STRING_AGG(CAST(CountryID AS NVARCHAR(10)) + ':' + CountryName, ', ') AS CountryDetails
FROM common.tbl_Countries WITH (NOLOCK)
WHERE CountryIntlCode IS NOT NULL AND CountryIntlCode <> ''
GROUP BY CountryIntlCode
HAVING COUNT(*) > 1;

-- Now insert countries, handling duplicates
WITH DuplicateCountries AS (
    SELECT CountryIntlCode, MIN(CountryID) AS FirstCountryID
    FROM common.tbl_Countries WITH (NOLOCK)
    WHERE CountryIntlCode IS NOT NULL AND CountryIntlCode <> ''
    GROUP BY CountryIntlCode
    HAVING COUNT(*) > 1
)
INSERT INTO #AllMetadata (MetadataType, Code, Name, IsActive, DisplayOrder)
SELECT
    'Country' AS MetadataType,
    -- Make the code unique for duplicates by appending a suffix
    CASE
        WHEN d.FirstCountryID IS NOT NULL AND c.CountryID <> d.FirstCountryID
        THEN c.CountryIntlCode + '_' + CAST(c.CountryID AS NVARCHAR(10))
        ELSE c.CountryIntlCode
    END AS Code,
    c.CountryName AS Name,
    c.IsActive,
    ROW_NUMBER() OVER (ORDER BY c.CountryName) AS DisplayOrder
FROM common.tbl_Countries c WITH (NOLOCK)
LEFT JOIN DuplicateCountries d ON c.CountryIntlCode = d.CountryIntlCode
WHERE c.CountryIntlCode IS NOT NULL AND c.CountryIntlCode <> '';

PRINT 'Extracted ' + CAST(@@ROWCOUNT AS NVARCHAR(10)) + ' Country values';

-- Extract Currency values directly from the Currencies table
INSERT INTO #AllMetadata (MetadataType, Code, Name, IsActive, DisplayOrder)
SELECT
    'Currency' AS MetadataType,
    CurrencyCode AS Code,
    CurrencyName AS Name,
    1 AS IsActive,
    ROW_NUMBER() OVER (ORDER BY CurrencyName) AS DisplayOrder
FROM common.tbl_Currencies WITH (NOLOCK)
WHERE CurrencyCode IS NOT NULL AND CurrencyCode <> '';

PRINT 'Extracted ' + CAST(@@ROWCOUNT AS NVARCHAR(10)) + ' Currency values';

-- Extract WhiteLabel values - only for data from 2024-01-01
INSERT INTO #AllMetadata (MetadataType, Code, Name, Description, IsActive, DisplayOrder)
SELECT
    'WhiteLabel' AS MetadataType,
    CAST(LabelID AS NVARCHAR(50)) AS Code,
    LabelName AS Name,
    LabelNameShort AS Description,
    IsActive,
    ROW_NUMBER() OVER (ORDER BY LabelName) AS DisplayOrder
FROM common.tbl_White_labels WITH (NOLOCK)
WHERE LabelID IS NOT NULL
AND EXISTS (
    SELECT 1
    FROM common.tbl_Daily_actions WITH (NOLOCK)
    WHERE common.tbl_Daily_actions.WhiteLabelID = common.tbl_White_labels.LabelID
    AND common.tbl_Daily_actions.Date >= '2024-01-01'
);

PRINT 'Extracted ' + CAST(@@ROWCOUNT AS NVARCHAR(10)) + ' WhiteLabel values';

-- Output all metadata in CSV format
SELECT
    MetadataType,
    Code,
    Name,
    ISNULL(Description, '') AS Description,
    CASE WHEN IsActive = 1 THEN 'TRUE' ELSE 'FALSE' END AS IsActive,
    CAST(DisplayOrder AS VARCHAR(10)) AS DisplayOrder, -- Convert to string to avoid conversion issues
    'NULL' AS ParentId,
    '' AS AdditionalData,
    CONVERT(VARCHAR(23), GETUTCDATE(), 126) AS CreatedDate,
    'NULL' AS UpdatedDate
FROM #AllMetadata
ORDER BY MetadataType, DisplayOrder, Name;

-- Also output in a format that can be directly copied into the ImportMetadataFromCSV.sql script
PRINT '-- Copy the following INSERT statements into the ImportMetadataFromCSV.sql script if needed';
PRINT 'INSERT INTO #ImportedMetadata (MetadataType, Code, Name, Description, IsActive, DisplayOrder, ParentId, AdditionalData, CreatedDate, UpdatedDate)';
PRINT 'VALUES';

SELECT
    '    (''' + MetadataType + ''', ''' +
    REPLACE(Code, '''', '''''') + ''', ''' +
    REPLACE(Name, '''', '''''') + ''', ''' +
    REPLACE(ISNULL(Description, ''), '''', '''''') + ''', ''' +
    CASE WHEN IsActive = 1 THEN 'TRUE' ELSE 'FALSE' END + ''', ''' +
    CAST(DisplayOrder AS VARCHAR(10)) + ''', NULL, NULL, ''' +
    CONVERT(VARCHAR(23), GETUTCDATE(), 126) + ''', NULL)' +
    CASE WHEN ROW_NUMBER() OVER (ORDER BY MetadataType, DisplayOrder, Name) = COUNT(*) OVER () THEN ';' ELSE ',' END AS InsertStatement
FROM #AllMetadata
ORDER BY MetadataType, DisplayOrder, Name;

-- Count total metadata items
SELECT 'Total metadata items: ' + CAST(COUNT(*) AS NVARCHAR(10)) AS TotalCount FROM #AllMetadata;

-- Count by type
SELECT MetadataType, COUNT(*) AS ItemCount
FROM #AllMetadata
GROUP BY MetadataType
ORDER BY MetadataType;

-- Clean up
DROP TABLE #AllMetadata;
