using Microsoft.Extensions.Logging;
using PPrePorter.Core.Interfaces;
using PPrePorter.DailyActionsDB.Models.DailyActions;
using PPrePorter.DailyActionsDB.Models.DTOs;
using PPrePorter.DailyActionsDB.Services;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace PPrePorter.DailyActionsDB.Services.DailyActions
{
    /// <summary>
    /// Service for handling background processing of daily actions data
    /// </summary>
    public class BackgroundProcessingService
    {
        private readonly IGlobalCacheService _cache;
        private readonly AsyncCacheServiceAdapter _asyncCache;
        private readonly ILogger<BackgroundProcessingService> _logger;
        private readonly ConcurrentQueue<BackgroundTask> _taskQueue;
        private readonly SemaphoreSlim _semaphore;
        private readonly CancellationTokenSource _cancellationTokenSource;
        private Task _processingTask;

        public BackgroundProcessingService(
            IGlobalCacheService cache,
            AsyncCacheServiceAdapter asyncCache,
            ILogger<BackgroundProcessingService> logger)
        {
            _cache = cache ?? throw new ArgumentNullException(nameof(cache));
            _asyncCache = asyncCache ?? throw new ArgumentNullException(nameof(asyncCache));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _taskQueue = new ConcurrentQueue<BackgroundTask>();
            _semaphore = new SemaphoreSlim(0);
            _cancellationTokenSource = new CancellationTokenSource();

            // Start the background processing task
            _processingTask = Task.Run(ProcessTasksAsync);
        }

        /// <summary>
        /// Enqueues a task to cache raw daily actions data in the background
        /// </summary>
        public void EnqueueCacheRawDataTask(
            List<DailyActionDto> data,
            DailyActionResponseDto response,
            string cacheKey,
            TimeSpan expiration)
        {
            var task = new BackgroundTask
            {
                TaskType = BackgroundTaskType.CacheRawData,
                RawData = data,
                Response = response,
                CacheKey = cacheKey,
                Expiration = expiration
            };

            _taskQueue.Enqueue(task);
            _semaphore.Release();
            _logger.LogDebug("Enqueued background task to cache raw data with key: {CacheKey}", cacheKey);
        }

        /// <summary>
        /// Enqueues a task to cache grouped daily actions data in the background
        /// </summary>
        public void EnqueueCacheGroupedDataTask(
            List<DailyActionDto> data,
            DailyActionResponseDto response,
            string cacheKey,
            TimeSpan expiration)
        {
            var task = new BackgroundTask
            {
                TaskType = BackgroundTaskType.CacheGroupedData,
                RawData = data,
                Response = response,
                CacheKey = cacheKey,
                Expiration = expiration
            };

            _taskQueue.Enqueue(task);
            _semaphore.Release();
            _logger.LogDebug("Enqueued background task to cache grouped data with key: {CacheKey}", cacheKey);
        }

        /// <summary>
        /// Processes tasks in the background
        /// </summary>
        private async Task ProcessTasksAsync()
        {
            while (!_cancellationTokenSource.Token.IsCancellationRequested)
            {
                try
                {
                    // Wait for a task to be available
                    await _semaphore.WaitAsync(_cancellationTokenSource.Token);

                    // Process the task
                    if (_taskQueue.TryDequeue(out var task))
                    {
                        await ProcessTaskAsync(task);
                    }
                }
                catch (OperationCanceledException)
                {
                    // Cancellation requested, exit the loop
                    break;
                }
                catch (Exception ex)
                {
                    // Log the error but continue processing
                    _logger.LogError(ex, "Error processing background task");
                }
            }
        }

        /// <summary>
        /// Processes a single background task
        /// </summary>
        private async Task ProcessTaskAsync(BackgroundTask task)
        {
            try
            {
                var startTime = DateTime.UtcNow;
                _logger.LogDebug("Processing background task of type {TaskType}", task.TaskType);

                switch (task.TaskType)
                {
                    case BackgroundTaskType.CacheRawData:
                        // Cache the raw data asynchronously
                        await _asyncCache.SetAsync(task.CacheKey, task.Response, new CacheItemOptions { AbsoluteExpiration = task.Expiration });
                        break;

                    case BackgroundTaskType.CacheGroupedData:
                        // Cache the grouped data asynchronously
                        await _asyncCache.SetAsync(task.CacheKey, task.Response, new CacheItemOptions { AbsoluteExpiration = task.Expiration });
                        break;

                    default:
                        _logger.LogWarning("Unknown task type: {TaskType}", task.TaskType);
                        break;
                }

                var elapsedMs = (DateTime.UtcNow - startTime).TotalMilliseconds;
                _logger.LogInformation("Completed background task of type {TaskType} in {ElapsedMs}ms", task.TaskType, elapsedMs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing background task of type {TaskType}", task.TaskType);
            }
        }

        /// <summary>
        /// Stops the background processing service
        /// </summary>
        public void Stop()
        {
            _cancellationTokenSource.Cancel();
        }
    }

    /// <summary>
    /// Types of background tasks
    /// </summary>
    public enum BackgroundTaskType
    {
        CacheRawData,
        CacheGroupedData
    }

    /// <summary>
    /// Represents a background task
    /// </summary>
    public class BackgroundTask
    {
        public BackgroundTaskType TaskType { get; set; }
        public List<DailyActionDto> RawData { get; set; }
        public DailyActionResponseDto Response { get; set; }
        public string CacheKey { get; set; }
        public TimeSpan Expiration { get; set; }
    }
}
