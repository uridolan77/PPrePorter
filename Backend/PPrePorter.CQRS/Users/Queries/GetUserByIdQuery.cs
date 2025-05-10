using PPrePorter.CQRS.Common;

namespace PPrePorter.CQRS.Users.Queries
{
    /// <summary>
    /// Query for getting a user by ID
    /// </summary>
    [CacheableQuery("GetUserById", 300)] // Cache for 5 minutes
    public class GetUserByIdQuery : BaseQuery<GetUserByIdResponse>
    {
        /// <summary>
        /// Gets or sets the user ID
        /// </summary>
        public int Id { get; set; }
    }

    /// <summary>
    /// Response for the get user by ID query
    /// </summary>
    public class GetUserByIdResponse : BaseResponse<UserDto>
    {
    }

    /// <summary>
    /// DTO for a user
    /// </summary>
    public class UserDto
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
        /// Gets or sets whether the user is active
        /// </summary>
        public bool IsActive { get; set; }

        /// <summary>
        /// Gets or sets the created at date
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Gets or sets the last login date
        /// </summary>
        public DateTime? LastLogin { get; set; }

        /// <summary>
        /// Gets or sets the role ID
        /// </summary>
        public int RoleId { get; set; }

        /// <summary>
        /// Gets or sets the role name
        /// </summary>
        public string RoleName { get; set; }

        /// <summary>
        /// Gets or sets the user's permissions
        /// </summary>
        public List<string> Permissions { get; set; } = new List<string>();
    }
}
