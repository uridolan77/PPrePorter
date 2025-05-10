using PPrePorter.CQRS.Common;

namespace PPrePorter.CQRS.Users.Queries
{
    /// <summary>
    /// Validator for the get user by ID query
    /// </summary>
    public class GetUserByIdQueryValidator : IValidator<GetUserByIdQuery>
    {
        /// <summary>
        /// Validates the query
        /// </summary>
        public Task<ValidationResult> ValidateAsync(GetUserByIdQuery query, CancellationToken cancellationToken = default)
        {
            var result = new ValidationResult();

            // Validate user ID
            if (query.Id <= 0)
            {
                result.Errors.Add(new ValidationFailure(nameof(query.Id), "User ID must be greater than 0"));
            }

            return Task.FromResult(result);
        }
    }
}
