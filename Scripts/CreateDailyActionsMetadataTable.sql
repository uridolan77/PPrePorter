-- Script to create the DailyActionsMetadata table in the PPrePorterDB database
-- Run this script against PPrePorterDB

-- Check if the DailyActionsMetadata table exists
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DailyActionsMetadata' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    PRINT 'Creating DailyActionsMetadata table...'
    
    -- Create the DailyActionsMetadata table
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
    
    -- Create indexes for better performance
    CREATE NONCLUSTERED INDEX IX_DailyActionsMetadata_MetadataType ON dbo.DailyActionsMetadata (MetadataType);
    CREATE UNIQUE NONCLUSTERED INDEX IX_DailyActionsMetadata_MetadataType_Code ON dbo.DailyActionsMetadata (MetadataType, Code);
    
    PRINT 'DailyActionsMetadata table created successfully.'
END
ELSE
BEGIN
    PRINT 'DailyActionsMetadata table already exists.'
END

-- Insert sample data for WhiteLabel metadata if not exists
IF NOT EXISTS (SELECT * FROM dbo.DailyActionsMetadata WHERE MetadataType = 'WhiteLabel')
BEGIN
    PRINT 'Inserting sample WhiteLabel metadata...'
    
    INSERT INTO dbo.DailyActionsMetadata (MetadataType, Code, Name, Description, IsActive, DisplayOrder, AdditionalData)
    VALUES
        ('WhiteLabel', 'WL1', 'White Label 1', 'First white label', 1, 1, 'https://whitelabel1.com'),
        ('WhiteLabel', 'WL2', 'White Label 2', 'Second white label', 1, 2, 'https://whitelabel2.com'),
        ('WhiteLabel', 'WL3', 'White Label 3', 'Third white label', 1, 3, 'https://whitelabel3.com'),
        ('WhiteLabel', 'WL4', 'White Label 4', 'Fourth white label', 0, 4, 'https://whitelabel4.com');
    
    PRINT 'Sample WhiteLabel metadata inserted successfully.'
END

-- Insert sample data for Country metadata if not exists
IF NOT EXISTS (SELECT * FROM dbo.DailyActionsMetadata WHERE MetadataType = 'Country')
BEGIN
    PRINT 'Inserting sample Country metadata...'
    
    INSERT INTO dbo.DailyActionsMetadata (MetadataType, Code, Name, Description, IsActive, DisplayOrder)
    VALUES
        ('Country', 'US', 'United States', 'United States of America', 1, 1),
        ('Country', 'GB', 'United Kingdom', 'United Kingdom of Great Britain and Northern Ireland', 1, 2),
        ('Country', 'DE', 'Germany', 'Federal Republic of Germany', 1, 3),
        ('Country', 'FR', 'France', 'French Republic', 1, 4),
        ('Country', 'IT', 'Italy', 'Italian Republic', 1, 5),
        ('Country', 'ES', 'Spain', 'Kingdom of Spain', 1, 6),
        ('Country', 'CA', 'Canada', 'Canada', 1, 7),
        ('Country', 'AU', 'Australia', 'Commonwealth of Australia', 1, 8),
        ('Country', 'JP', 'Japan', 'Japan', 1, 9),
        ('Country', 'CN', 'China', 'People''s Republic of China', 0, 10);
    
    PRINT 'Sample Country metadata inserted successfully.'
END

-- Insert sample data for Currency metadata if not exists
IF NOT EXISTS (SELECT * FROM dbo.DailyActionsMetadata WHERE MetadataType = 'Currency')
BEGIN
    PRINT 'Inserting sample Currency metadata...'
    
    INSERT INTO dbo.DailyActionsMetadata (MetadataType, Code, Name, Description, IsActive, DisplayOrder, AdditionalData)
    VALUES
        ('Currency', 'USD', 'US Dollar', 'United States Dollar', 1, 1, '$'),
        ('Currency', 'EUR', 'Euro', 'Euro', 1, 2, '€'),
        ('Currency', 'GBP', 'British Pound', 'British Pound Sterling', 1, 3, '£'),
        ('Currency', 'JPY', 'Japanese Yen', 'Japanese Yen', 1, 4, '¥'),
        ('Currency', 'CAD', 'Canadian Dollar', 'Canadian Dollar', 1, 5, 'C$'),
        ('Currency', 'AUD', 'Australian Dollar', 'Australian Dollar', 1, 6, 'A$'),
        ('Currency', 'CHF', 'Swiss Franc', 'Swiss Franc', 1, 7, 'Fr'),
        ('Currency', 'CNY', 'Chinese Yuan', 'Chinese Yuan Renminbi', 0, 8, '¥');
    
    PRINT 'Sample Currency metadata inserted successfully.'
END

-- Insert sample data for Language metadata if not exists
IF NOT EXISTS (SELECT * FROM dbo.DailyActionsMetadata WHERE MetadataType = 'Language')
BEGIN
    PRINT 'Inserting sample Language metadata...'
    
    INSERT INTO dbo.DailyActionsMetadata (MetadataType, Code, Name, Description, IsActive, DisplayOrder)
    VALUES
        ('Language', 'EN', 'English', 'English language', 1, 1),
        ('Language', 'DE', 'German', 'German language', 1, 2),
        ('Language', 'FR', 'French', 'French language', 1, 3),
        ('Language', 'ES', 'Spanish', 'Spanish language', 1, 4),
        ('Language', 'IT', 'Italian', 'Italian language', 1, 5),
        ('Language', 'PT', 'Portuguese', 'Portuguese language', 1, 6),
        ('Language', 'RU', 'Russian', 'Russian language', 0, 7);
    
    PRINT 'Sample Language metadata inserted successfully.'
END

-- Insert sample data for Platform metadata if not exists
IF NOT EXISTS (SELECT * FROM dbo.DailyActionsMetadata WHERE MetadataType = 'Platform')
BEGIN
    PRINT 'Inserting sample Platform metadata...'
    
    INSERT INTO dbo.DailyActionsMetadata (MetadataType, Code, Name, Description, IsActive, DisplayOrder)
    VALUES
        ('Platform', 'WEB', 'Web', 'Web platform', 1, 1),
        ('Platform', 'MOBILE', 'Mobile', 'Mobile platform', 1, 2),
        ('Platform', 'TABLET', 'Tablet', 'Tablet platform', 1, 3),
        ('Platform', 'DESKTOP', 'Desktop', 'Desktop application', 0, 4);
    
    PRINT 'Sample Platform metadata inserted successfully.'
END

-- Insert sample data for Gender metadata if not exists
IF NOT EXISTS (SELECT * FROM dbo.DailyActionsMetadata WHERE MetadataType = 'Gender')
BEGIN
    PRINT 'Inserting sample Gender metadata...'
    
    INSERT INTO dbo.DailyActionsMetadata (MetadataType, Code, Name, Description, IsActive, DisplayOrder)
    VALUES
        ('Gender', 'M', 'Male', 'Male gender', 1, 1),
        ('Gender', 'F', 'Female', 'Female gender', 1, 2),
        ('Gender', 'O', 'Other', 'Other gender', 1, 3);
    
    PRINT 'Sample Gender metadata inserted successfully.'
END

-- Insert sample data for Status metadata if not exists
IF NOT EXISTS (SELECT * FROM dbo.DailyActionsMetadata WHERE MetadataType = 'Status')
BEGIN
    PRINT 'Inserting sample Status metadata...'
    
    INSERT INTO dbo.DailyActionsMetadata (MetadataType, Code, Name, Description, IsActive, DisplayOrder)
    VALUES
        ('Status', 'ACTIVE', 'Active', 'Active status', 1, 1),
        ('Status', 'INACTIVE', 'Inactive', 'Inactive status', 1, 2),
        ('Status', 'BLOCKED', 'Blocked', 'Blocked status', 1, 3),
        ('Status', 'PENDING', 'Pending', 'Pending status', 1, 4);
    
    PRINT 'Sample Status metadata inserted successfully.'
END

-- Insert sample data for RegistrationPlayMode metadata if not exists
IF NOT EXISTS (SELECT * FROM dbo.DailyActionsMetadata WHERE MetadataType = 'RegistrationPlayMode')
BEGIN
    PRINT 'Inserting sample RegistrationPlayMode metadata...'
    
    INSERT INTO dbo.DailyActionsMetadata (MetadataType, Code, Name, Description, IsActive, DisplayOrder)
    VALUES
        ('RegistrationPlayMode', 'CASINO', 'Casino', 'Casino play mode', 1, 1),
        ('RegistrationPlayMode', 'SPORT', 'Sport', 'Sport play mode', 1, 2),
        ('RegistrationPlayMode', 'LIVE', 'Live', 'Live play mode', 1, 3),
        ('RegistrationPlayMode', 'BINGO', 'Bingo', 'Bingo play mode', 1, 4);
    
    PRINT 'Sample RegistrationPlayMode metadata inserted successfully.'
END

-- Insert sample data for Tracker metadata if not exists
IF NOT EXISTS (SELECT * FROM dbo.DailyActionsMetadata WHERE MetadataType = 'Tracker')
BEGIN
    PRINT 'Inserting sample Tracker metadata...'
    
    INSERT INTO dbo.DailyActionsMetadata (MetadataType, Code, Name, Description, IsActive, DisplayOrder)
    VALUES
        ('Tracker', 'GOOGLE', 'Google', 'Google tracker', 1, 1),
        ('Tracker', 'FACEBOOK', 'Facebook', 'Facebook tracker', 1, 2),
        ('Tracker', 'AFFILIATE', 'Affiliate', 'Affiliate tracker', 1, 3),
        ('Tracker', 'EMAIL', 'Email', 'Email tracker', 1, 4),
        ('Tracker', 'DIRECT', 'Direct', 'Direct tracker', 1, 5);
    
    PRINT 'Sample Tracker metadata inserted successfully.'
END

PRINT 'Script completed successfully.'
