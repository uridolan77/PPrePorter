-- Update the admin user's password hash
USE PPrePorterDB;
GO

-- Update the password hash for the admin user
-- New hash for "Admin123!" is PrP+ZrMeO00Q+nC1ytSccRIpSvauTkdqHEBRVdRaoSE=
UPDATE Users
SET PasswordHash = 'PrP+ZrMeO00Q+nC1ytSccRIpSvauTkdqHEBRVdRaoSE='
WHERE Username = 'admin';

-- Verify the update
SELECT Username, PasswordHash FROM Users WHERE Username = 'admin';
