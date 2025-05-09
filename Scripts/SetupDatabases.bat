@echo off
echo Setting up databases for PPrePorter...

echo Creating DailyActionsDB...
sqlcmd -S "(localdb)\MSSQLLocalDB" -i CreateDailyActionsDB.sql

echo Creating PPrePorterDB...
sqlcmd -S "(localdb)\MSSQLLocalDB" -i CreatePPrePorterDB.sql

echo Database setup completed!
pause
