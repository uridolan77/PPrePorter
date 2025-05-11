-- Script to create lookup tables for DailyActionsDB
-- This script creates the lookup tables and populates them with data from the existing tables

-- Create Gender lookup table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'tbl_Genders' AND schema_id = SCHEMA_ID('common'))
BEGIN
    CREATE TABLE common.tbl_Genders (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Code NVARCHAR(50) NOT NULL,
        Name NVARCHAR(100) NOT NULL,
        Description NVARCHAR(500) NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        DisplayOrder INT NOT NULL DEFAULT 0
    );
    
    -- Add index on Code for faster lookups
    CREATE UNIQUE INDEX IX_Genders_Code ON common.tbl_Genders(Code);
    
    -- Populate with data from Players table
    INSERT INTO common.tbl_Genders (Code, Name, IsActive, DisplayOrder)
    SELECT DISTINCT 
        Gender AS Code, 
        Gender AS Name, 
        1 AS IsActive,
        ROW_NUMBER() OVER (ORDER BY Gender) AS DisplayOrder
    FROM common.tbl_Daily_actions_players
    WHERE Gender IS NOT NULL AND Gender <> ''
    ORDER BY Gender;
    
    PRINT 'Created and populated common.tbl_Genders table';
END
ELSE
BEGIN
    PRINT 'common.tbl_Genders table already exists';
END
GO

-- Create Status lookup table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'tbl_Statuses' AND schema_id = SCHEMA_ID('common'))
BEGIN
    CREATE TABLE common.tbl_Statuses (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Code NVARCHAR(50) NOT NULL,
        Name NVARCHAR(100) NOT NULL,
        Description NVARCHAR(500) NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        DisplayOrder INT NOT NULL DEFAULT 0
    );
    
    -- Add index on Code for faster lookups
    CREATE UNIQUE INDEX IX_Statuses_Code ON common.tbl_Statuses(Code);
    
    -- Populate with data from Players table
    INSERT INTO common.tbl_Statuses (Code, Name, IsActive, DisplayOrder)
    SELECT DISTINCT 
        Status AS Code, 
        Status AS Name, 
        1 AS IsActive,
        ROW_NUMBER() OVER (ORDER BY Status) AS DisplayOrder
    FROM common.tbl_Daily_actions_players
    WHERE Status IS NOT NULL AND Status <> ''
    ORDER BY Status;
    
    PRINT 'Created and populated common.tbl_Statuses table';
END
ELSE
BEGIN
    PRINT 'common.tbl_Statuses table already exists';
END
GO

-- Create RegistrationPlayMode lookup table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'tbl_RegistrationPlayModes' AND schema_id = SCHEMA_ID('common'))
BEGIN
    CREATE TABLE common.tbl_RegistrationPlayModes (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Code NVARCHAR(50) NOT NULL,
        Name NVARCHAR(100) NOT NULL,
        Description NVARCHAR(500) NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        DisplayOrder INT NOT NULL DEFAULT 0
    );
    
    -- Add index on Code for faster lookups
    CREATE UNIQUE INDEX IX_RegistrationPlayModes_Code ON common.tbl_RegistrationPlayModes(Code);
    
    -- Populate with data from Players table
    INSERT INTO common.tbl_RegistrationPlayModes (Code, Name, IsActive, DisplayOrder)
    SELECT DISTINCT 
        RegistrationPlayMode AS Code, 
        RegistrationPlayMode AS Name, 
        1 AS IsActive,
        ROW_NUMBER() OVER (ORDER BY RegistrationPlayMode) AS DisplayOrder
    FROM common.tbl_Daily_actions_players
    WHERE RegistrationPlayMode IS NOT NULL AND RegistrationPlayMode <> ''
    ORDER BY RegistrationPlayMode;
    
    PRINT 'Created and populated common.tbl_RegistrationPlayModes table';
END
ELSE
BEGIN
    PRINT 'common.tbl_RegistrationPlayModes table already exists';
END
GO

-- Create Language lookup table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'tbl_Languages' AND schema_id = SCHEMA_ID('common'))
BEGIN
    CREATE TABLE common.tbl_Languages (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Code NVARCHAR(50) NOT NULL,
        Name NVARCHAR(100) NOT NULL,
        Description NVARCHAR(500) NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        DisplayOrder INT NOT NULL DEFAULT 0
    );
    
    -- Add index on Code for faster lookups
    CREATE UNIQUE INDEX IX_Languages_Code ON common.tbl_Languages(Code);
    
    -- Populate with data from Players table
    INSERT INTO common.tbl_Languages (Code, Name, IsActive, DisplayOrder)
    SELECT DISTINCT 
        Language AS Code, 
        Language AS Name, 
        1 AS IsActive,
        ROW_NUMBER() OVER (ORDER BY Language) AS DisplayOrder
    FROM common.tbl_Daily_actions_players
    WHERE Language IS NOT NULL AND Language <> ''
    ORDER BY Language;
    
    PRINT 'Created and populated common.tbl_Languages table';
END
ELSE
BEGIN
    PRINT 'common.tbl_Languages table already exists';
END
GO

-- Create Platform lookup table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'tbl_Platforms' AND schema_id = SCHEMA_ID('common'))
BEGIN
    CREATE TABLE common.tbl_Platforms (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Code NVARCHAR(50) NOT NULL,
        Name NVARCHAR(100) NOT NULL,
        Description NVARCHAR(500) NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        DisplayOrder INT NOT NULL DEFAULT 0
    );
    
    -- Add index on Code for faster lookups
    CREATE UNIQUE INDEX IX_Platforms_Code ON common.tbl_Platforms(Code);
    
    -- Populate with data from Players table
    INSERT INTO common.tbl_Platforms (Code, Name, IsActive, DisplayOrder)
    SELECT DISTINCT 
        RegisteredPlatform AS Code, 
        RegisteredPlatform AS Name, 
        1 AS IsActive,
        ROW_NUMBER() OVER (ORDER BY RegisteredPlatform) AS DisplayOrder
    FROM common.tbl_Daily_actions_players
    WHERE RegisteredPlatform IS NOT NULL AND RegisteredPlatform <> ''
    ORDER BY RegisteredPlatform;
    
    PRINT 'Created and populated common.tbl_Platforms table';
END
ELSE
BEGIN
    PRINT 'common.tbl_Platforms table already exists';
END
GO

-- Create Tracker lookup table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'tbl_Trackers' AND schema_id = SCHEMA_ID('common'))
BEGIN
    CREATE TABLE common.tbl_Trackers (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Code NVARCHAR(50) NOT NULL,
        Name NVARCHAR(100) NOT NULL,
        Description NVARCHAR(500) NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        DisplayOrder INT NOT NULL DEFAULT 0
    );
    
    -- Add index on Code for faster lookups
    CREATE UNIQUE INDEX IX_Trackers_Code ON common.tbl_Trackers(Code);
    
    -- Populate with data from Players table
    INSERT INTO common.tbl_Trackers (Code, Name, IsActive, DisplayOrder)
    SELECT DISTINCT 
        AffiliateID AS Code, 
        AffiliateID AS Name, 
        1 AS IsActive,
        ROW_NUMBER() OVER (ORDER BY AffiliateID) AS DisplayOrder
    FROM common.tbl_Daily_actions_players
    WHERE AffiliateID IS NOT NULL AND AffiliateID <> ''
    ORDER BY AffiliateID;
    
    PRINT 'Created and populated common.tbl_Trackers table';
END
ELSE
BEGIN
    PRINT 'common.tbl_Trackers table already exists';
END
GO
