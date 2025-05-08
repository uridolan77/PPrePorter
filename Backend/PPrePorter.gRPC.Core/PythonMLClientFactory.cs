using System;
using System.Collections.Concurrent;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PPrePorter.gRPC.Core.Configuration;
using PPrePorter.gRPC.Core.Interfaces;

namespace PPrePorter.gRPC.Core
{
    /// <summary>
    /// Factory for creating PythonML clients.
    /// </summary>
    public class PythonMLClientFactory : IPythonMLClientFactory
    {
        private readonly ILoggerFactory _loggerFactory;
        private readonly ConcurrentDictionary<string, PythonMLClientOptions> _optionsCache;
        private readonly IMemoryCache _memoryCache;
        private readonly PythonMLClientOptions _defaultOptions;

        /// <summary>
        /// Initializes a new instance of the PythonMLClientFactory class.
        /// </summary>
        /// <param name="loggerFactory">The logger factory.</param>
        /// <param name="options">The default client options.</param>
        /// <param name="memoryCache">The memory cache.</param>
        public PythonMLClientFactory(
            ILoggerFactory loggerFactory,
            IOptions<PythonMLClientOptions> options,
            IMemoryCache memoryCache)
        {
            _loggerFactory = loggerFactory ?? throw new ArgumentNullException(nameof(loggerFactory));
            _defaultOptions = options?.Value ?? throw new ArgumentNullException(nameof(options));
            _memoryCache = memoryCache ?? throw new ArgumentNullException(nameof(memoryCache));
            _optionsCache = new ConcurrentDictionary<string, PythonMLClientOptions>();
        }

        /// <inheritdoc/>
        public IPythonMLClient CreateClient(string instanceName = "Default")
        {
            if (string.IsNullOrEmpty(instanceName))
                throw new ArgumentException("Instance name cannot be null or empty.", nameof(instanceName));

            var options = _optionsCache.GetOrAdd(instanceName, _ => _defaultOptions);
            var logger = _loggerFactory.CreateLogger<PythonMLClient>();

            return new PythonMLClient(options, logger, _memoryCache);
        }

        /// <summary>
        /// Configures a named client instance with the specified options.
        /// </summary>
        /// <param name="instanceName">The name of the client instance.</param>
        /// <param name="configureOptions">The action to configure the options.</param>
        public void ConfigureClient(string instanceName, Action<PythonMLClientOptions> configureOptions)
        {
            if (string.IsNullOrEmpty(instanceName))
                throw new ArgumentException("Instance name cannot be null or empty.", nameof(instanceName));

            if (configureOptions == null)
                throw new ArgumentNullException(nameof(configureOptions));

            var options = new PythonMLClientOptions();
            configureOptions(options);
            _optionsCache[instanceName] = options;
        }
    }
}