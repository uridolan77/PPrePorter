using System;
using System.Collections.Generic;

namespace PPrePorter.Core.Exceptions
{
    // Base exception for application-specific exceptions
    public abstract class ApplicationException : Exception
    {
        protected ApplicationException(string message) : base(message)
        {
        }

        protected ApplicationException(string message, Exception innerException) : base(message, innerException)
        {
        }
    }

    // Exception for database access errors
    public class DbDataAccessException : ApplicationException
    {
        public DbDataAccessException(string message) : base(message)
        {
        }

        public DbDataAccessException(string message, Exception innerException) : base(message, innerException)
        {
        }
    }

    // Exception for when a requested resource is not found
    public class ResourceNotFoundException : ApplicationException
    {
        public ResourceNotFoundException(string resourceType, object resourceId) 
            : base($"{resourceType} with identifier {resourceId} was not found.")
        {
            ResourceType = resourceType;
            ResourceId = resourceId;
        }

        public string ResourceType { get; }
        public object ResourceId { get; }
    }

    // Exception for validation errors
    public class ValidationException : ApplicationException
    {
        public ValidationException(string message) : base(message)
        {
            Errors = new Dictionary<string, string[]>();
        }

        public ValidationException(IDictionary<string, string[]> errors) 
            : base("One or more validation errors occurred.")
        {
            Errors = errors;
        }

        public IDictionary<string, string[]> Errors { get; }
    }
}