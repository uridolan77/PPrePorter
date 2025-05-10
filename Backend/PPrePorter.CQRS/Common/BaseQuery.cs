using MediatR;

namespace PPrePorter.CQRS.Common
{
    /// <summary>
    /// Base class for queries
    /// </summary>
    /// <typeparam name="TResult">The type of the result</typeparam>
    public abstract class BaseQuery<TResult> : IRequest<TResult>
    {
    }
}
