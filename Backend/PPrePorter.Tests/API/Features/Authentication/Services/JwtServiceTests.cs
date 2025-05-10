using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using Microsoft.Extensions.Options;
using Moq;
using PPrePorter.API.Features.Authentication.Models;
using PPrePorter.API.Features.Authentication.Services;
using Xunit;

namespace PPrePorter.Tests.API.Features.Authentication.Services
{
    public class JwtServiceTests
    {
        private readonly JwtSettings _jwtSettings;
        private readonly JwtService _jwtService;

        public JwtServiceTests()
        {
            // Set up JWT settings
            _jwtSettings = new JwtSettings
            {
                SecretKey = "ThisIsAVeryLongSecretKeyForTestingPurposesOnly1234567890",
                Issuer = "test-issuer",
                Audience = "test-audience",
                ExpirationMinutes = 60
            };

            var mockOptions = new Mock<IOptions<JwtSettings>>();
            mockOptions.Setup(x => x.Value).Returns(_jwtSettings);

            _jwtService = new JwtService(mockOptions.Object);
        }

        [Fact]
        public void GenerateJwtToken_WithValidInputs_ReturnsValidToken()
        {
            // Arrange
            var userId = "123";
            var username = "testuser";
            var role = "Admin";
            var permissions = new List<string> { "users.read", "users.write" };

            // Act
            var token = _jwtService.GenerateJwtToken(userId, username, role, permissions);

            // Assert
            Assert.NotNull(token);
            Assert.NotEmpty(token);

            // Decode the token to verify its contents
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtToken = tokenHandler.ReadJwtToken(token);

            // Verify claims
            Assert.Equal(userId, jwtToken.Claims.First(c => c.Type == JwtRegisteredClaimNames.Sub).Value);
            Assert.Equal(username, jwtToken.Claims.First(c => c.Type == JwtRegisteredClaimNames.Name).Value);
            Assert.Equal(role, jwtToken.Claims.First(c => c.Type == ClaimTypes.Role).Value);
            
            // Verify permissions
            var permissionClaims = jwtToken.Claims.Where(c => c.Type == "permission").Select(c => c.Value).ToList();
            Assert.Equal(permissions.Count, permissionClaims.Count);
            foreach (var permission in permissions)
            {
                Assert.Contains(permission, permissionClaims);
            }

            // Verify token properties
            Assert.Equal(_jwtSettings.Issuer, jwtToken.Issuer);
            Assert.Equal(_jwtSettings.Audience, jwtToken.Audiences.First());
            
            // Verify expiration (should be close to now + expiration minutes)
            var expectedExpiration = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes);
            var actualExpiration = jwtToken.ValidTo;
            
            // Allow for a small time difference due to test execution time
            var timeDifference = Math.Abs((expectedExpiration - actualExpiration).TotalSeconds);
            Assert.True(timeDifference < 10, "Token expiration time should be close to expected value");
        }

        [Fact]
        public void GenerateRefreshToken_ReturnsNonEmptyString()
        {
            // Act
            var refreshToken = _jwtService.GenerateRefreshToken();

            // Assert
            Assert.NotNull(refreshToken);
            Assert.NotEmpty(refreshToken);
            
            // Verify it's a valid Base64 string
            Assert.True(IsBase64String(refreshToken), "Refresh token should be a valid Base64 string");
        }

        [Fact]
        public void GenerateRefreshToken_ReturnsDifferentTokensOnMultipleCalls()
        {
            // Act
            var refreshToken1 = _jwtService.GenerateRefreshToken();
            var refreshToken2 = _jwtService.GenerateRefreshToken();
            var refreshToken3 = _jwtService.GenerateRefreshToken();

            // Assert
            Assert.NotEqual(refreshToken1, refreshToken2);
            Assert.NotEqual(refreshToken1, refreshToken3);
            Assert.NotEqual(refreshToken2, refreshToken3);
        }

        private bool IsBase64String(string base64)
        {
            // Check if the string is a valid Base64 string
            if (string.IsNullOrEmpty(base64))
                return false;

            try
            {
                Convert.FromBase64String(base64);
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}
