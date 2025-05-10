using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PPrePorter.CQRS.Users.Commands;
using PPrePorter.CQRS.Users.Queries;

namespace PPrePorter.API.Features.Users.V1
{
    /// <summary>
    /// Controller for managing users (API version 1)
    /// </summary>
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
    [Authorize(Roles = "Admin")]
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
                    new { id = response.Data.Id, version = HttpContext.GetRequestedApiVersion()?.ToString() ?? "1.0" },
                    response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user {Username}", command.Username);
                return StatusCode(500, new { Message = "An error occurred while creating the user" });
            }
        }
    }
}
