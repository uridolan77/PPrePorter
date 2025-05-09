using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Logging;
using System;
using System.Data.Common;
using System.Threading;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Data
{
    /// <summary>
    /// Interceptor that adds NOLOCK hint to all SELECT queries
    /// </summary>
    public class NoLockInterceptor : DbCommandInterceptor
    {
        private readonly ILogger<NoLockInterceptor>? _logger;

        public NoLockInterceptor(ILogger<NoLockInterceptor>? logger = null)
        {
            _logger = logger;
        }
        public override InterceptionResult<DbDataReader> ReaderExecuting(
            DbCommand command,
            CommandEventData eventData,
            InterceptionResult<DbDataReader> result)
        {
            ApplyNoLockHint(command);
            return result;
        }

        public override ValueTask<InterceptionResult<DbDataReader>> ReaderExecutingAsync(
            DbCommand command,
            CommandEventData eventData,
            InterceptionResult<DbDataReader> result,
            CancellationToken cancellationToken = default)
        {
            ApplyNoLockHint(command);
            return ValueTask.FromResult(result);
        }

        private void ApplyNoLockHint(DbCommand command)
        {
            // Only apply to SELECT statements
            if (command.CommandText.TrimStart().StartsWith("SELECT", System.StringComparison.OrdinalIgnoreCase))
            {
                string originalSql = command.CommandText;

                // Skip if the query already contains NOLOCK hint
                if (command.CommandText.Contains("NOLOCK", System.StringComparison.OrdinalIgnoreCase))
                {
                    _logger?.LogDebug("SQL query already contains NOLOCK hint, skipping modification");
                    return;
                }

                try
                {
                    // Use a more robust approach with regular expressions
                    var regex = new System.Text.RegularExpressions.Regex(@"FROM\s+\[([^\]]+)\](?!\s+WITH\s*\(NOLOCK\))");
                    command.CommandText = regex.Replace(command.CommandText, "FROM [$1] WITH (NOLOCK)");

                    // Handle JOIN clauses
                    regex = new System.Text.RegularExpressions.Regex(@"JOIN\s+\[([^\]]+)\](?!\s+WITH\s*\(NOLOCK\))");
                    command.CommandText = regex.Replace(command.CommandText, "JOIN [$1] WITH (NOLOCK)");

                    // Handle INNER JOIN clauses
                    regex = new System.Text.RegularExpressions.Regex(@"INNER\s+JOIN\s+\[([^\]]+)\](?!\s+WITH\s*\(NOLOCK\))");
                    command.CommandText = regex.Replace(command.CommandText, "INNER JOIN [$1] WITH (NOLOCK)");

                    // Handle LEFT JOIN clauses
                    regex = new System.Text.RegularExpressions.Regex(@"LEFT\s+JOIN\s+\[([^\]]+)\](?!\s+WITH\s*\(NOLOCK\))");
                    command.CommandText = regex.Replace(command.CommandText, "LEFT JOIN [$1] WITH (NOLOCK)");

                    // Handle RIGHT JOIN clauses
                    regex = new System.Text.RegularExpressions.Regex(@"RIGHT\s+JOIN\s+\[([^\]]+)\](?!\s+WITH\s*\(NOLOCK\))");
                    command.CommandText = regex.Replace(command.CommandText, "RIGHT JOIN [$1] WITH (NOLOCK)");

                    // Log the SQL transformation if it was modified
                    if (originalSql != command.CommandText)
                    {
                        _logger?.LogDebug("Applied NOLOCK hint to SQL query. Original: {OriginalSql}, Modified: {ModifiedSql}",
                            originalSql, command.CommandText);
                    }
                }
                catch (Exception ex)
                {
                    // If anything goes wrong, revert to the original SQL and log the error
                    command.CommandText = originalSql;
                    _logger?.LogError(ex, "Error applying NOLOCK hint to SQL query: {OriginalSql}", originalSql);
                }
            }
        }
    }
}
