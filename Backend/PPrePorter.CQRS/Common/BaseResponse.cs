namespace PPrePorter.CQRS.Common
{
    /// <summary>
    /// Base class for command and query responses
    /// </summary>
    public abstract class BaseResponse
    {
        /// <summary>
        /// Gets or sets whether the operation was successful
        /// </summary>
        public bool Success { get; set; }

        /// <summary>
        /// Gets or sets the error message if the operation failed
        /// </summary>
        public string? ErrorMessage { get; set; }

        /// <summary>
        /// Creates a successful response
        /// </summary>
        /// <typeparam name="T">The type of the response</typeparam>
        /// <returns>A successful response</returns>
        public static T CreateSuccess<T>() where T : BaseResponse, new()
        {
            return new T { Success = true };
        }

        /// <summary>
        /// Creates a failed response with an error message
        /// </summary>
        /// <typeparam name="T">The type of the response</typeparam>
        /// <param name="errorMessage">The error message</param>
        /// <returns>A failed response</returns>
        public static T CreateFailure<T>(string errorMessage) where T : BaseResponse, new()
        {
            return new T { Success = false, ErrorMessage = errorMessage };
        }
    }

    /// <summary>
    /// Base class for command and query responses with data
    /// </summary>
    /// <typeparam name="TData">The type of the data</typeparam>
    public abstract class BaseResponse<TData> : BaseResponse
    {
        /// <summary>
        /// Gets or sets the data
        /// </summary>
        public TData? Data { get; set; }

        /// <summary>
        /// Creates a successful response with data
        /// </summary>
        /// <typeparam name="T">The type of the response</typeparam>
        /// <param name="data">The data</param>
        /// <returns>A successful response with data</returns>
        public static T CreateSuccess<T>(TData data) where T : BaseResponse<TData>, new()
        {
            return new T { Success = true, Data = data };
        }
    }
}
