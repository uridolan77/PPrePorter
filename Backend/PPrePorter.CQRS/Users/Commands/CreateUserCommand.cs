using PPrePorter.CQRS.Common;

namespace PPrePorter.CQRS.Users.Commands
{
    /// <summary>
    /// Command for creating a new user
    /// </summary>
    public class CreateUserCommand : BaseCommand<CreateUserResponse>
    {
        /// <summary>
        /// Gets or sets the username
        /// </summary>
        public string Username { get; set; }

        /// <summary>
        /// Gets or sets the email
        /// </summary>
        public string Email { get; set; }

        /// <summary>
        /// Gets or sets the password
        /// </summary>
        public string Password { get; set; }

        /// <summary>
        /// Gets or sets the first name
        /// </summary>
        public string FirstName { get; set; }

        /// <summary>
        /// Gets or sets the last name
        /// </summary>
        public string LastName { get; set; }

        /// <summary>
        /// Gets or sets the role ID
        /// </summary>
        public int RoleId { get; set; }
    }

    /// <summary>
    /// Response for the create user command
    /// </summary>
    public class CreateUserResponse : BaseResponse<CreateUserDto>
    {
    }

    /// <summary>
    /// DTO for the created user
    /// </summary>
    public class CreateUserDto
    {
        /// <summary>
        /// Gets or sets the user ID
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Gets or sets the username
        /// </summary>
        public string Username { get; set; }

        /// <summary>
        /// Gets or sets the email
        /// </summary>
        public string Email { get; set; }

        /// <summary>
        /// Gets or sets the first name
        /// </summary>
        public string FirstName { get; set; }

        /// <summary>
        /// Gets or sets the last name
        /// </summary>
        public string LastName { get; set; }

        /// <summary>
        /// Gets or sets the role ID
        /// </summary>
        public int RoleId { get; set; }

        /// <summary>
        /// Gets or sets the role name
        /// </summary>
        public string RoleName { get; set; }
    }
}
