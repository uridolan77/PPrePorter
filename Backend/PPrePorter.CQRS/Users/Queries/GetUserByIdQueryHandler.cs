using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Repositories;
using PPrePorter.Domain.Entities.PPReporter;

namespace PPrePorter.CQRS.Users.Queries
{
    /// <summary>
    /// Handler for the get user by ID query
    /// </summary>
    public class GetUserByIdQueryHandler : IRequestHandler<GetUserByIdQuery, GetUserByIdResponse>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<GetUserByIdQueryHandler> _logger;

        public GetUserByIdQueryHandler(
            IUnitOfWork unitOfWork,
            ILogger<GetUserByIdQueryHandler> logger)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Handles the query
        /// </summary>
        public async Task<GetUserByIdResponse> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
        {
            try
            {
                // Get the user repository
                var userRepository = _unitOfWork.Repository<User>();

                // Get the user with role and permissions
                var user = await userRepository.Query()
                    .Include(u => u.Role)
                    .ThenInclude(r => r.Permissions.Where(p => p.PermissionName != null && p.IsAllowed))
                    .FirstOrDefaultAsync(u => u.Id == request.Id, cancellationToken);

                if (user == null)
                {
                    _logger.LogWarning("User with ID {UserId} not found", request.Id);
                    return GetUserByIdResponse.CreateFailure<GetUserByIdResponse>($"User with ID {request.Id} not found");
                }

                // Map the user to a DTO
                var userDto = new UserDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    IsActive = user.IsActive,
                    CreatedAt = user.CreatedAt,
                    LastLogin = user.LastLogin,
                    RoleId = user.RoleId,
                    RoleName = user.Role.Name,
                    Permissions = user.Role.Permissions
                        .Where(p => p.PermissionName != null && p.IsAllowed)
                        .Select(p => p.PermissionName!)
                        .ToList()
                };

                _logger.LogInformation("User with ID {UserId} retrieved successfully", request.Id);

                // Return the response
                return GetUserByIdResponse.CreateSuccess<GetUserByIdResponse>(userDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user with ID {UserId}", request.Id);
                return GetUserByIdResponse.CreateFailure<GetUserByIdResponse>($"Error getting user: {ex.Message}");
            }
        }
    }
}
