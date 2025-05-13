using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Logging;
using System;
using System.Data.Common;
using System.Threading;
using System.Threading.Tasks;

namespace PPrePorter.Infrastructure.Data
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

                // Check if this is a query that should have NOLOCK hints forced on all tables
                bool forceNoLock = command.CommandText.Contains("FORCE_NOLOCK_ON_ALL_TABLES", System.StringComparison.OrdinalIgnoreCase);
                
                // If force is not enabled and the query already contains NOLOCK hint, skip modification
                if (!forceNoLock && command.CommandText.Contains("NOLOCK", System.StringComparison.OrdinalIgnoreCase))
                {
                    _logger?.LogDebug("SQL query already contains NOLOCK hint, skipping modification");
                    return;
                }

                try
                {
                    // Remove the FORCE_NOLOCK_ON_ALL_TABLES tag if present
                    if (forceNoLock)
                    {
                        command.CommandText = command.CommandText.Replace("FORCE_NOLOCK_ON_ALL_TABLES", "");
                        _logger?.LogDebug("Forcing NOLOCK hints on all tables in query");
                    }

                    // Use a more robust approach with regular expressions
                    // Match FROM clause with schema and table name in brackets
                    var regex = new System.Text.RegularExpressions.Regex(@"FROM\s+\[([^\]]+)\]\.\[([^\]]+)\](?!\s+WITH\s*\(NOLOCK\))");
                    command.CommandText = regex.Replace(command.CommandText, "FROM [$1].[$2] WITH (NOLOCK)");

                    // Match FROM clause with table name in brackets (no schema)
                    regex = new System.Text.RegularExpressions.Regex(@"FROM\s+\[([^\]\.]+)\](?!\s+WITH\s*\(NOLOCK\))");
                    command.CommandText = regex.Replace(command.CommandText, "FROM [$1] WITH (NOLOCK)");

                    // Match FROM clause with table name without brackets (for derived tables)
                    // Exclude function calls like OPENJSON, OPENXML, etc.
                    regex = new System.Text.RegularExpressions.Regex(@"FROM\s+(?!OPENJSON|OPENXML|OPENROWSET|OPENQUERY|FREETEXTTABLE|CONTAINSTABLE)([a-zA-Z0-9_]+)(?!\s+WITH\s*\(NOLOCK\))(?!\s+AS\s+)");
                    command.CommandText = regex.Replace(command.CommandText, "FROM $1 WITH (NOLOCK)");

                    // Match JOIN clause with schema and table name in brackets
                    regex = new System.Text.RegularExpressions.Regex(@"JOIN\s+\[([^\]]+)\]\.\[([^\]]+)\](?!\s+WITH\s*\(NOLOCK\))");
                    command.CommandText = regex.Replace(command.CommandText, "JOIN [$1].[$2] WITH (NOLOCK)");

                    // Match JOIN clause with table name in brackets (no schema)
                    regex = new System.Text.RegularExpressions.Regex(@"JOIN\s+\[([^\]\.]+)\](?!\s+WITH\s*\(NOLOCK\))");
                    command.CommandText = regex.Replace(command.CommandText, "JOIN [$1] WITH (NOLOCK)");

                    // Match JOIN clause with table name without brackets
                    regex = new System.Text.RegularExpressions.Regex(@"JOIN\s+(?!OPENJSON|OPENXML|OPENROWSET|OPENQUERY|FREETEXTTABLE|CONTAINSTABLE)([a-zA-Z0-9_]+)(?!\s+WITH\s*\(NOLOCK\))(?!\s+AS\s+)");
                    command.CommandText = regex.Replace(command.CommandText, "JOIN $1 WITH (NOLOCK)");

                    // Handle INNER JOIN clauses with schema and table name in brackets
                    regex = new System.Text.RegularExpressions.Regex(@"INNER\s+JOIN\s+\[([^\]]+)\]\.\[([^\]]+)\](?!\s+WITH\s*\(NOLOCK\))");
                    command.CommandText = regex.Replace(command.CommandText, "INNER JOIN [$1].[$2] WITH (NOLOCK)");

                    // Handle INNER JOIN clauses with table name in brackets (no schema)
                    regex = new System.Text.RegularExpressions.Regex(@"INNER\s+JOIN\s+\[([^\]\.]+)\](?!\s+WITH\s*\(NOLOCK\))");
                    command.CommandText = regex.Replace(command.CommandText, "INNER JOIN [$1] WITH (NOLOCK)");

                    // Handle INNER JOIN clauses with table name without brackets
                    // Exclude function calls like OPENJSON, OPENXML, etc.
                    regex = new System.Text.RegularExpressions.Regex(@"INNER\s+JOIN\s+(?!OPENJSON|OPENXML|OPENROWSET|OPENQUERY|FREETEXTTABLE|CONTAINSTABLE)([a-zA-Z0-9_]+)(?!\s+WITH\s*\(NOLOCK\))(?!\s+AS\s+)");
                    command.CommandText = regex.Replace(command.CommandText, "INNER JOIN $1 WITH (NOLOCK)");

                    // Handle LEFT JOIN clauses with schema and table name in brackets
                    regex = new System.Text.RegularExpressions.Regex(@"LEFT\s+JOIN\s+\[([^\]]+)\]\.\[([^\]]+)\](?!\s+WITH\s*\(NOLOCK\))");
                    command.CommandText = regex.Replace(command.CommandText, "LEFT JOIN [$1].[$2] WITH (NOLOCK)");

                    // Handle LEFT JOIN clauses with table name in brackets (no schema)
                    regex = new System.Text.RegularExpressions.Regex(@"LEFT\s+JOIN\s+\[([^\]\.]+)\](?!\s+WITH\s*\(NOLOCK\))");
                    command.CommandText = regex.Replace(command.CommandText, "LEFT JOIN [$1] WITH (NOLOCK)");

                    // Handle LEFT JOIN clauses with table name without brackets
                    // Exclude function calls like OPENJSON, OPENXML, etc.
                    regex = new System.Text.RegularExpressions.Regex(@"LEFT\s+JOIN\s+(?!OPENJSON|OPENXML|OPENROWSET|OPENQUERY|FREETEXTTABLE|CONTAINSTABLE)([a-zA-Z0-9_]+)(?!\s+WITH\s*\(NOLOCK\))(?!\s+AS\s+)");
                    command.CommandText = regex.Replace(command.CommandText, "LEFT JOIN $1 WITH (NOLOCK)");

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
