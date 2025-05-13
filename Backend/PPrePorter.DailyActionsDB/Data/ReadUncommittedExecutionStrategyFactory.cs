using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Logging;
using System;

namespace PPrePorter.DailyActionsDB.Data
{
    /// <summary>
    /// Factory for creating ReadUncommittedExecutionStrategy instances
    /// </summary>
    public class ReadUncommittedExecutionStrategyFactory : IExecutionStrategyFactory
    {
        private readonly ILoggerFactory? _loggerFactory;
        private readonly ExecutionStrategyDependencies _dependencies;
        private readonly int _maxRetryCount;
        private readonly TimeSpan _maxRetryDelay;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="dependencies">Execution strategy dependencies</param>
        /// <param name="maxRetryCount">Maximum number of retry attempts</param>
        /// <param name="maxRetryDelay">Maximum delay between retries</param>
        /// <param name="loggerFactory">Optional logger factory</param>
        public ReadUncommittedExecutionStrategyFactory(
            ExecutionStrategyDependencies dependencies,
            int maxRetryCount = 3,
            int maxRetryDelaySeconds = 30,
            ILoggerFactory? loggerFactory = null)
        {
            _dependencies = dependencies ?? throw new ArgumentNullException(nameof(dependencies));
            _maxRetryCount = maxRetryCount;
            _maxRetryDelay = TimeSpan.FromSeconds(maxRetryDelaySeconds);
            _loggerFactory = loggerFactory;
        }

        /// <summary>
        /// Create a new execution strategy
        /// </summary>
        /// <returns>The execution strategy</returns>
        public IExecutionStrategy Create()
        {
            var logger = _loggerFactory?.CreateLogger<ReadUncommittedExecutionStrategy>();
            return new ReadUncommittedExecutionStrategy(
                _dependencies.CurrentContext.Context,
                _maxRetryCount,
                _maxRetryDelay,
                logger);
        }
    }
}
