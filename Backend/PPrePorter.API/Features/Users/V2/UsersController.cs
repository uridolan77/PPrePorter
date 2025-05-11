using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PPrePorter.API.Features.Configuration;
using PPrePorter.CQRS.Users.Commands;
using PPrePorter.CQRS.Users.Queries;

namespace PPrePorter.API.Features.Users.V2
{
    /// <summary>
    /// Controller for managing users (API version 2)
    /// </summary>
    [ApiController]
    [ApiVersion("2.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
    [Authorize(Roles = "Admin")]
    [ApiExplorerSettings(GroupName = SwaggerGroups.Users)]
    public class UsersController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<UsersController> _logger;

        public UsersController(
            IMediator mediator,
            ILogger<UsersController> logger)
        {
            _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Gets all users
        /// </summary>
        /// <param name="includeInactive">Whether to include inactive users</param>
        /// <param name="roleId">The role ID filter</param>
        /// <param name="page">The page number</param>
        /// <param name="pageSize">The page size</param>
        /// <returns>The users</returns>
        [HttpGet]
        [ProducesResponseType(typeof(GetAllUsersResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAllUsers(
            [FromQuery] bool includeInactive = false,
            [FromQuery] int? roleId = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var query = new GetAllUsersQuery
                {
                    IncludeInactive = includeInactive,
                    RoleId = roleId,
                    Page = page,
                    PageSize = pageSize
                };

                var response = await _mediator.Send(query);

                if (!response.Success)
                {
                    return BadRequest(response);
                }

                // In v2, we add a link header for pagination
                AddPaginationHeaders(response.Data);

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting users");
                return StatusCode(500, new { Message = "An error occurred while getting users" });
            }
        }

        /// <summary>
        /// Gets a user by ID
        /// </summary>
        /// <param name="id">The user ID</param>
        /// <returns>The user</returns>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(GetUserByIdResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetUserById(int id)
        {
            try
            {
                var query = new GetUserByIdQuery { Id = id };
                var response = await _mediator.Send(query);

                if (!response.Success)
                {
                    if (response.ErrorMessage?.Contains("not found") == true)
                    {
                        return NotFound(response);
                    }

                    return BadRequest(response);
                }

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user with ID {UserId}", id);
                return StatusCode(500, new { Message = $"An error occurred while getting user with ID {id}" });
            }
        }

        /// <summary>
        /// Creates a new user
        /// </summary>
        /// <param name="command">The create user command</param>
        /// <returns>The created user</returns>
        [HttpPost]
        [ProducesResponseType(typeof(CreateUserResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserCommand command)
        {
            try
            {
                var response = await _mediator.Send(command);

                if (!response.Success)
                {
                    return BadRequest(response);
                }

                return CreatedAtAction(
                    nameof(GetUserById),
                    new { id = response.Data.Id, version = HttpContext.GetRequestedApiVersion()?.ToString() ?? "2.0" },
                    response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user {Username}", command.Username);
                return StatusCode(500, new { Message = "An error occurred while creating the user" });
            }
        }

        /// <summary>
        /// Adds pagination headers to the response
        /// </summary>
        /// <param name="data">The pagination data</param>
        private void AddPaginationHeaders(GetAllUsersDto data)
        {
            if (data == null)
            {
                return;
            }

            var currentUrl = $"{Request.Scheme}://{Request.Host}{Request.Path}";
            var queryString = Request.QueryString.Value ?? "";

            // Add X-Pagination header
            Response.Headers.Add("X-Pagination", System.Text.Json.JsonSerializer.Serialize(new
            {
                TotalCount = data.TotalCount,
                PageSize = data.PageSize,
                CurrentPage = data.Page,
                TotalPages = data.TotalPages
            }));

            // Add Link header with prev, next, first, last links
            var links = new List<string>();

            if (data.Page > 1)
            {
                links.Add($"<{GetPageUrl(currentUrl, queryString, 1)}>; rel=\"first\"");
                links.Add($"<{GetPageUrl(currentUrl, queryString, data.Page - 1)}>; rel=\"prev\"");
            }

            if (data.Page < data.TotalPages)
            {
                links.Add($"<{GetPageUrl(currentUrl, queryString, data.Page + 1)}>; rel=\"next\"");
                links.Add($"<{GetPageUrl(currentUrl, queryString, data.TotalPages)}>; rel=\"last\"");
            }

            if (links.Any())
            {
                Response.Headers.Add("Link", string.Join(", ", links));
            }
        }

        /// <summary>
        /// Gets the URL for a specific page
        /// </summary>
        /// <param name="baseUrl">The base URL</param>
        /// <param name="queryString">The query string</param>
        /// <param name="page">The page number</param>
        /// <returns>The URL for the page</returns>
        private string GetPageUrl(string baseUrl, string queryString, int page)
        {
            if (string.IsNullOrEmpty(queryString))
            {
                return $"{baseUrl}?page={page}";
            }

            if (queryString.Contains("page="))
            {
                return System.Text.RegularExpressions.Regex.Replace(
                    $"{baseUrl}{queryString}",
                    @"page=\d+",
                    $"page={page}");
            }

            return $"{baseUrl}{queryString}&page={page}";
        }
    }
}
