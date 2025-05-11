-- Script to add NOLOCK hints to all stored procedures in the database
-- This script will find all stored procedures and add NOLOCK hints to all tables

-- Create a temporary table to store the stored procedures to update
IF OBJECT_ID('tempdb..#StoredProcsToUpdate') IS NOT NULL
    DROP TABLE #StoredProcsToUpdate;

CREATE TABLE #StoredProcsToUpdate (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    SchemaName NVARCHAR(128),
    ProcName NVARCHAR(128),
    ProcDefinition NVARCHAR(MAX)
);

-- Get all stored procedures that contain SELECT statements
INSERT INTO #StoredProcsToUpdate (SchemaName, ProcName, ProcDefinition)
SELECT 
    SCHEMA_NAME(p.schema_id) AS SchemaName,
    p.name AS ProcName,
    OBJECT_DEFINITION(p.object_id) AS ProcDefinition
FROM 
    sys.procedures p
WHERE 
    OBJECT_DEFINITION(p.object_id) LIKE '%SELECT%'
    AND OBJECT_DEFINITION(p.object_id) NOT LIKE '%WITH (NOLOCK)%';

-- Print the number of stored procedures to update
DECLARE @ProcCount INT = (SELECT COUNT(*) FROM #StoredProcsToUpdate);
PRINT 'Found ' + CAST(@ProcCount AS NVARCHAR(10)) + ' stored procedures to update';

-- Create a cursor to update each stored procedure
DECLARE @ID INT;
DECLARE @SchemaName NVARCHAR(128);
DECLARE @ProcName NVARCHAR(128);
DECLARE @ProcDefinition NVARCHAR(MAX);
DECLARE @NewProcDefinition NVARCHAR(MAX);
DECLARE @SQL NVARCHAR(MAX);

-- Create a cursor to iterate through the stored procedures
DECLARE proc_cursor CURSOR FOR
SELECT ID, SchemaName, ProcName, ProcDefinition
FROM #StoredProcsToUpdate;

OPEN proc_cursor;
FETCH NEXT FROM proc_cursor INTO @ID, @SchemaName, @ProcName, @ProcDefinition;

WHILE @@FETCH_STATUS = 0
BEGIN
    -- Initialize the new procedure definition
    SET @NewProcDefinition = @ProcDefinition;

    -- Replace FROM [table] with FROM [table] WITH (NOLOCK)
    SET @NewProcDefinition = REPLACE(@NewProcDefinition, 'FROM [', 'FROM [');
    SET @NewProcDefinition = REPLACE(@NewProcDefinition, '] ', '] WITH (NOLOCK) ');
    
    -- Replace JOIN [table] with JOIN [table] WITH (NOLOCK)
    SET @NewProcDefinition = REPLACE(@NewProcDefinition, 'JOIN [', 'JOIN [');
    SET @NewProcDefinition = REPLACE(@NewProcDefinition, '] ', '] WITH (NOLOCK) ');
    
    -- Replace INNER JOIN [table] with INNER JOIN [table] WITH (NOLOCK)
    SET @NewProcDefinition = REPLACE(@NewProcDefinition, 'INNER JOIN [', 'INNER JOIN [');
    SET @NewProcDefinition = REPLACE(@NewProcDefinition, '] ', '] WITH (NOLOCK) ');
    
    -- Replace LEFT JOIN [table] with LEFT JOIN [table] WITH (NOLOCK)
    SET @NewProcDefinition = REPLACE(@NewProcDefinition, 'LEFT JOIN [', 'LEFT JOIN [');
    SET @NewProcDefinition = REPLACE(@NewProcDefinition, '] ', '] WITH (NOLOCK) ');
    
    -- Replace RIGHT JOIN [table] with RIGHT JOIN [table] WITH (NOLOCK)
    SET @NewProcDefinition = REPLACE(@NewProcDefinition, 'RIGHT JOIN [', 'RIGHT JOIN [');
    SET @NewProcDefinition = REPLACE(@NewProcDefinition, '] ', '] WITH (NOLOCK) ');
    
    -- Fix any double NOLOCK hints
    SET @NewProcDefinition = REPLACE(@NewProcDefinition, 'WITH (NOLOCK) WITH (NOLOCK)', 'WITH (NOLOCK)');
    
    -- Create the ALTER PROCEDURE statement
    SET @SQL = 'ALTER PROCEDURE [' + @SchemaName + '].[' + @ProcName + '] ' + 
               SUBSTRING(@NewProcDefinition, CHARINDEX('AS', @NewProcDefinition), LEN(@NewProcDefinition));
    
    -- Print the procedure being updated
    PRINT 'Updating procedure [' + @SchemaName + '].[' + @ProcName + ']';
    
    -- Execute the ALTER PROCEDURE statement
    BEGIN TRY
        EXEC sp_executesql @SQL;
        PRINT 'Successfully updated procedure [' + @SchemaName + '].[' + @ProcName + ']';
    END TRY
    BEGIN CATCH
        PRINT 'Error updating procedure [' + @SchemaName + '].[' + @ProcName + ']: ' + ERROR_MESSAGE();
    END CATCH
    
    FETCH NEXT FROM proc_cursor INTO @ID, @SchemaName, @ProcName, @ProcDefinition;
END

CLOSE proc_cursor;
DEALLOCATE proc_cursor;

-- Clean up
DROP TABLE #StoredProcsToUpdate;

PRINT 'Stored procedure update complete';
