-- Script to create and populate the Metadata table in PPrePorterDB
-- This script creates a single metadata table to replace the separate lookup tables

-- Create Metadata table in PPrePorterDB (dbo schema)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'tbl_Metadata' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE dbo.tbl_Metadata (
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
    CREATE UNIQUE INDEX IX_Metadata_Type_Code ON dbo.tbl_Metadata(MetadataType, Code);
    CREATE INDEX IX_Metadata_Type ON dbo.tbl_Metadata(MetadataType);
    CREATE INDEX IX_Metadata_ParentId ON dbo.tbl_Metadata(ParentId);
    
    PRINT 'Created dbo.tbl_Metadata table in PPrePorterDB';
END
ELSE
BEGIN
    PRINT 'dbo.tbl_Metadata table already exists in PPrePorterDB';
END
GO

-- Populate Metadata table with Gender values
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'tbl_Metadata' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    -- Check if Gender metadata already exists
    IF NOT EXISTS (SELECT * FROM dbo.tbl_Metadata WHERE MetadataType = 'Gender')
    BEGIN
        -- Insert common Gender values (hardcoded since we can't query DailyActionsDB)
        INSERT INTO dbo.tbl_Metadata (MetadataType, Code, Name, IsActive, DisplayOrder, CreatedDate)
        VALUES
            ('Gender', 'M', 'Male', 1, 1, GETUTCDATE()),
            ('Gender', 'F', 'Female', 1, 2, GETUTCDATE()),
            ('Gender', 'O', 'Other', 1, 3, GETUTCDATE()),
            ('Gender', 'U', 'Unknown', 1, 4, GETUTCDATE());
        
        PRINT 'Populated Gender metadata';
    END
    ELSE
    BEGIN
        PRINT 'Gender metadata already exists';
    END
END
GO

-- Populate Metadata table with Status values
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'tbl_Metadata' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    -- Check if Status metadata already exists
    IF NOT EXISTS (SELECT * FROM dbo.tbl_Metadata WHERE MetadataType = 'Status')
    BEGIN
        -- Insert common Status values (hardcoded since we can't query DailyActionsDB)
        INSERT INTO dbo.tbl_Metadata (MetadataType, Code, Name, IsActive, DisplayOrder, CreatedDate)
        VALUES
            ('Status', 'Active', 'Active', 1, 1, GETUTCDATE()),
            ('Status', 'Inactive', 'Inactive', 1, 2, GETUTCDATE()),
            ('Status', 'Suspended', 'Suspended', 1, 3, GETUTCDATE()),
            ('Status', 'Closed', 'Closed', 1, 4, GETUTCDATE()),
            ('Status', 'Pending', 'Pending', 1, 5, GETUTCDATE()),
            ('Status', 'Blocked', 'Blocked', 1, 6, GETUTCDATE());
        
        PRINT 'Populated Status metadata';
    END
    ELSE
    BEGIN
        PRINT 'Status metadata already exists';
    END
END
GO

-- Populate Metadata table with RegistrationPlayMode values
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'tbl_Metadata' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    -- Check if RegistrationPlayMode metadata already exists
    IF NOT EXISTS (SELECT * FROM dbo.tbl_Metadata WHERE MetadataType = 'RegistrationPlayMode')
    BEGIN
        -- Insert common RegistrationPlayMode values (hardcoded since we can't query DailyActionsDB)
        INSERT INTO dbo.tbl_Metadata (MetadataType, Code, Name, IsActive, DisplayOrder, CreatedDate)
        VALUES
            ('RegistrationPlayMode', 'Real', 'Real Money', 1, 1, GETUTCDATE()),
            ('RegistrationPlayMode', 'Fun', 'Fun Play', 1, 2, GETUTCDATE()),
            ('RegistrationPlayMode', 'Demo', 'Demo Account', 1, 3, GETUTCDATE()),
            ('RegistrationPlayMode', 'Bonus', 'Bonus Play', 1, 4, GETUTCDATE());
        
        PRINT 'Populated RegistrationPlayMode metadata';
    END
    ELSE
    BEGIN
        PRINT 'RegistrationPlayMode metadata already exists';
    END
END
GO

-- Populate Metadata table with Language values
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'tbl_Metadata' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    -- Check if Language metadata already exists
    IF NOT EXISTS (SELECT * FROM dbo.tbl_Metadata WHERE MetadataType = 'Language')
    BEGIN
        -- Insert common Language values (hardcoded since we can't query DailyActionsDB)
        INSERT INTO dbo.tbl_Metadata (MetadataType, Code, Name, IsActive, DisplayOrder, CreatedDate)
        VALUES
            ('Language', 'en', 'English', 1, 1, GETUTCDATE()),
            ('Language', 'es', 'Spanish', 1, 2, GETUTCDATE()),
            ('Language', 'fr', 'French', 1, 3, GETUTCDATE()),
            ('Language', 'de', 'German', 1, 4, GETUTCDATE()),
            ('Language', 'it', 'Italian', 1, 5, GETUTCDATE()),
            ('Language', 'pt', 'Portuguese', 1, 6, GETUTCDATE()),
            ('Language', 'ru', 'Russian', 1, 7, GETUTCDATE()),
            ('Language', 'zh', 'Chinese', 1, 8, GETUTCDATE()),
            ('Language', 'ja', 'Japanese', 1, 9, GETUTCDATE()),
            ('Language', 'ko', 'Korean', 1, 10, GETUTCDATE());
        
        PRINT 'Populated Language metadata';
    END
    ELSE
    BEGIN
        PRINT 'Language metadata already exists';
    END
END
GO

-- Populate Metadata table with Platform values
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'tbl_Metadata' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    -- Check if Platform metadata already exists
    IF NOT EXISTS (SELECT * FROM dbo.tbl_Metadata WHERE MetadataType = 'Platform')
    BEGIN
        -- Insert common Platform values (hardcoded since we can't query DailyActionsDB)
        INSERT INTO dbo.tbl_Metadata (MetadataType, Code, Name, IsActive, DisplayOrder, CreatedDate)
        VALUES
            ('Platform', 'Web', 'Web Browser', 1, 1, GETUTCDATE()),
            ('Platform', 'iOS', 'iOS App', 1, 2, GETUTCDATE()),
            ('Platform', 'Android', 'Android App', 1, 3, GETUTCDATE()),
            ('Platform', 'Desktop', 'Desktop App', 1, 4, GETUTCDATE()),
            ('Platform', 'Mobile', 'Mobile Web', 1, 5, GETUTCDATE()),
            ('Platform', 'Tablet', 'Tablet', 1, 6, GETUTCDATE());
        
        PRINT 'Populated Platform metadata';
    END
    ELSE
    BEGIN
        PRINT 'Platform metadata already exists';
    END
END
GO

-- Populate Metadata table with Tracker values
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'tbl_Metadata' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    -- Check if Tracker metadata already exists
    IF NOT EXISTS (SELECT * FROM dbo.tbl_Metadata WHERE MetadataType = 'Tracker')
    BEGIN
        -- Insert common Tracker values (hardcoded since we can't query DailyActionsDB)
        -- Note: These are example values, you should replace with actual affiliate IDs
        INSERT INTO dbo.tbl_Metadata (MetadataType, Code, Name, IsActive, DisplayOrder, CreatedDate)
        VALUES
            ('Tracker', 'AFF001', 'Affiliate 1', 1, 1, GETUTCDATE()),
            ('Tracker', 'AFF002', 'Affiliate 2', 1, 2, GETUTCDATE()),
            ('Tracker', 'AFF003', 'Affiliate 3', 1, 3, GETUTCDATE()),
            ('Tracker', 'AFF004', 'Affiliate 4', 1, 4, GETUTCDATE()),
            ('Tracker', 'AFF005', 'Affiliate 5', 1, 5, GETUTCDATE()),
            ('Tracker', 'DIRECT', 'Direct Traffic', 1, 6, GETUTCDATE()),
            ('Tracker', 'ORGANIC', 'Organic Search', 1, 7, GETUTCDATE()),
            ('Tracker', 'SOCIAL', 'Social Media', 1, 8, GETUTCDATE());
        
        PRINT 'Populated Tracker metadata';
    END
    ELSE
    BEGIN
        PRINT 'Tracker metadata already exists';
    END
END
GO

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
            dbo.tbl_Metadata WITH (NOLOCK)
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
        IF EXISTS (SELECT 1 FROM dbo.tbl_Metadata WHERE MetadataType = @MetadataType AND Code = @Code)
        BEGIN
            -- Update existing metadata
            UPDATE dbo.tbl_Metadata
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
                
            SELECT Id FROM dbo.tbl_Metadata WHERE MetadataType = @MetadataType AND Code = @Code;
        END
        ELSE
        BEGIN
            -- Insert new metadata
            INSERT INTO dbo.tbl_Metadata (
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
