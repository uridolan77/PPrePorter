using MediatR;
using Microsoft.Extensions.Logging;
using System.Text;

namespace PPrePorter.CQRS.Common
{
    /// <summary>
    /// Pipeline behavior for validating commands and queries
    /// </summary>
    /// <typeparam name="TRequest">The type of the request</typeparam>
    /// <typeparam name="TResponse">The type of the response</typeparam>
    public class ValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
        where TRequest : IRequest<TResponse>
        where TResponse : class
    {
        private readonly IEnumerable<IValidator<TRequest>> _validators;
        private readonly ILogger<ValidationBehavior<TRequest, TResponse>> _logger;

        public ValidationBehavior(
            IEnumerable<IValidator<TRequest>> validators,
            ILogger<ValidationBehavior<TRequest, TResponse>> logger)
        {
            _validators = validators;
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
            // If there are no validators, continue
            if (!_validators.Any())
            {
                return await next();
            }

            // Get the request name for logging
            var requestName = typeof(TRequest).Name;

            _logger.LogInformation("Validating request {RequestName}", requestName);

            // Validate the request
            var validationResults = await Task.WhenAll(
                _validators.Select(v => v.ValidateAsync(request, cancellationToken)));

            // Get validation failures
            var failures = validationResults
                .SelectMany(r => r.Errors)
                .Where(f => f != null)
                .ToList();

            // If there are no failures, continue
            if (!failures.Any())
            {
                _logger.LogInformation("Validation successful for request {RequestName}", requestName);
                return await next();
            }

            // Log validation failures
            _logger.LogWarning("Validation failed for request {RequestName}. Errors: {Errors}",
                requestName, string.Join(", ", failures.Select(f => f.ErrorMessage)));

            // Create validation error response
            var responseType = typeof(TResponse);

            // Check if the response type is a BaseResponse
            if (responseType.IsSubclassOf(typeof(BaseResponse)) || responseType == typeof(BaseResponse))
            {
                // Create a failure response
                var errorMessage = BuildErrorMessage(failures);
                var response = Activator.CreateInstance(responseType) as BaseResponse;

                if (response != null)
                {
                    response.Success = false;
                    response.ErrorMessage = errorMessage;
                    return response as TResponse;
                }
            }

            // If the response type is not a BaseResponse, throw an exception
            throw new ValidationException(failures);
        }

        /// <summary>
        /// Builds an error message from validation failures
        /// </summary>
        private string BuildErrorMessage(IEnumerable<ValidationFailure> failures)
        {
            var sb = new StringBuilder();

            foreach (var failure in failures)
            {
                sb.AppendLine(failure.ErrorMessage);
            }

            return sb.ToString();
        }
    }

    /// <summary>
    /// Validation exception
    /// </summary>
    public class ValidationException : Exception
    {
        /// <summary>
        /// Gets the validation failures
        /// </summary>
        public IEnumerable<ValidationFailure> Failures { get; }

        /// <summary>
        /// Creates a new validation exception
        /// </summary>
        /// <param name="failures">The validation failures</param>
        public ValidationException(IEnumerable<ValidationFailure> failures)
            : base($"Validation failed: {string.Join(", ", failures.Select(f => f.ErrorMessage))}")
        {
            Failures = failures;
        }
    }

    /// <summary>
    /// Validator interface
    /// </summary>
    /// <typeparam name="T">The type to validate</typeparam>
    public interface IValidator<T>
    {
        /// <summary>
        /// Validates the specified instance
        /// </summary>
        /// <param name="instance">The instance to validate</param>
        /// <param name="cancellationToken">The cancellation token</param>
        /// <returns>The validation result</returns>
        Task<ValidationResult> ValidateAsync(T instance, CancellationToken cancellationToken = default);
    }

    /// <summary>
    /// Validation result
    /// </summary>
    public class ValidationResult
    {
        /// <summary>
        /// Gets the validation errors
        /// </summary>
        public IList<ValidationFailure> Errors { get; } = new List<ValidationFailure>();

        /// <summary>
        /// Gets whether the validation was successful
        /// </summary>
        public bool IsValid => !Errors.Any();
    }

    /// <summary>
    /// Validation failure
    /// </summary>
    public class ValidationFailure
    {
        /// <summary>
        /// Gets or sets the property name
        /// </summary>
        public string PropertyName { get; set; }

        /// <summary>
        /// Gets or sets the error message
        /// </summary>
        public string ErrorMessage { get; set; }

        /// <summary>
        /// Creates a new validation failure
        /// </summary>
        /// <param name="propertyName">The property name</param>
        /// <param name="errorMessage">The error message</param>
        public ValidationFailure(string propertyName, string errorMessage)
        {
            PropertyName = propertyName;
            ErrorMessage = errorMessage;
        }
    }
}
