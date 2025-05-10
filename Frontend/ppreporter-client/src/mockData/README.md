# Mock Data for UI Testing

This directory contains mock data used for UI testing when the `USE_MOCK_DATA_FOR_UI_TESTING` flag is enabled in `src/config/constants.ts`.

## Purpose

The mock data allows developers to:
- Test UI components without a running backend server
- Develop new features with consistent data
- Test edge cases and error scenarios
- Run demos without backend dependencies

## Structure

The mock data is organized by feature/endpoint:

- `/auth` - Authentication-related mock data
- `/dashboard` - Dashboard-related mock data
- `/reports` - Reports-related mock data
- `/players` - Player-related mock data
- `/games` - Game-related mock data
- `/transactions` - Transaction-related mock data
- `/naturalLanguage` - Natural language query mock data

## Usage

To use mock data in development:

1. Ensure the `USE_MOCK_DATA_FOR_UI_TESTING` flag is set to `true` in `src/config/constants.ts`
2. The mock data service will automatically intercept API calls and return the appropriate mock data

## Adding New Mock Data

When adding new mock data:

1. Place it in the appropriate directory based on the feature
2. Follow the naming convention: `endpoint-name.ts` (e.g., `login.ts`, `dashboard-stats.ts`)
3. Export the mock data with a descriptive name
4. Update the mock data index file for the feature

## Disabling Mock Data

To disable mock data and use real API calls:

1. Set the `USE_MOCK_DATA_FOR_UI_TESTING` flag to `false` in `src/config/constants.ts`
