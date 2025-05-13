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
    /// Interceptor that adds NOLOCK hint to stored procedure calls and raw SQL queries
    /// </summary>
    public class StoredProcedureNoLockInterceptor : DbCommandInterceptor
    {
        private readonly ILogger<StoredProcedureNoLockInterceptor>? _logger;

        public StoredProcedureNoLockInterceptor(ILogger<StoredProcedureNoLockInterceptor>? logger = null)
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
            // Skip if not a stored procedure or raw SQL query
            if (command.CommandType != System.Data.CommandType.StoredProcedure && 
                !command.CommandText.TrimStart().StartsWith("EXEC", StringComparison.OrdinalIgnoreCase) &&
                !command.CommandText.TrimStart().StartsWith("EXECUTE", StringComparison.OrdinalIgnoreCase))
            {
                return;
            }

            string originalSql = command.CommandText;

            try
            {
                // If it's a stored procedure call, we need to modify the SQL to add NOLOCK hints
                if (command.CommandType == System.Data.CommandType.StoredProcedure)
                {
                    // For stored procedures, we can't modify the SQL directly
                    // Instead, we'll add a WITH NOLOCK option parameter if the stored procedure supports it
                    if (!command.Parameters.Contains("@NOLOCK"))
                    {
                        var noLockParam = command.CreateParameter();
                        noLockParam.ParameterName = "@NOLOCK";
                        noLockParam.Value = 1;
                        command.Parameters.Add(noLockParam);
                        _logger?.LogDebug("Added @NOLOCK parameter to stored procedure {ProcedureName}", command.CommandText);
                    }
                }
                else if (command.CommandText.TrimStart().StartsWith("EXEC", StringComparison.OrdinalIgnoreCase) ||
                         command.CommandText.TrimStart().StartsWith("EXECUTE", StringComparison.OrdinalIgnoreCase))
                {
                    // For EXEC statements, we need to add NOLOCK hints to any table references
                    // This is more complex and might not work for all cases
                    // We'll use a simple approach to add NOLOCK hints to common patterns

                    // Add NOLOCK hints to FROM clauses
                    var fromRegex = new Regex(@"FROM\s+(\[?[a-zA-Z0-9_]+\]?\.?\[?[a-zA-Z0-9_]+\]?)(?!\s+WITH\s*\(NOLOCK\))", RegexOptions.IgnoreCase);
                    command.CommandText = fromRegex.Replace(command.CommandText, "FROM $1 WITH (NOLOCK)");

                    // Add NOLOCK hints to JOIN clauses
                    var joinRegex = new Regex(@"JOIN\s+(\[?[a-zA-Z0-9_]+\]?\.?\[?[a-zA-Z0-9_]+\]?)(?!\s+WITH\s*\(NOLOCK\))", RegexOptions.IgnoreCase);
                    command.CommandText = joinRegex.Replace(command.CommandText, "JOIN $1 WITH (NOLOCK)");

                    // Add NOLOCK parameter if not already present
                    if (command.CommandText.Contains("@NOLOCK") && !command.Parameters.Contains("@NOLOCK"))
                    {
                        var noLockParam = command.CreateParameter();
                        noLockParam.ParameterName = "@NOLOCK";
                        noLockParam.Value = 1;
                        command.Parameters.Add(noLockParam);
                        _logger?.LogDebug("Added @NOLOCK parameter to EXEC statement");
                    }
                }

                // Log the SQL transformation if it was modified
                if (originalSql != command.CommandText)
                {
                    _logger?.LogDebug("Applied NOLOCK hint to stored procedure or EXEC statement. Original: {OriginalSql}, Modified: {ModifiedSql}",
                        originalSql, command.CommandText);
                }
            }
            catch (Exception ex)
            {
                // If anything goes wrong, revert to the original SQL and log the error
                command.CommandText = originalSql;
                _logger?.LogError(ex, "Error applying NOLOCK hint to stored procedure or EXEC statement: {OriginalSql}", originalSql);
            }
        }
    }
}
