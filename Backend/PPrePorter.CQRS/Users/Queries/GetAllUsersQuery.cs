using PPrePorter.CQRS.Common;

namespace PPrePorter.CQRS.Users.Queries
{
    /// <summary>
    /// Query for getting all users
    /// </summary>
    [CacheableQuery("GetAllUsers", 300)] // Cache for 5 minutes
    public class GetAllUsersQuery : BaseQuery<GetAllUsersResponse>
    {
        /// <summary>
        /// Gets or sets whether to include inactive users
        /// </summary>
        public bool IncludeInactive { get; set; } = false;

        /// <summary>
        /// Gets or sets the role ID filter
        /// </summary>
        public int? RoleId { get; set; }

        /// <summary>
        /// Gets or sets the page number
        /// </summary>
        public int Page { get; set; } = 1;

        /// <summary>
        /// Gets or sets the page size
        /// </summary>
        public int PageSize { get; set; } = 10;
    }

    /// <summary>
    /// Response for the get all users query
    /// </summary>
    public class GetAllUsersResponse : BaseResponse<GetAllUsersDto>
    {
    }

    /// <summary>
    /// DTO for the get all users response
    /// </summary>
    public class GetAllUsersDto
    {
        /// <summary>
        /// Gets or sets the users
        /// </summary>
        public List<UserDto> Users { get; set; } = new List<UserDto>();

        /// <summary>
        /// Gets or sets the total count
        /// </summary>
        public int TotalCount { get; set; }

        /// <summary>
        /// Gets or sets the page
        /// </summary>
        public int Page { get; set; }

        /// <summary>
        /// Gets or sets the page size
        /// </summary>
        public int PageSize { get; set; }

        /// <summary>
        /// Gets or sets the total pages
        /// </summary>
        public int TotalPages { get; set; }
    }
}
