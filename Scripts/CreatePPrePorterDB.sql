-- Create PPrePorterDB database
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'PPrePorterDB')
BEGIN
    CREATE DATABASE PPrePorterDB;
END
GO

USE PPrePorterDB;
GO

-- Create Roles table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Roles')
BEGIN
    CREATE TABLE Roles (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(50) NOT NULL,
        Description NVARCHAR(255) NULL
    );
END
GO

-- Create Users table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Username NVARCHAR(50) NOT NULL,
        Email NVARCHAR(100) NOT NULL,
        PasswordHash NVARCHAR(255) NOT NULL,
        FirstName NVARCHAR(50) NULL,
        LastName NVARCHAR(50) NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME NOT NULL DEFAULT GETUTCDATE(),
        LastLogin DATETIME NULL,
        RoleId INT NOT NULL,
        RefreshToken NVARCHAR(255) NULL,
        RefreshTokenExpiryTime DATETIME NULL,
        CONSTRAINT FK_Users_Roles FOREIGN KEY (RoleId) REFERENCES Roles(Id)
    );
END
GO

-- Create WhiteLabels table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'WhiteLabels')
BEGIN
    CREATE TABLE WhiteLabels (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        LabelName NVARCHAR(100) NOT NULL,
        LabelCode NVARCHAR(50) NOT NULL,
        IsActive BIT NOT NULL DEFAULT 1
    );
END
GO

-- Create UserWhiteLabels table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserWhiteLabels')
BEGIN
    CREATE TABLE UserWhiteLabels (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NOT NULL,
        WhiteLabelId INT NOT NULL,
        AssignedAt DATETIME NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_UserWhiteLabels_Users FOREIGN KEY (UserId) REFERENCES Users(Id),
        CONSTRAINT FK_UserWhiteLabels_WhiteLabels FOREIGN KEY (WhiteLabelId) REFERENCES WhiteLabels(Id)
    );
END
GO

-- Create Players table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Players')
BEGIN
    CREATE TABLE Players (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Alias NVARCHAR(100) NOT NULL,
        CasinoId INT NOT NULL,
        IsActive BIT NOT NULL DEFAULT 1
    );
END
GO

-- Create Games table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Games')
BEGIN
    CREATE TABLE Games (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        GameName NVARCHAR(100) NOT NULL,
        Provider NVARCHAR(100) NOT NULL,
        GameType NVARCHAR(50) NOT NULL,
        IsActive BIT NOT NULL DEFAULT 1
    );
END
GO

-- Create Transactions table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Transactions')
BEGIN
    CREATE TABLE Transactions (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        PlayerId INT NOT NULL,
        TransactionDate DATETIME NOT NULL,
        TransactionType NVARCHAR(50) NOT NULL,
        TransactionAmount DECIMAL(18, 2) NOT NULL,
        CurrencyCode NVARCHAR(10) NOT NULL,
        Status NVARCHAR(50) NOT NULL,
        Platform NVARCHAR(50) NULL,
        PaymentMethod NVARCHAR(50) NULL,
        TransactionDetails NVARCHAR(MAX) NULL,
        TransactionSubDetails NVARCHAR(MAX) NULL,
        CONSTRAINT FK_Transactions_Players FOREIGN KEY (PlayerId) REFERENCES Players(Id)
    );
END
GO

-- Create UserPreferences table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserPreferences')
BEGIN
    CREATE TABLE UserPreferences (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NOT NULL,
        PreferenceKey NVARCHAR(100) NOT NULL,
        PreferenceValue NVARCHAR(MAX) NOT NULL,
        CreatedAt DATETIME NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_UserPreferences_Users FOREIGN KEY (UserId) REFERENCES Users(Id)
    );
END
GO

-- Create DailyActionGames table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DailyActionGames')
BEGIN
    CREATE TABLE DailyActionGames (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        PlayerId INT NOT NULL,
        GameId INT NOT NULL,
        Date DATE NOT NULL,
        BetAmount DECIMAL(18, 2) NOT NULL,
        WinAmount DECIMAL(18, 2) NOT NULL,
        CONSTRAINT FK_DailyActionGames_Players FOREIGN KEY (PlayerId) REFERENCES Players(Id),
        CONSTRAINT FK_DailyActionGames_Games FOREIGN KEY (GameId) REFERENCES Games(Id)
    );
END
GO

-- Insert sample data
-- Roles
IF NOT EXISTS (SELECT TOP 1 * FROM Roles)
BEGIN
    INSERT INTO Roles (Name, Description)
    VALUES 
        ('Admin', 'Administrator with full access'),
        ('Partner', 'Partner with limited access'),
        ('Subpartner', 'Subpartner with restricted access');
END
GO

-- WhiteLabels
IF NOT EXISTS (SELECT TOP 1 * FROM WhiteLabels)
BEGIN
    INSERT INTO WhiteLabels (LabelName, LabelCode, IsActive)
    VALUES 
        ('Casino Royale', 'CR', 1),
        ('Lucky Star', 'LS', 1),
        ('Golden Palace', 'GP', 1);
END
GO

-- Users
IF NOT EXISTS (SELECT TOP 1 * FROM Users)
BEGIN
    -- Password: Admin123!
    INSERT INTO Users (Username, Email, PasswordHash, FirstName, LastName, IsActive, CreatedAt, RoleId)
    VALUES 
        ('admin', 'admin@example.com', 'jGl25bVBBBW96Qi9Te4V37Fnqchz/Eu4qB9vKrRIqRg=', 'Admin', 'User', 1, GETUTCDATE(), 1),
        ('partner', 'partner@example.com', 'jGl25bVBBBW96Qi9Te4V37Fnqchz/Eu4qB9vKrRIqRg=', 'Partner', 'User', 1, GETUTCDATE(), 2),
        ('subpartner', 'subpartner@example.com', 'jGl25bVBBBW96Qi9Te4V37Fnqchz/Eu4qB9vKrRIqRg=', 'Subpartner', 'User', 1, GETUTCDATE(), 3);
END
GO

-- UserWhiteLabels
IF NOT EXISTS (SELECT TOP 1 * FROM UserWhiteLabels)
BEGIN
    INSERT INTO UserWhiteLabels (UserId, WhiteLabelId, AssignedAt)
    VALUES 
        (1, 1, GETUTCDATE()),
        (1, 2, GETUTCDATE()),
        (1, 3, GETUTCDATE()),
        (2, 1, GETUTCDATE()),
        (2, 2, GETUTCDATE()),
        (3, 1, GETUTCDATE());
END
GO

PRINT 'PPrePorterDB setup completed successfully.';
