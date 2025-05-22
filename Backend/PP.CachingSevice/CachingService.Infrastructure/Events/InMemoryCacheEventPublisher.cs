using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CachingService.Core.Events;
using CachingService.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace CachingService.Infrastructure.Events
{
    /// <summary>
    /// In-memory implementation of the cache event publisher
    /// </summary>
    public class InMemoryCacheEventPublisher : ICacheEventPublisher
    {
        private readonly ILogger<InMemoryCacheEventPublisher> _logger;
        private readonly ConcurrentDictionary<Type, List<Delegate>> _handlers = new();
        
        public InMemoryCacheEventPublisher(ILogger<InMemoryCacheEventPublisher> logger)
        {
            _logger = logger;
        }
        
        /// <inheritdoc />
        public void Publish(CacheEvent cacheEvent)
        {
            if (cacheEvent == null)
            {
                throw new ArgumentNullException(nameof(cacheEvent));
            }
            
            Type eventType = cacheEvent.GetType();
            
            if (_handlers.TryGetValue(eventType, out List<Delegate>? handlers))
            {
                foreach (var handler in handlers)
                {
                    try
                    {
                        handler.DynamicInvoke(cacheEvent);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error invoking event handler for {EventType}", eventType.Name);
                    }
                }
            }
        }
        
        /// <inheritdoc />
        public Task PublishAsync(CacheEvent cacheEvent, CancellationToken cancellationToken = default)
        {
            cancellationToken.ThrowIfCancellationRequested();
            
            Publish(cacheEvent);
            
            return Task.CompletedTask;
        }
        
        /// <inheritdoc />
        public IDisposable Subscribe<T>(Action<T> handler) where T : CacheEvent
        {
            if (handler == null)
            {
                throw new ArgumentNullException(nameof(handler));
            }
            
            Type eventType = typeof(T);
            
            if (!_handlers.TryGetValue(eventType, out List<Delegate>? handlers))
            {
                handlers = new List<Delegate>();
                _handlers[eventType] = handlers;
            }
            
            handlers.Add(handler);
            
            return new Subscription(() => Unsubscribe(eventType, handler));
        }
        
        private void Unsubscribe(Type eventType, Delegate handler)
        {
            if (_handlers.TryGetValue(eventType, out List<Delegate>? handlers))
            {
                handlers.Remove(handler);
                
                if (handlers.Count == 0)
                {
                    _handlers.TryRemove(eventType, out _);
                }
            }
        }
        
        private class Subscription : IDisposable
        {
            private readonly Action _unsubscribeAction;
            private bool _disposed;
            
            public Subscription(Action unsubscribeAction)
            {
                _unsubscribeAction = unsubscribeAction;
            }
            
            public void Dispose()
            {
                if (!_disposed)
                {
                    _unsubscribeAction();
                    _disposed = true;
                }
            }
        }
    }
}
