using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Logging;
using System;
using System.Data.Common;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Data
{
    /// <summary>
    /// Interceptor that adds NOLOCK hints to all tables in SQL queries
    /// This is a more robust implementation that handles complex SQL queries
    /// </summary>
    public class SqlNoLockInterceptor : DbCommandInterceptor
    {
        private readonly ILogger<SqlNoLockInterceptor>? _logger;

        // Regular expressions for matching table references in SQL queries
        private static readonly Regex _fromRegex = new Regex(
            @"FROM\s+(?:\[(?<schema>\w+)\]\.)?(?:\[(?<table>\w+)\]|\[?(?<table>\w+)\]?)\s+(?:AS\s+)?(?:\[?(?<alias>\w+)\]?)?",
            RegexOptions.Compiled | RegexOptions.IgnoreCase | RegexOptions.Multiline);

        private static readonly Regex _joinRegex = new Regex(
            @"JOIN\s+(?:\[(?<schema>\w+)\]\.)?(?:\[(?<table>\w+)\]|\[?(?<table>\w+)\]?)\s+(?:AS\s+)?(?:\[?(?<alias>\w+)\]?)?",
            RegexOptions.Compiled | RegexOptions.IgnoreCase | RegexOptions.Multiline);

        /// <summary>
        /// Creates a new instance of SqlNoLockInterceptor
        /// </summary>
        /// <param name="logger">Optional logger for diagnostic information</param>
        public SqlNoLockInterceptor(ILogger<SqlNoLockInterceptor>? logger = null)
        {
            _logger = logger;
        }

        /// <summary>
        /// Intercepts the command before it is executed and adds NOLOCK hints
        /// </summary>
        public override InterceptionResult<DbDataReader> ReaderExecuting(
            DbCommand command,
            CommandEventData eventData,
            InterceptionResult<DbDataReader> result)
        {
            ModifySqlCommand(command);
            return result;
        }

        /// <summary>
        /// Intercepts the command before it is executed asynchronously and adds NOLOCK hints
        /// </summary>
        public override ValueTask<InterceptionResult<DbDataReader>> ReaderExecutingAsync(
            DbCommand command,
            CommandEventData eventData,
            InterceptionResult<DbDataReader> result,
            CancellationToken cancellationToken = default)
        {
            ModifySqlCommand(command);
            return ValueTask.FromResult(result);
        }

        /// <summary>
        /// Modifies the SQL command to add NOLOCK hints to all tables
        /// </summary>
        private void ModifySqlCommand(DbCommand command)
        {
            if (command?.CommandText == null)
                return;

            string sql = command.CommandText;

            // Only modify SELECT statements
            if (!sql.TrimStart().StartsWith("SELECT", StringComparison.OrdinalIgnoreCase))
                return;

            // Check if this command should use NOLOCK hints
            bool shouldApply = sql.Contains("FORCE_NOLOCK_ON_ALL_TABLES", StringComparison.OrdinalIgnoreCase);

            if (shouldApply)
            {
                try
                {
                    string originalSql = sql;
                    string modifiedSql = AddNoLockHintsToSql(originalSql);

                    if (originalSql != modifiedSql)
                    {
                        command.CommandText = modifiedSql;
                        _logger?.LogDebug("Applied NOLOCK hints to SQL query");
                    }
                }
                catch (Exception ex)
                {
                    // Log the error but don't throw it to avoid breaking the query
                    _logger?.LogError(ex, "Error applying NOLOCK hints to SQL query");
                }
            }
        }

        /// <summary>
        /// Adds NOLOCK hints to all tables in the SQL query
        /// </summary>
        private string AddNoLockHintsToSql(string sql)
        {
            try
            {
                // Remove the FORCE_NOLOCK_ON_ALL_TABLES comment
                sql = Regex.Replace(sql, @"--\s*FORCE_NOLOCK_ON_ALL_TABLES", "", RegexOptions.IgnoreCase);

                // Add NOLOCK hints to FROM clauses
                sql = _fromRegex.Replace(sql, match =>
                {
                    string schema = match.Groups["schema"].Success ? match.Groups["schema"].Value : "dbo";
                    string table = match.Groups["table"].Value;
                    string alias = match.Groups["alias"].Success ? match.Groups["alias"].Value : table;

                    return $"FROM [{schema}].[{table}] AS [{alias}] WITH (NOLOCK)";
                });

                // Add NOLOCK hints to JOIN clauses
                sql = _joinRegex.Replace(sql, match =>
                {
                    string schema = match.Groups["schema"].Success ? match.Groups["schema"].Value : "dbo";
                    string table = match.Groups["table"].Value;
                    string alias = match.Groups["alias"].Success ? match.Groups["alias"].Value : table;

                    return $"JOIN [{schema}].[{table}] AS [{alias}] WITH (NOLOCK)";
                });

                return sql;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error adding NOLOCK hints to SQL query");
                return sql; // Return original SQL if there's an error
            }
        }
    }
}
