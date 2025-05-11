// Custom JavaScript for Swagger UI to show cache status

// Wait for the Swagger UI to be fully loaded
window.onload = function() {
    // Add cache status indicator to Swagger UI
    function addCacheStatusIndicator() {
        // Check if we're on the Swagger UI page
        if (!window.ui) {
            console.log('Swagger UI not found');
            return;
        }
        
        // Create the cache status indicator
        const statusContainer = document.createElement('div');
        statusContainer.id = 'cache-status-container';
        statusContainer.style.position = 'fixed';
        statusContainer.style.top = '10px';
        statusContainer.style.right = '10px';
        statusContainer.style.padding = '10px';
        statusContainer.style.borderRadius = '5px';
        statusContainer.style.backgroundColor = '#f0f0f0';
        statusContainer.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        statusContainer.style.zIndex = '9999';
        statusContainer.style.display = 'flex';
        statusContainer.style.alignItems = 'center';
        statusContainer.style.gap = '10px';
        
        // Create the status indicator
        const statusIndicator = document.createElement('div');
        statusIndicator.id = 'cache-status-indicator';
        statusIndicator.style.width = '20px';
        statusIndicator.style.height = '20px';
        statusIndicator.style.borderRadius = '50%';
        statusIndicator.style.backgroundColor = '#ffcc00'; // Yellow for loading
        
        // Create the status text
        const statusText = document.createElement('div');
        statusText.id = 'cache-status-text';
        statusText.textContent = 'Cache: Loading...';
        
        // Add the elements to the container
        statusContainer.appendChild(statusIndicator);
        statusContainer.appendChild(statusText);
        
        // Add the container to the page
        document.body.appendChild(statusContainer);
        
        // Check the cache status
        checkCacheStatus();
    }
    
    // Function to check the cache status
    function checkCacheStatus() {
        // Get the status indicator and text
        const statusIndicator = document.getElementById('cache-status-indicator');
        const statusText = document.getElementById('cache-status-text');
        
        // Make a request to the cache status endpoint
        fetch('/api/CacheStatus')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to get cache status');
                }
                return response.json();
            })
            .then(data => {
                // Update the status indicator and text based on the response
                if (data.isPrewarmed) {
                    statusIndicator.style.backgroundColor = '#4caf50'; // Green for ready
                    statusText.textContent = `Cache: Ready (${data.totalCacheItems} items)`;
                    
                    // Add tooltip with more details
                    const container = document.getElementById('cache-status-container');
                    container.title = `Cache Hit Ratio: ${(data.cacheHitRatio * 100).toFixed(2)}%\nTotal Hits: ${data.totalHits}\nTotal Misses: ${data.totalMisses}\nDailyActions Items: ${data.dailyActionsCacheItems}`;
                } else {
                    statusIndicator.style.backgroundColor = '#ffcc00'; // Yellow for loading
                    statusText.textContent = 'Cache: Prewarming...';
                    
                    // Check again in 2 seconds
                    setTimeout(checkCacheStatus, 2000);
                }
            })
            .catch(error => {
                console.error('Error checking cache status:', error);
                statusIndicator.style.backgroundColor = '#f44336'; // Red for error
                statusText.textContent = 'Cache: Error';
                
                // Try again in 5 seconds
                setTimeout(checkCacheStatus, 5000);
            });
    }
    
    // Call the function after a delay to ensure Swagger UI is fully loaded
    setTimeout(addCacheStatusIndicator, 1000);
};
