using MediatR;
using Microsoft.Extensions.Logging;
using System.Diagnostics;

namespace PPrePorter.CQRS.Common
{
    /// <summary>
    /// Pipeline behavior for logging commands and queries
    /// </summary>
    /// <typeparam name="TRequest">The type of the request</typeparam>
    /// <typeparam name="TResponse">The type of the response</typeparam>
    public class LoggingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
        where TRequest : IRequest<TResponse>
    {
        private readonly ILogger<LoggingBehavior<TRequest, TResponse>> _logger;

        public LoggingBehavior(ILogger<LoggingBehavior<TRequest, TResponse>> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Handles the request
        /// </summary>
        public async Task<TResponse> Handle(
            TRequest request,
            RequestHandlerDelegate<TResponse> next,
            CancellationToken cancellationToken)
        {
            // Get the request name for logging
            var requestName = typeof(TRequest).Name;

            _logger.LogInformation("Handling {RequestName}", requestName);

            // Start the stopwatch
            var sw = Stopwatch.StartNew();

            try
            {
                // Handle the request
                var response = await next();

                // Stop the stopwatch
                sw.Stop();

                // Log the response
                _logger.LogInformation("Handled {RequestName} in {ElapsedMilliseconds}ms",
                    requestName, sw.ElapsedMilliseconds);

                return response;
            }
            catch (Exception ex)
            {
                // Stop the stopwatch
                sw.Stop();

                // Log the exception
                _logger.LogError(ex, "Error handling {RequestName} after {ElapsedMilliseconds}ms",
                    requestName, sw.ElapsedMilliseconds);

                throw;
            }
        }
    }
}
