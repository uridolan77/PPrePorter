-- Script to create and populate the Metadata table
-- This script creates a single metadata table to replace the separate lookup tables

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
ELSE
BEGIN
    PRINT 'common.tbl_Metadata table already exists';
END
GO

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
    ELSE
    BEGIN
        PRINT 'Gender metadata already exists';
    END
END
GO

-- Populate Metadata table with Status values
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'tbl_Metadata' AND schema_id = SCHEMA_ID('common'))
BEGIN
    -- Check if Status metadata already exists
    IF NOT EXISTS (SELECT * FROM common.tbl_Metadata WHERE MetadataType = 'Status')
    BEGIN
        -- Insert Status values from Players table
        INSERT INTO common.tbl_Metadata (MetadataType, Code, Name, IsActive, DisplayOrder, CreatedDate)
        SELECT DISTINCT 
            'Status' AS MetadataType,
            Status AS Code, 
            Status AS Name, 
            1 AS IsActive,
            ROW_NUMBER() OVER (ORDER BY Status) AS DisplayOrder,
            GETUTCDATE() AS CreatedDate
        FROM common.tbl_Daily_actions_players WITH (NOLOCK)
        WHERE Status IS NOT NULL AND Status <> ''
        ORDER BY Status;
        
        PRINT 'Populated Status metadata';
    END
    ELSE
    BEGIN
        PRINT 'Status metadata already exists';
    END
END
GO

-- Populate Metadata table with RegistrationPlayMode values
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'tbl_Metadata' AND schema_id = SCHEMA_ID('common'))
BEGIN
    -- Check if RegistrationPlayMode metadata already exists
    IF NOT EXISTS (SELECT * FROM common.tbl_Metadata WHERE MetadataType = 'RegistrationPlayMode')
    BEGIN
        -- Insert RegistrationPlayMode values from Players table
        INSERT INTO common.tbl_Metadata (MetadataType, Code, Name, IsActive, DisplayOrder, CreatedDate)
        SELECT DISTINCT 
            'RegistrationPlayMode' AS MetadataType,
            RegistrationPlayMode AS Code, 
            RegistrationPlayMode AS Name, 
            1 AS IsActive,
            ROW_NUMBER() OVER (ORDER BY RegistrationPlayMode) AS DisplayOrder,
            GETUTCDATE() AS CreatedDate
        FROM common.tbl_Daily_actions_players WITH (NOLOCK)
        WHERE RegistrationPlayMode IS NOT NULL AND RegistrationPlayMode <> ''
        ORDER BY RegistrationPlayMode;
        
        PRINT 'Populated RegistrationPlayMode metadata';
    END
    ELSE
    BEGIN
        PRINT 'RegistrationPlayMode metadata already exists';
    END
END
GO

-- Populate Metadata table with Language values
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'tbl_Metadata' AND schema_id = SCHEMA_ID('common'))
BEGIN
    -- Check if Language metadata already exists
    IF NOT EXISTS (SELECT * FROM common.tbl_Metadata WHERE MetadataType = 'Language')
    BEGIN
        -- Insert Language values from Players table
        INSERT INTO common.tbl_Metadata (MetadataType, Code, Name, IsActive, DisplayOrder, CreatedDate)
        SELECT DISTINCT 
            'Language' AS MetadataType,
            Language AS Code, 
            Language AS Name, 
            1 AS IsActive,
            ROW_NUMBER() OVER (ORDER BY Language) AS DisplayOrder,
            GETUTCDATE() AS CreatedDate
        FROM common.tbl_Daily_actions_players WITH (NOLOCK)
        WHERE Language IS NOT NULL AND Language <> ''
        ORDER BY Language;
        
        PRINT 'Populated Language metadata';
    END
    ELSE
    BEGIN
        PRINT 'Language metadata already exists';
    END
END
GO

-- Populate Metadata table with Platform values
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'tbl_Metadata' AND schema_id = SCHEMA_ID('common'))
BEGIN
    -- Check if Platform metadata already exists
    IF NOT EXISTS (SELECT * FROM common.tbl_Metadata WHERE MetadataType = 'Platform')
    BEGIN
        -- Insert Platform values from Players table
        INSERT INTO common.tbl_Metadata (MetadataType, Code, Name, IsActive, DisplayOrder, CreatedDate)
        SELECT DISTINCT 
            'Platform' AS MetadataType,
            RegisteredPlatform AS Code, 
            RegisteredPlatform AS Name, 
            1 AS IsActive,
            ROW_NUMBER() OVER (ORDER BY RegisteredPlatform) AS DisplayOrder,
            GETUTCDATE() AS CreatedDate
        FROM common.tbl_Daily_actions_players WITH (NOLOCK)
        WHERE RegisteredPlatform IS NOT NULL AND RegisteredPlatform <> ''
        ORDER BY RegisteredPlatform;
        
        PRINT 'Populated Platform metadata';
    END
    ELSE
    BEGIN
        PRINT 'Platform metadata already exists';
    END
END
GO

-- Populate Metadata table with Tracker values
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'tbl_Metadata' AND schema_id = SCHEMA_ID('common'))
BEGIN
    -- Check if Tracker metadata already exists
    IF NOT EXISTS (SELECT * FROM common.tbl_Metadata WHERE MetadataType = 'Tracker')
    BEGIN
        -- Insert Tracker values from Players table
        INSERT INTO common.tbl_Metadata (MetadataType, Code, Name, IsActive, DisplayOrder, CreatedDate)
        SELECT DISTINCT 
            'Tracker' AS MetadataType,
            AffiliateID AS Code, 
            AffiliateID AS Name, 
            1 AS IsActive,
            ROW_NUMBER() OVER (ORDER BY AffiliateID) AS DisplayOrder,
            GETUTCDATE() AS CreatedDate
        FROM common.tbl_Daily_actions_players WITH (NOLOCK)
        WHERE AffiliateID IS NOT NULL AND AffiliateID <> ''
        ORDER BY AffiliateID;
        
        PRINT 'Populated Tracker metadata';
    END
    ELSE
    BEGIN
        PRINT 'Tracker metadata already exists';
    END
END
GO

-- Create a stored procedure to get metadata by type
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[common].[sp_GetMetadataByType]') AND type in (N'P', N'PC'))
BEGIN
    EXEC dbo.sp_executesql @statement = N'
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
    END';
    
    PRINT 'Created stored procedure [common].[sp_GetMetadataByType]';
END
ELSE
BEGIN
    PRINT 'Stored procedure [common].[sp_GetMetadataByType] already exists';
END
GO
