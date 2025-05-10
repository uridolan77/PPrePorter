namespace PPrePorter.API.Features.Authentication.Services
{
    /// <summary>
    /// Interface for password hashing and verification
    /// </summary>
    public interface IPasswordHasher
    {
        /// <summary>
        /// Hashes a password
        /// </summary>
        /// <param name="password">The password to hash</param>
        /// <returns>The hashed password</returns>
        string HashPassword(string password);

        /// <summary>
        /// Verifies a password against a hash
        /// </summary>
        /// <param name="password">The password to verify</param>
        /// <param name="hashedPassword">The hashed password to compare against</param>
        /// <returns>True if the password matches the hash, false otherwise</returns>
        bool VerifyPassword(string password, string hashedPassword);

        /// <summary>
        /// Generates a legacy SHA256 hash for backward compatibility
        /// </summary>
        /// <param name="password">The password to hash</param>
        /// <returns>The SHA256 hashed password</returns>
        string GenerateLegacyHash(string password);

        /// <summary>
        /// Checks if a hash is in the BCrypt format
        /// </summary>
        /// <param name="hash">The hash to check</param>
        /// <returns>True if the hash is in BCrypt format, false otherwise</returns>
        bool IsBCryptHash(string hash);
    }
}
