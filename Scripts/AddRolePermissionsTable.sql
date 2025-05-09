-- Script to add RolePermissions table to PPrePorterDB
USE PPrePorterDB;
GO

-- Create RolePermissions table if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'RolePermissions')
BEGIN
    CREATE TABLE RolePermissions (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        RoleId INT NOT NULL,
        PermissionName NVARCHAR(100) NOT NULL,
        IsAllowed BIT NOT NULL DEFAULT 0,
        CONSTRAINT FK_RolePermissions_Roles FOREIGN KEY (RoleId) REFERENCES Roles(Id) ON DELETE CASCADE
    );
    
    PRINT 'RolePermissions table created successfully.';
END
ELSE
BEGIN
    PRINT 'RolePermissions table already exists.';
END
GO

-- Insert basic permissions for each role if the table is empty
IF NOT EXISTS (SELECT TOP 1 * FROM RolePermissions)
BEGIN
    -- Admin permissions (all permissions allowed)
    INSERT INTO RolePermissions (RoleId, PermissionName, IsAllowed)
    VALUES 
        -- Admin role (ID 1) - Full access
        (1, 'ViewDashboard', 1),
        (1, 'ViewReports', 1),
        (1, 'CreateReports', 1),
        (1, 'EditReports', 1),
        (1, 'DeleteReports', 1),
        (1, 'ExportReports', 1),
        (1, 'ManageUsers', 1),
        (1, 'ManageRoles', 1),
        (1, 'ManagePermissions', 1),
        (1, 'ViewPlayers', 1),
        (1, 'ManagePlayers', 1),
        (1, 'ViewWhiteLabels', 1),
        (1, 'ManageWhiteLabels', 1),
        (1, 'ViewTransactions', 1),
        (1, 'ViewGames', 1),
        
        -- Partner role (ID 2) - Limited access
        (2, 'ViewDashboard', 1),
        (2, 'ViewReports', 1),
        (2, 'CreateReports', 1),
        (2, 'EditReports', 1),
        (2, 'ExportReports', 1),
        (2, 'ViewPlayers', 1),
        (2, 'ViewWhiteLabels', 1),
        (2, 'ViewTransactions', 1),
        (2, 'ViewGames', 1),
        
        -- Subpartner role (ID 3) - Restricted access
        (3, 'ViewDashboard', 1),
        (3, 'ViewReports', 1),
        (3, 'ExportReports', 1),
        (3, 'ViewPlayers', 1),
        (3, 'ViewTransactions', 1),
        (3, 'ViewGames', 1);
        
    PRINT 'Basic permissions added for all roles.';
END
ELSE
BEGIN
    PRINT 'Permissions already exist in the RolePermissions table.';
END
GO

PRINT 'RolePermissions setup completed successfully.';
GO
