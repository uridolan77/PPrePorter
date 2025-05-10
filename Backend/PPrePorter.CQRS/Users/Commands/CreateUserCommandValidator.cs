using PPrePorter.CQRS.Common;

namespace PPrePorter.CQRS.Users.Commands
{
    /// <summary>
    /// Validator for the create user command
    /// </summary>
    public class CreateUserCommandValidator : IValidator<CreateUserCommand>
    {
        /// <summary>
        /// Validates the command
        /// </summary>
        public Task<ValidationResult> ValidateAsync(CreateUserCommand command, CancellationToken cancellationToken = default)
        {
            var result = new ValidationResult();

            // Validate username
            if (string.IsNullOrWhiteSpace(command.Username))
            {
                result.Errors.Add(new ValidationFailure(nameof(command.Username), "Username is required"));
            }
            else if (command.Username.Length < 3)
            {
                result.Errors.Add(new ValidationFailure(nameof(command.Username), "Username must be at least 3 characters"));
            }
            else if (command.Username.Length > 50)
            {
                result.Errors.Add(new ValidationFailure(nameof(command.Username), "Username must be at most 50 characters"));
            }

            // Validate email
            if (string.IsNullOrWhiteSpace(command.Email))
            {
                result.Errors.Add(new ValidationFailure(nameof(command.Email), "Email is required"));
            }
            else if (!IsValidEmail(command.Email))
            {
                result.Errors.Add(new ValidationFailure(nameof(command.Email), "Email is not valid"));
            }
            else if (command.Email.Length > 100)
            {
                result.Errors.Add(new ValidationFailure(nameof(command.Email), "Email must be at most 100 characters"));
            }

            // Validate password
            if (string.IsNullOrWhiteSpace(command.Password))
            {
                result.Errors.Add(new ValidationFailure(nameof(command.Password), "Password is required"));
            }
            else if (command.Password.Length < 8)
            {
                result.Errors.Add(new ValidationFailure(nameof(command.Password), "Password must be at least 8 characters"));
            }
            else if (!IsStrongPassword(command.Password))
            {
                result.Errors.Add(new ValidationFailure(nameof(command.Password), 
                    "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character"));
            }

            // Validate first name
            if (string.IsNullOrWhiteSpace(command.FirstName))
            {
                result.Errors.Add(new ValidationFailure(nameof(command.FirstName), "First name is required"));
            }
            else if (command.FirstName.Length > 50)
            {
                result.Errors.Add(new ValidationFailure(nameof(command.FirstName), "First name must be at most 50 characters"));
            }

            // Validate last name
            if (string.IsNullOrWhiteSpace(command.LastName))
            {
                result.Errors.Add(new ValidationFailure(nameof(command.LastName), "Last name is required"));
            }
            else if (command.LastName.Length > 50)
            {
                result.Errors.Add(new ValidationFailure(nameof(command.LastName), "Last name must be at most 50 characters"));
            }

            // Validate role ID
            if (command.RoleId <= 0)
            {
                result.Errors.Add(new ValidationFailure(nameof(command.RoleId), "Role ID must be greater than 0"));
            }

            return Task.FromResult(result);
        }

        /// <summary>
        /// Checks if an email is valid
        /// </summary>
        private bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// Checks if a password is strong
        /// </summary>
        private bool IsStrongPassword(string password)
        {
            return password.Any(char.IsUpper) &&
                   password.Any(char.IsLower) &&
                   password.Any(char.IsDigit) &&
                   password.Any(c => !char.IsLetterOrDigit(c));
        }
    }
}
