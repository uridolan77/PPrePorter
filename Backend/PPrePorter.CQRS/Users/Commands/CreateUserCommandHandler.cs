using MediatR;
using Microsoft.Extensions.Logging;
using PPrePorter.Core.Repositories;
using PPrePorter.Domain.Entities.PPReporter;

namespace PPrePorter.CQRS.Users.Commands
{
    /// <summary>
    /// Handler for the create user command
    /// </summary>
    public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, CreateUserResponse>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<CreateUserCommandHandler> _logger;

        public CreateUserCommandHandler(
            IUnitOfWork unitOfWork,
            ILogger<CreateUserCommandHandler> logger)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Handles the command
        /// </summary>
        public async Task<CreateUserResponse> Handle(CreateUserCommand request, CancellationToken cancellationToken)
        {
            try
            {
                // Check if the username already exists
                var userRepository = _unitOfWork.Repository<User>();
                var existingUser = await userRepository.FindOneAsync(u => u.Username == request.Username);

                if (existingUser != null)
                {
                    _logger.LogWarning("Username {Username} already exists", request.Username);
                    return CreateUserResponse.CreateFailure<CreateUserResponse>($"Username '{request.Username}' already exists");
                }

                // Check if the email already exists
                existingUser = await userRepository.FindOneAsync(u => u.Email == request.Email);

                if (existingUser != null)
                {
                    _logger.LogWarning("Email {Email} already exists", request.Email);
                    return CreateUserResponse.CreateFailure<CreateUserResponse>($"Email '{request.Email}' already exists");
                }

                // Check if the role exists
                var roleRepository = _unitOfWork.Repository<Role>();
                var role = await roleRepository.GetByIdAsync(request.RoleId);

                if (role == null)
                {
                    _logger.LogWarning("Role with ID {RoleId} not found", request.RoleId);
                    return CreateUserResponse.CreateFailure<CreateUserResponse>($"Role with ID {request.RoleId} not found");
                }

                // Create the user
                var user = new User
                {
                    Username = request.Username,
                    Email = request.Email,
                    PasswordHash = request.Password, // In a real implementation, this would be hashed
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    RoleId = request.RoleId,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    FailedLoginAttempts = 0
                };

                // Add the user to the database
                await userRepository.AddAsync(user);
                await _unitOfWork.SaveChangesAsync();

                _logger.LogInformation("User {Username} created successfully", user.Username);

                // Return the response
                return CreateUserResponse.CreateSuccess<CreateUserResponse>(new CreateUserDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    RoleId = user.RoleId,
                    RoleName = role.Name
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user {Username}", request.Username);
                return CreateUserResponse.CreateFailure<CreateUserResponse>($"Error creating user: {ex.Message}");
            }
        }
    }
}
