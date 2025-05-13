-- Script to check if the DailyActionsMetadata table exists in the PPrePorterDB database
-- Run this script against PPrePorterDB

-- Check if the DailyActionsMetadata table exists
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'DailyActionsMetadata' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    PRINT 'DailyActionsMetadata table exists in dbo schema.'
    
    -- Get column information
    SELECT 
        c.name AS ColumnName,
        t.name AS DataType,
        c.max_length AS MaxLength,
        c.is_nullable AS IsNullable,
        c.is_identity AS IsIdentity
    FROM sys.columns c
    JOIN sys.types t ON c.user_type_id = t.user_type_id
    WHERE c.object_id = OBJECT_ID('dbo.DailyActionsMetadata')
    ORDER BY c.column_id;
    
    -- Get row count
    SELECT COUNT(*) AS RowCount FROM dbo.DailyActionsMetadata;
    
    -- Get sample data
    SELECT TOP 10 * FROM dbo.DailyActionsMetadata;
    
    -- Get metadata types
    SELECT DISTINCT MetadataType, COUNT(*) AS Count 
    FROM dbo.DailyActionsMetadata 
    GROUP BY MetadataType
    ORDER BY MetadataType;
END
ELSE
BEGIN
    PRINT 'DailyActionsMetadata table does not exist in dbo schema.'
END
