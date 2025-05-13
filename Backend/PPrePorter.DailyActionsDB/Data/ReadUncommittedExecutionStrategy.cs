using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;
using System.Transactions;
using IExecutionStrategy = Microsoft.EntityFrameworkCore.Storage.IExecutionStrategy;
using TransactionIsolationLevel = System.Transactions.IsolationLevel;

namespace PPrePorter.DailyActionsDB.Data
{
    /// <summary>
    /// Custom execution strategy that uses READ UNCOMMITTED isolation level for all operations
    /// This achieves the same effect as NOLOCK hints but in a more reliable way
    /// </summary>
    public class ReadUncommittedExecutionStrategy : ExecutionStrategy
    {
        private readonly ILogger<ReadUncommittedExecutionStrategy>? _logger;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="context">The DbContext</param>
        /// <param name="maxRetryCount">Maximum number of retry attempts</param>
        /// <param name="maxRetryDelay">Maximum delay between retries</param>
        /// <param name="logger">Optional logger</param>
        public ReadUncommittedExecutionStrategy(
            DbContext context,
            int maxRetryCount,
            TimeSpan maxRetryDelay,
            ILogger<ReadUncommittedExecutionStrategy>? logger = null)
            : base(context, maxRetryCount, maxRetryDelay)
        {
            _logger = logger;
        }

        /// <summary>
        /// Execute the operation with READ UNCOMMITTED isolation level
        /// </summary>
        protected override bool ShouldRetryOn(Exception exception)
        {
            // Only retry on transient SQL exceptions
            return exception is Microsoft.Data.SqlClient.SqlException sqlException &&
                   IsTransient(sqlException);
        }

        /// <summary>
        /// Check if the exception is transient
        /// </summary>
        private bool IsTransient(Microsoft.Data.SqlClient.SqlException exception)
        {
            // Common transient error numbers
            // 4060: Cannot open database
            // 40197: The service has encountered an error processing your request
            // 40501: The service is currently busy
            // 40613: Database is currently unavailable
            // 49918: Cannot process request
            // 4221: The login to the SQL Server failed
            // 11001: Host not found
            // -2: Timeout expired
            foreach (Microsoft.Data.SqlClient.SqlError error in exception.Errors)
            {
                switch (error.Number)
                {
                    case 4060:
                    case 40197:
                    case 40501:
                    case 40613:
                    case 49918:
                    case 4221:
                    case 11001:
                    case -2:
                        return true;
                }
            }

            return false;
        }

        /// <summary>
        /// Execute the operation with READ UNCOMMITTED isolation level
        /// </summary>
        public override async Task<TResult> ExecuteAsync<TState, TResult>(
            TState state,
            Func<DbContext, TState, CancellationToken, Task<TResult>> operation,
            Func<DbContext, TState, CancellationToken, Task<ExecutionResult<TResult>>> verifySucceeded,
            CancellationToken cancellationToken)
        {
            // Use TransactionScope to set the isolation level to READ UNCOMMITTED
            using (var scope = new TransactionScope(
                TransactionScopeOption.Required,
                new TransactionOptions
                {
                    IsolationLevel = TransactionIsolationLevel.ReadUncommitted
                },
                TransactionScopeAsyncFlowOption.Enabled))
            {
                try
                {
                    _logger?.LogDebug("Executing operation with READ UNCOMMITTED isolation level");

                    // Execute the operation
                    var result = await base.ExecuteAsync(state, operation, verifySucceeded, cancellationToken);

                    // Complete the transaction scope
                    scope.Complete();

                    return result;
                }
                catch (Exception ex)
                {
                    _logger?.LogError(ex, "Error executing operation with READ UNCOMMITTED isolation level");
                    throw;
                }
            }
        }
    }
}
