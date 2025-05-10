-- Check if the common schema exists and create it if it doesn't
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'common')
BEGIN
    EXEC('CREATE SCHEMA common');
    PRINT 'Created schema: common';
END
ELSE
BEGIN
    PRINT 'Schema common already exists';
END

-- Check if the tbl_Daily_actions table exists in the common schema
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'tbl_Daily_actions' AND schema_id = SCHEMA_ID('common'))
BEGIN
    -- Create the tbl_Daily_actions table in the common schema
    CREATE TABLE common.tbl_Daily_actions (
        ID bigint IDENTITY(1,1) PRIMARY KEY,
        Date datetime NOT NULL,
        WhiteLabelID smallint NULL,
        PlayerID bigint NULL,
        Registration tinyint NULL,
        FTD tinyint NULL,
        FTDA tinyint NULL,
        Deposits money NULL,
        PaidCashouts money NULL,
        BetsCasino money NULL,
        WinsCasino money NULL,
        BetsSport money NULL,
        WinsSport money NULL,
        BetsLive money NULL,
        WinsLive money NULL,
        BetsBingo money NULL,
        WinsBingo money NULL
    );
    PRINT 'Created table: common.tbl_Daily_actions';
    
    -- Insert some sample data
    INSERT INTO common.tbl_Daily_actions (Date, WhiteLabelID, Registration, FTD, Deposits, PaidCashouts, BetsCasino, WinsCasino)
    VALUES 
        ('2023-01-01', 1, 100, 50, 10000.00, 5000.00, 20000.00, 18000.00),
        ('2023-01-02', 1, 120, 60, 12000.00, 6000.00, 22000.00, 19000.00),
        ('2023-01-03', 1, 90, 45, 9000.00, 4500.00, 18000.00, 16000.00),
        ('2023-01-01', 2, 80, 40, 8000.00, 4000.00, 16000.00, 14000.00),
        ('2023-01-02', 2, 95, 48, 9500.00, 4800.00, 19000.00, 17000.00),
        ('2023-01-03', 2, 110, 55, 11000.00, 5500.00, 22000.00, 20000.00);
    PRINT 'Inserted sample data into common.tbl_Daily_actions';
END
ELSE
BEGIN
    PRINT 'Table common.tbl_Daily_actions already exists';
END

-- Check if the tbl_White_labels table exists in the common schema
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'tbl_White_labels' AND schema_id = SCHEMA_ID('common'))
BEGIN
    -- Create the tbl_White_labels table in the common schema
    CREATE TABLE common.tbl_White_labels (
        LabelID int IDENTITY(1,1) PRIMARY KEY,
        Name nvarchar(50) NOT NULL,
        Url nvarchar(100) NOT NULL,
        UrlName nvarchar(50) NULL,
        Code nvarchar(50) NULL,
        DefaultLanguage nvarchar(50) NULL,
        IsActive bit NULL
    );
    PRINT 'Created table: common.tbl_White_labels';
    
    -- Insert some sample data
    INSERT INTO common.tbl_White_labels (Name, Url, UrlName, Code, DefaultLanguage, IsActive)
    VALUES 
        ('White Label 1', 'https://whitelabel1.com', 'WhiteLabel1', 'WL1', 'en', 1),
        ('White Label 2', 'https://whitelabel2.com', 'WhiteLabel2', 'WL2', 'en', 1);
    PRINT 'Inserted sample data into common.tbl_White_labels';
END
ELSE
BEGIN
    PRINT 'Table common.tbl_White_labels already exists';
END

-- Check if the tbl_Countries table exists in the common schema
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'tbl_Countries' AND schema_id = SCHEMA_ID('common'))
BEGIN
    -- Create the tbl_Countries table in the common schema
    CREATE TABLE common.tbl_Countries (
        CountryID int IDENTITY(1,1) PRIMARY KEY,
        CountryName nvarchar(100) NOT NULL,
        IsoCode nvarchar(2) NULL,
        IsActive bit NULL
    );
    PRINT 'Created table: common.tbl_Countries';
    
    -- Insert some sample data
    INSERT INTO common.tbl_Countries (CountryName, IsoCode, IsActive)
    VALUES 
        ('United States', 'US', 1),
        ('United Kingdom', 'GB', 1),
        ('Germany', 'DE', 1),
        ('France', 'FR', 1),
        ('Spain', 'ES', 1);
    PRINT 'Inserted sample data into common.tbl_Countries';
END
ELSE
BEGIN
    PRINT 'Table common.tbl_Countries already exists';
END

-- Check if the tbl_Currencies table exists in the common schema
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'tbl_Currencies' AND schema_id = SCHEMA_ID('common'))
BEGIN
    -- Create the tbl_Currencies table in the common schema
    CREATE TABLE common.tbl_Currencies (
        CurrencyID tinyint IDENTITY(1,1) PRIMARY KEY,
        CurrencyName nvarchar(50) NOT NULL,
        CurrencyCode nvarchar(3) NOT NULL,
        CurrencySymbol nvarchar(5) NULL
    );
    PRINT 'Created table: common.tbl_Currencies';
    
    -- Insert some sample data
    INSERT INTO common.tbl_Currencies (CurrencyName, CurrencyCode, CurrencySymbol)
    VALUES 
        ('US Dollar', 'USD', '$'),
        ('Euro', 'EUR', '€'),
        ('British Pound', 'GBP', '£'),
        ('Japanese Yen', 'JPY', '¥'),
        ('Canadian Dollar', 'CAD', 'C$');
    PRINT 'Inserted sample data into common.tbl_Currencies';
END
ELSE
BEGIN
    PRINT 'Table common.tbl_Currencies already exists';
END

PRINT 'Schema and tables setup completed successfully.';
