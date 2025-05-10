using MediatR;

namespace PPrePorter.CQRS.Common
{
    /// <summary>
    /// Base class for commands that don't return a value
    /// </summary>
    public abstract class BaseCommand : IRequest
    {
    }

    /// <summary>
    /// Base class for commands that return a value
    /// </summary>
    /// <typeparam name="TResult">The type of the result</typeparam>
    public abstract class BaseCommand<TResult> : IRequest<TResult>
    {
    }
}
