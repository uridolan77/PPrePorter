using System;
using System.Security.Cryptography;
using BCrypt.Net;

namespace PPrePorter.API.Features.Authentication.Services
{
    /// <summary>
    /// Service for securely hashing and verifying passwords using BCrypt
    /// </summary>
    public class PasswordHasher : IPasswordHasher
    {
        private const int WorkFactor = 12; // Higher work factor means more secure but slower

        /// <summary>
        /// Hashes a password using BCrypt
        /// </summary>
        /// <param name="password">The password to hash</param>
        /// <returns>The hashed password</returns>
        public string HashPassword(string password)
        {
            if (string.IsNullOrEmpty(password))
            {
                throw new ArgumentNullException(nameof(password), "Password cannot be null or empty");
            }

            // Generate a salt and hash the password using BCrypt
            string salt = BCrypt.Net.BCrypt.GenerateSalt(WorkFactor);
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(password, salt);

            return hashedPassword;
        }

        /// <summary>
        /// Verifies a password against a hash
        /// </summary>
        /// <param name="password">The password to verify</param>
        /// <param name="hashedPassword">The hashed password to compare against</param>
        /// <returns>True if the password matches the hash, false otherwise</returns>
        public bool VerifyPassword(string password, string hashedPassword)
        {
            if (string.IsNullOrEmpty(password))
            {
                throw new ArgumentNullException(nameof(password), "Password cannot be null or empty");
            }

            if (string.IsNullOrEmpty(hashedPassword))
            {
                throw new ArgumentNullException(nameof(hashedPassword), "Hashed password cannot be null or empty");
            }

            try
            {
                // Verify the password using BCrypt
                return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
            }
            catch (Exception)
            {
                // If the hash format is invalid, return false
                return false;
            }
        }

        /// <summary>
        /// Generates a legacy SHA256 hash for backward compatibility
        /// </summary>
        /// <param name="password">The password to hash</param>
        /// <returns>The SHA256 hashed password</returns>
        public string GenerateLegacyHash(string password)
        {
            if (string.IsNullOrEmpty(password))
            {
                throw new ArgumentNullException(nameof(password), "Password cannot be null or empty");
            }

            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }

        /// <summary>
        /// Checks if a hash is in the BCrypt format
        /// </summary>
        /// <param name="hash">The hash to check</param>
        /// <returns>True if the hash is in BCrypt format, false otherwise</returns>
        public bool IsBCryptHash(string hash)
        {
            return !string.IsNullOrEmpty(hash) && hash.StartsWith("$2");
        }
    }
}
