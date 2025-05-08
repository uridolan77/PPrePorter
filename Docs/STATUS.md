Backend Features (in PPrePorter.API)
Authentication: For JWT authentication, user login, and token management
Dashboard: For summary statistics, KPIs, and data visualization endpoints
Reports: For customizable reporting functionality
Export: For handling report exports in various formats
Notifications: For real-time and scheduled notifications
UserManagement: For user, role, and permission management
Frontend Features (in ppreporter-client/src)
authentication: Login, logout, and authentication state management
dashboard: Interactive dashboards with charts and KPI displays
reports: Report creation, customization, and viewing
export: Export functionality for reports in different formats
notifications: In-app notification components and services
user-management: User profile, role assignment, and access control UI

Added all projects to the PPrePorter solution
Established the correct project references following clean architecture:
API references Core and Infrastructure
Core references Domain
Infrastructure references Core and Domain
Added Entity Framework Core packages:
Microsoft.EntityFrameworkCore.SqlServer (version 9.0.4)
Microsoft.EntityFrameworkCore.Tools (version 9.0.4)
Microsoft.EntityFrameworkCore.Design (version 9.0.4)

Now that I've updated the User entity with the RefreshToken properties, let's configure the JWT authentication in our Program.cs file to complete our authentication setup. We need to add the JWT configuration to our application and register the JwtService.

GitHub Copilot
I'll configure the JWT authentication in your Program.cs file and update the appsettings.json to include the JWT settings. Let's start with adding the JWT configuration to your appsettings.json