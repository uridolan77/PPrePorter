-- Create DailyActionsDB database
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'DailyActionsDB')
BEGIN
    CREATE DATABASE DailyActionsDB;
END
GO

USE DailyActionsDB;
GO

-- Create Transaction table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Transactions')
BEGIN
    CREATE TABLE Transactions (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        TransactionId NVARCHAR(50) NOT NULL,
        TransactionDate DATETIME NOT NULL,
        PlayerId NVARCHAR(50) NOT NULL,
        WhitelabelId NVARCHAR(50) NOT NULL,
        GameId NVARCHAR(50) NULL,
        GameName NVARCHAR(100) NULL,
        Amount DECIMAL(18, 2) NOT NULL,
        TransactionType NVARCHAR(50) NOT NULL,
        Currency NVARCHAR(10) NOT NULL
    );
END
GO

-- Create DailyActions table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DailyActions')
BEGIN
    CREATE TABLE DailyActions (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        WhiteLabelID INT NOT NULL,
        Date DATE NOT NULL,
        Registration INT NOT NULL DEFAULT 0,
        FTD INT NOT NULL DEFAULT 0,
        Deposits DECIMAL(18, 2) NULL,
        PaidCashouts DECIMAL(18, 2) NULL,
        BetsCasino DECIMAL(18, 2) NULL,
        WinsCasino DECIMAL(18, 2) NULL,
        BetsSport DECIMAL(18, 2) NULL,
        WinsSport DECIMAL(18, 2) NULL,
        BetsLive DECIMAL(18, 2) NULL,
        WinsLive DECIMAL(18, 2) NULL,
        BetsBingo DECIMAL(18, 2) NULL,
        WinsBingo DECIMAL(18, 2) NULL
    );
END
GO

-- Insert sample data
IF NOT EXISTS (SELECT TOP 1 * FROM DailyActions)
BEGIN
    INSERT INTO DailyActions (WhiteLabelID, Date, Registration, FTD, Deposits, PaidCashouts, BetsCasino, WinsCasino)
    VALUES 
        (1, '2023-01-01', 100, 50, 10000.00, 5000.00, 20000.00, 18000.00),
        (1, '2023-01-02', 120, 60, 12000.00, 6000.00, 22000.00, 19000.00),
        (1, '2023-01-03', 90, 45, 9000.00, 4500.00, 18000.00, 16000.00),
        (2, '2023-01-01', 80, 40, 8000.00, 4000.00, 16000.00, 14000.00),
        (2, '2023-01-02', 95, 48, 9500.00, 4800.00, 19000.00, 17000.00),
        (2, '2023-01-03', 110, 55, 11000.00, 5500.00, 22000.00, 20000.00);
END
GO

-- Insert sample transaction data
IF NOT EXISTS (SELECT TOP 1 * FROM Transactions)
BEGIN
    INSERT INTO Transactions (TransactionId, TransactionDate, PlayerId, WhitelabelId, GameId, GameName, Amount, TransactionType, Currency)
    VALUES 
        ('T1001', '2023-01-01 10:15:00', 'P1001', 'WL1', 'G1001', 'Starburst', 100.00, 'Deposit', 'USD'),
        ('T1002', '2023-01-01 11:30:00', 'P1001', 'WL1', 'G1002', 'Gonzo''s Quest', 50.00, 'Bet', 'USD'),
        ('T1003', '2023-01-01 11:45:00', 'P1001', 'WL1', 'G1002', 'Gonzo''s Quest', 75.00, 'Win', 'USD'),
        ('T1004', '2023-01-01 14:20:00', 'P1002', 'WL1', 'G1003', 'Book of Dead', 200.00, 'Deposit', 'USD'),
        ('T1005', '2023-01-01 15:10:00', 'P1002', 'WL1', 'G1003', 'Book of Dead', 100.00, 'Bet', 'USD'),
        ('T1006', '2023-01-01 15:25:00', 'P1002', 'WL1', 'G1003', 'Book of Dead', 180.00, 'Win', 'USD'),
        ('T1007', '2023-01-02 09:30:00', 'P1003', 'WL2', 'G1001', 'Starburst', 150.00, 'Deposit', 'USD'),
        ('T1008', '2023-01-02 10:15:00', 'P1003', 'WL2', 'G1001', 'Starburst', 75.00, 'Bet', 'USD'),
        ('T1009', '2023-01-02 10:30:00', 'P1003', 'WL2', 'G1001', 'Starburst', 125.00, 'Win', 'USD'),
        ('T1010', '2023-01-02 13:45:00', 'P1004', 'WL2', 'G1004', 'Dead or Alive', 300.00, 'Deposit', 'USD');
END
GO

PRINT 'DailyActionsDB setup completed successfully.';
