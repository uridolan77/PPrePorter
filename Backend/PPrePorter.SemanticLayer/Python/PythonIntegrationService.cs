using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PPrePorter.SemanticLayer.Models.Configuration;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;

namespace PPrePorter.SemanticLayer.Python
{
    /// <summary>
    /// Service for integrating with Python for advanced analytics
    /// </summary>
    public class PythonIntegrationService : IPythonIntegrationService
    {
        private readonly ILogger<PythonIntegrationService> _logger;
        private readonly SemanticLayerConfig _config;
        private readonly string _pythonPath;
        private readonly string _scriptsFolder;
        
        public PythonIntegrationService(
            ILogger<PythonIntegrationService> logger,
            IOptions<SemanticLayerConfig> config)
        {
            _logger = logger;
            _config = config.Value;
            
            // Default to Python in PATH
            _pythonPath = Environment.GetEnvironmentVariable("PYTHON_PATH") ?? "python";
            
            // Default scripts folder to Python subdirectory
            _scriptsFolder = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Python");
            
            // Ensure scripts folder exists
            if (!Directory.Exists(_scriptsFolder))
            {
                Directory.CreateDirectory(_scriptsFolder);
            }
        }
        
        /// <summary>
        /// Executes a Python script with the given input and returns the result
        /// </summary>
        public async Task<Dictionary<string, object>> ExecuteScriptAsync(string scriptName, Dictionary<string, object> input)
        {
            _logger.LogInformation("Executing Python script: {ScriptName}", scriptName);
            
            try
            {
                // Full path to the script
                var scriptPath = Path.Combine(_scriptsFolder, scriptName);
                
                // Check if script exists
                if (!File.Exists(scriptPath))
                {
                    throw new FileNotFoundException($"Python script not found: {scriptName}", scriptPath);
                }
                
                // Serialize input to JSON
                var inputJson = JsonSerializer.Serialize(input);
                var inputFile = Path.GetTempFileName();
                await File.WriteAllTextAsync(inputFile, inputJson);
                
                // Output file
                var outputFile = Path.GetTempFileName();
                
                try
                {
                    // Create process to run Python script
                    using var process = new Process();
                    process.StartInfo.FileName = _pythonPath;
                    process.StartInfo.Arguments = $"\"{scriptPath}\" \"{inputFile}\" \"{outputFile}\"";
                    process.StartInfo.UseShellExecute = false;
                    process.StartInfo.RedirectStandardOutput = true;
                    process.StartInfo.RedirectStandardError = true;
                    process.StartInfo.CreateNoWindow = true;
                    
                    // Set up event handlers for output and error
                    var output = new List<string>();
                    var error = new List<string>();
                    
                    process.OutputDataReceived += (sender, e) => 
                    {
                        if (e.Data != null)
                        {
                            output.Add(e.Data);
                        }
                    };
                    
                    process.ErrorDataReceived += (sender, e) => 
                    {
                        if (e.Data != null)
                        {
                            error.Add(e.Data);
                        }
                    };
                    
                    // Start the process
                    process.Start();
                    process.BeginOutputReadLine();
                    process.BeginErrorReadLine();
                    
                    // Wait for the process to exit
                    await process.WaitForExitAsync();
                    
                    // Check for errors
                    if (process.ExitCode != 0)
                    {
                        var errorMessage = string.Join(Environment.NewLine, error);
                        throw new Exception($"Python script execution failed with exit code {process.ExitCode}: {errorMessage}");
                    }
                    
                    // Read the output file
                    var outputJson = await File.ReadAllTextAsync(outputFile);
                    var result = JsonSerializer.Deserialize<Dictionary<string, object>>(outputJson) ?? new Dictionary<string, object>();
                    
                    _logger.LogInformation("Python script executed successfully: {ScriptName}", scriptName);
                    
                    return result;
                }
                finally
                {
                    // Clean up temporary files
                    if (File.Exists(inputFile))
                    {
                        File.Delete(inputFile);
                    }
                    
                    if (File.Exists(outputFile))
                    {
                        File.Delete(outputFile);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing Python script {ScriptName}", scriptName);
                throw;
            }
        }
        
        /// <summary>
        /// Predicts future values based on historical data
        /// </summary>
        public async Task<Dictionary<string, object>> PredictAsync(string model, Dictionary<string, object> data)
        {
            _logger.LogInformation("Predicting using model: {Model}", model);
            
            // Prepare input for prediction script
            var input = new Dictionary<string, object>
            {
                ["model"] = model,
                ["data"] = data
            };
            
            // Execute prediction script
            return await ExecuteScriptAsync("predict.py", input);
        }
        
        /// <summary>
        /// Analyzes data for trends and insights
        /// </summary>
        public async Task<Dictionary<string, object>> AnalyzeAsync(Dictionary<string, object> data, string analysisType)
        {
            _logger.LogInformation("Analyzing data with type: {AnalysisType}", analysisType);
            
            // Prepare input for analysis script
            var input = new Dictionary<string, object>
            {
                ["data"] = data,
                ["analysis_type"] = analysisType
            };
            
            // Execute analysis script
            return await ExecuteScriptAsync("analyze.py", input);
        }
        
        /// <summary>
        /// Generates a recommendation based on user behavior
        /// </summary>
        public async Task<Dictionary<string, object>> RecommendAsync(string userId, Dictionary<string, object> context)
        {
            _logger.LogInformation("Generating recommendations for user: {UserId}", userId);
            
            // Prepare input for recommendation script
            var input = new Dictionary<string, object>
            {
                ["user_id"] = userId,
                ["context"] = context
            };
            
            // Execute recommendation script
            return await ExecuteScriptAsync("recommend.py", input);
        }
        
        /// <summary>
        /// Checks if Python environment is properly configured
        /// </summary>
        public async Task<bool> VerifyEnvironmentAsync()
        {
            try
            {
                // Create process to check Python version
                using var process = new Process();
                process.StartInfo.FileName = _pythonPath;
                process.StartInfo.Arguments = "--version";
                process.StartInfo.UseShellExecute = false;
                process.StartInfo.RedirectStandardOutput = true;
                process.StartInfo.CreateNoWindow = true;
                
                process.Start();
                var output = await process.StandardOutput.ReadToEndAsync();
                await process.WaitForExitAsync();
                
                if (process.ExitCode != 0)
                {
                    _logger.LogError("Python environment verification failed: Python not found or error running Python");
                    return false;
                }
                
                _logger.LogInformation("Python environment verified: {Version}", output.Trim());
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying Python environment");
                return false;
            }
        }
    }
    
    /// <summary>
    /// Interface for Python integration service
    /// </summary>
    public interface IPythonIntegrationService
    {
        /// <summary>
        /// Executes a Python script with the given input and returns the result
        /// </summary>
        Task<Dictionary<string, object>> ExecuteScriptAsync(string scriptName, Dictionary<string, object> input);
        
        /// <summary>
        /// Predicts future values based on historical data
        /// </summary>
        Task<Dictionary<string, object>> PredictAsync(string model, Dictionary<string, object> data);
        
        /// <summary>
        /// Analyzes data for trends and insights
        /// </summary>
        Task<Dictionary<string, object>> AnalyzeAsync(Dictionary<string, object> data, string analysisType);
        
        /// <summary>
        /// Generates a recommendation based on user behavior
        /// </summary>
        Task<Dictionary<string, object>> RecommendAsync(string userId, Dictionary<string, object> context);
        
        /// <summary>
        /// Checks if Python environment is properly configured
        /// </summary>
        Task<bool> VerifyEnvironmentAsync();
    }
}