# PPrePorter.ExporterScheduler

## Overview

The ExporterScheduler is a comprehensive library for exporting and scheduling reports in various formats with notification capabilities. It provides a robust framework for:

1. **Report Exporting**: Export data to various formats (Excel, PDF, CSV, JSON)
2. **Scheduling**: Schedule reports to be generated and distributed automatically
3. **Notifications**: Send notifications via different channels (Email, SMS, In-App)

## Current Status

This project is currently **not integrated** with the main PPrePorter application. It is included in the solution as a planned future enhancement but is not referenced by any other project.

## Features

- **Multiple Export Formats**: Support for Excel, PDF, CSV, and JSON exports
- **Flexible Scheduling**: Support for daily, weekly, monthly, and custom schedules using Quartz.NET
- **Notification Channels**: Email (SendGrid), SMS (Twilio), and In-App notifications
- **Execution History**: Track execution history and status of scheduled reports
- **Dependency Injection**: Full support for ASP.NET Core dependency injection

## Integration Plan

To integrate this project with the main application:

1. Add a project reference to PPrePorter.API
2. Register services in Program.cs using the `AddExporterScheduler` extension method
3. Create controllers for managing schedules and triggering exports
4. Update existing report controllers to use the exporter functionality

## Architecture

The project follows a clean architecture approach with:

- **Interfaces**: Clear separation of concerns with well-defined interfaces
- **Services**: Implementation of business logic
- **Repositories**: Data access layer
- **Models**: Domain models for schedules, exports, and notifications
- **Exporters**: Implementations for different export formats

## Key Components

- **ExporterFactory**: Creates appropriate exporters based on the requested format
- **SchedulingEngine**: Manages schedules using Quartz.NET
- **NotificationServiceFactory**: Creates appropriate notification services
- **ExportJob**: Executes scheduled exports
- **ScheduleService**: Manages schedule configurations

## Dependencies

- **Quartz.NET**: For scheduling
- **EPPlus**: For Excel exports
- **iTextSharp**: For PDF exports
- **CsvHelper**: For CSV exports
- **SendGrid**: For email notifications
- **Twilio**: For SMS notifications

## Future Work

Before integration, the following tasks should be completed:

1. Update to use the latest version of dependencies
2. Add comprehensive unit tests
3. Implement integration with the current reporting system
4. Add UI components for schedule management
5. Implement proper error handling and logging
6. Add support for more export formats and notification channels

## Usage Example (Future)

```csharp
// Register services
services.AddExporterScheduler(configuration, options =>
{
    options.EnableScheduler = true;
    options.DatabaseConnectionString = "your_connection_string";
});

// Create a schedule
var schedule = new ScheduleConfiguration
{
    Name = "Daily Sales Report",
    ReportName = "SalesReport",
    Frequency = ScheduleFrequency.Daily,
    TimeOfDay = new TimeSpan(8, 0, 0), // 8:00 AM
    Format = ExportFormat.Excel,
    Filters = new Dictionary<string, object>
    {
        { "StartDate", DateTime.Today.AddDays(-1) },
        { "EndDate", DateTime.Today }
    }
};

// Add notification
schedule.Notifications.Add(new NotificationConfiguration
{
    Channel = NotificationChannel.Email,
    Recipients = "user@example.com",
    Subject = "Daily Sales Report"
});

// Save schedule
await scheduleService.CreateScheduleAsync(schedule);
```
