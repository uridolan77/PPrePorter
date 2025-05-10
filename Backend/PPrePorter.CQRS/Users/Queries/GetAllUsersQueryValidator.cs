using PPrePorter.CQRS.Common;

namespace PPrePorter.CQRS.Users.Queries
{
    /// <summary>
    /// Validator for the get all users query
    /// </summary>
    public class GetAllUsersQueryValidator : IValidator<GetAllUsersQuery>
    {
        /// <summary>
        /// Validates the query
        /// </summary>
        public Task<ValidationResult> ValidateAsync(GetAllUsersQuery query, CancellationToken cancellationToken = default)
        {
            var result = new ValidationResult();

            // Validate page
            if (query.Page < 1)
            {
                result.Errors.Add(new ValidationFailure(nameof(query.Page), "Page must be greater than 0"));
            }

            // Validate page size
            if (query.PageSize < 1)
            {
                result.Errors.Add(new ValidationFailure(nameof(query.PageSize), "Page size must be greater than 0"));
            }
            else if (query.PageSize > 100)
            {
                result.Errors.Add(new ValidationFailure(nameof(query.PageSize), "Page size must be at most 100"));
            }

            // Validate role ID
            if (query.RoleId.HasValue && query.RoleId.Value <= 0)
            {
                result.Errors.Add(new ValidationFailure(nameof(query.RoleId), "Role ID must be greater than 0"));
            }

            return Task.FromResult(result);
        }
    }
}
