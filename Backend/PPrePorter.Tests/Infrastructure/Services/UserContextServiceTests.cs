using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using PPrePorter.Core.Interfaces;
using PPrePorter.Domain.Entities.PPReporter;
using PPrePorter.Infrastructure.Data;
using PPrePorter.Infrastructure.Services;
using Xunit;

namespace PPrePorter.Tests.Infrastructure.Services
{
    public class UserContextServiceTests
    {
        private readonly Mock<IHttpContextAccessor> _mockHttpContextAccessor;
        private readonly Mock<IPPRePorterDbContext> _mockDbContext;
        private readonly Mock<ILogger<UserContextService>> _mockLogger;
        private readonly UserContextService _service;
        private readonly Mock<DbSet<User>> _mockUserDbSet;

        public UserContextServiceTests()
        {
            _mockHttpContextAccessor = new Mock<IHttpContextAccessor>();
            _mockDbContext = new Mock<IPPRePorterDbContext>();
            _mockLogger = new Mock<ILogger<UserContextService>>();
            _mockUserDbSet = new Mock<DbSet<User>>();

            _mockDbContext.Setup(db => db.Users).Returns(_mockUserDbSet.Object);

            _service = new UserContextService(
                _mockHttpContextAccessor.Object,
                _mockDbContext.Object,
                _mockLogger.Object);
        }

        [Fact]
        public async Task GetCurrentUserAsync_WithValidUser_ReturnsUserContext()
        {
            // Arrange
            var userId = "123";
            var username = "testuser";
            var email = "test@example.com";
            var roleName = "Admin";

            // Set up HttpContext with claims
            var httpContext = new DefaultHttpContext();
            httpContext.User = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId),
                new Claim(ClaimTypes.Name, username)
            }, "mock"));

            _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);

            // Set up user in database
            var user = new User
            {
                Id = int.Parse(userId),
                Username = username,
                Email = email,
                Role = new Role { Name = roleName }
            };

            // Set up DbSet to return the user
            var users = new List<User> { user };
            var queryable = users.AsQueryable();

            _mockUserDbSet.As<IQueryable<User>>().Setup(m => m.Provider).Returns(queryable.Provider);
            _mockUserDbSet.As<IQueryable<User>>().Setup(m => m.Expression).Returns(queryable.Expression);
            _mockUserDbSet.As<IQueryable<User>>().Setup(m => m.ElementType).Returns(queryable.ElementType);
            _mockUserDbSet.As<IQueryable<User>>().Setup(m => m.GetEnumerator()).Returns(() => queryable.GetEnumerator());

            _mockUserDbSet.Setup(m => m.Include(It.IsAny<string>())).Returns(_mockUserDbSet.Object);
            _mockUserDbSet.Setup(m => m.FirstOrDefaultAsync(It.IsAny<Func<User, bool>>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((Func<User, bool> predicate, CancellationToken token) => users.FirstOrDefault(predicate));

            // Act
            var result = await _service.GetCurrentUserAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(userId, result.Id);
            Assert.Equal(username, result.Username);
            Assert.Equal(email, result.Email);
            Assert.Equal(roleName, result.Role);
        }

        [Fact]
        public async Task GetCurrentUserAsync_WithNullHttpContext_ThrowsInvalidOperationException()
        {
            // Arrange
            _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns((HttpContext)null);

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() => _service.GetCurrentUserAsync());
        }

        [Fact]
        public async Task GetCurrentUserAsync_WithNoUserIdentifier_ThrowsInvalidOperationException()
        {
            // Arrange
            var httpContext = new DefaultHttpContext();
            httpContext.User = new ClaimsPrincipal(new ClaimsIdentity(new Claim[] { }, "mock"));

            _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() => _service.GetCurrentUserAsync());
        }

        [Fact]
        public async Task GetCurrentUserAsync_WithUserNotInDatabase_ThrowsInvalidOperationException()
        {
            // Arrange
            var userId = "123";
            var username = "testuser";

            // Set up HttpContext with claims
            var httpContext = new DefaultHttpContext();
            httpContext.User = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId),
                new Claim(ClaimTypes.Name, username)
            }, "mock"));

            _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);

            // Set up empty user list
            var users = new List<User>();
            var queryable = users.AsQueryable();

            _mockUserDbSet.As<IQueryable<User>>().Setup(m => m.Provider).Returns(queryable.Provider);
            _mockUserDbSet.As<IQueryable<User>>().Setup(m => m.Expression).Returns(queryable.Expression);
            _mockUserDbSet.As<IQueryable<User>>().Setup(m => m.ElementType).Returns(queryable.ElementType);
            _mockUserDbSet.As<IQueryable<User>>().Setup(m => m.GetEnumerator()).Returns(() => queryable.GetEnumerator());

            _mockUserDbSet.Setup(m => m.Include(It.IsAny<string>())).Returns(_mockUserDbSet.Object);
            _mockUserDbSet.Setup(m => m.FirstOrDefaultAsync(It.IsAny<Func<User, bool>>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((Func<User, bool> predicate, CancellationToken token) => users.FirstOrDefault(predicate));

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() => _service.GetCurrentUserAsync());
        }
    }
}
