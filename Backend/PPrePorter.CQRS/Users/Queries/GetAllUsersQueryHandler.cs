using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Repositories;
using PPrePorter.Domain.Entities.PPReporter;

namespace PPrePorter.CQRS.Users.Queries
{
    /// <summary>
    /// Handler for the get all users query
    /// </summary>
    public class GetAllUsersQueryHandler : IRequestHandler<GetAllUsersQuery, GetAllUsersResponse>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<GetAllUsersQueryHandler> _logger;

        public GetAllUsersQueryHandler(
            IUnitOfWork unitOfWork,
            ILogger<GetAllUsersQueryHandler> logger)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Handles the query
        /// </summary>
        public async Task<GetAllUsersResponse> Handle(GetAllUsersQuery request, CancellationToken cancellationToken)
        {
            try
            {
                // Get the user repository
                var userRepository = _unitOfWork.Repository<User>();

                // Create the query
                var query = userRepository.Query()
                    .Include(u => u.Role)
                    .ThenInclude(r => r.Permissions.Where(p => p.PermissionName != null && p.IsAllowed))
                    .AsQueryable();

                // Apply filters
                if (!request.IncludeInactive)
                {
                    query = query.Where(u => u.IsActive);
                }

                if (request.RoleId.HasValue)
                {
                    query = query.Where(u => u.RoleId == request.RoleId.Value);
                }

                // Get the total count
                var totalCount = await query.CountAsync(cancellationToken);

                // Calculate pagination
                var totalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize);
                var page = Math.Max(1, Math.Min(request.Page, totalPages));
                var skip = (page - 1) * request.PageSize;

                // Get the users
                var users = await query
                    .OrderBy(u => u.Username)
                    .Skip(skip)
                    .Take(request.PageSize)
                    .ToListAsync(cancellationToken);

                // Map the users to DTOs
                var userDtos = users.Select(u => new UserDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    IsActive = u.IsActive,
                    CreatedAt = u.CreatedAt,
                    LastLogin = u.LastLogin,
                    RoleId = u.RoleId,
                    RoleName = u.Role.Name,
                    Permissions = u.Role.Permissions
                        .Where(p => p.PermissionName != null && p.IsAllowed)
                        .Select(p => p.PermissionName!)
                        .ToList()
                }).ToList();

                _logger.LogInformation("Retrieved {UserCount} users (page {Page} of {TotalPages})",
                    userDtos.Count, page, totalPages);

                // Return the response
                return GetAllUsersResponse.CreateSuccess<GetAllUsersResponse>(new GetAllUsersDto
                {
                    Users = userDtos,
                    TotalCount = totalCount,
                    Page = page,
                    PageSize = request.PageSize,
                    TotalPages = totalPages
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting users");
                return GetAllUsersResponse.CreateFailure<GetAllUsersResponse>($"Error getting users: {ex.Message}");
            }
        }
    }
}
