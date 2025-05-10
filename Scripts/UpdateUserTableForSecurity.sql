-- Script to update the Users table with security-related columns
-- This script adds columns for tracking failed login attempts and account lockout

-- Check if the FailedLoginAttempts column exists, if not add it
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Users') AND name = 'FailedLoginAttempts')
BEGIN
    ALTER TABLE dbo.Users
    ADD FailedLoginAttempts INT NOT NULL DEFAULT 0;
    
    PRINT 'Added FailedLoginAttempts column to Users table';
END
ELSE
BEGIN
    PRINT 'FailedLoginAttempts column already exists in Users table';
END

-- Check if the LockoutEnd column exists, if not add it
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Users') AND name = 'LockoutEnd')
BEGIN
    ALTER TABLE dbo.Users
    ADD LockoutEnd DATETIME NULL;
    
    PRINT 'Added LockoutEnd column to Users table';
END
ELSE
BEGIN
    PRINT 'LockoutEnd column already exists in Users table';
END

-- Check if the LastFailedLoginAttempt column exists, if not add it
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Users') AND name = 'LastFailedLoginAttempt')
BEGIN
    ALTER TABLE dbo.Users
    ADD LastFailedLoginAttempt DATETIME NULL;
    
    PRINT 'Added LastFailedLoginAttempt column to Users table';
END
ELSE
BEGIN
    PRINT 'LastFailedLoginAttempt column already exists in Users table';
END

PRINT 'User table update for security enhancements completed successfully';
