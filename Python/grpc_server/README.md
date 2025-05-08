# PPrePorter Python-C# gRPC Integration

This project provides a comprehensive integration between C# and Python for machine learning operations using gRPC.

## Overview

The integration consists of two main components:

1. **C# Libraries**:
   - `PPrePorter.gRPC.Core`: Core gRPC communication layer with protocol definitions, client implementations, and retry/error handling logic
   - `PPrePorter.PythonML`: Higher-level C# library that uses the core gRPC library to interact with Python ML models

2. **Python Server**:
   - A gRPC server that handles requests from the C# client
   - Model management with support for training, inference, and model information retrieval
   - Support for scikit-learn models with extensibility for other frameworks

## Getting Started

### Prerequisites

#### C# Components
- .NET 9.0 or later
- Visual Studio 2025 or later / VS Code with C# extensions

#### Python Components
- Python 3.8 or later
- Required packages (see `requirements.txt`)

### Installation

#### Python Server Setup

1. Navigate to the Python server directory:
   ```
   cd c:\dev\PPrePorter\Python\grpc_server
   ```

2. Create a virtual environment (recommended):
   ```
   python -m venv venv
   venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Generate Python code from the protocol buffer definition:
   ```
   python generate_proto.py
   ```

5. Start the server:
   ```
   python server.py --port 50051 --workers 10
   ```

#### C# Client Setup

1. Add the required references to your project:
   ```xml
   <ItemGroup>
     <ProjectReference Include="..\PPrePorter.gRPC.Core\PPrePorter.gRPC.Core.csproj" />
     <ProjectReference Include="..\PPrePorter.PythonML\PPrePorter.PythonML.csproj" />
   </ItemGroup>
   ```

2. Configure services in your `Program.cs` or `Startup.cs`:
   ```csharp
   services.AddPythonML(
       configureGrpcOptions: options => {
           options.ServiceAddress = "http://localhost:50051";
           options.TimeoutSeconds = 30;
           options.MaxRetryAttempts = 3;
       },
       configurePythonMLOptions: options => {
           options.DefaultModel = "default_model";
           options.ModelBasePath = "Models";
       });
   ```

## Usage

### C# Client Example

```csharp
// Get the PythonML service from DI
var pythonMLService = serviceProvider.GetRequiredService<IPythonMLService>();

// Process data using a model
var predictionResult = await pythonMLService.PredictAsync(
    inputData: jsonData,
    modelName: "my_model",
    parameters: new Dictionary<string, string> {
        ["include_feature_importance"] = "true"
    });

if (predictionResult.Success)
{
    Console.WriteLine($"Prediction result: {predictionResult.Result}");
    Console.WriteLine($"Confidence: {predictionResult.ConfidenceScore}");
}
else
{
    Console.WriteLine($"Prediction failed: {predictionResult.ErrorMessage}");
}

// Train a new model
var trainingResult = await pythonMLService.TrainModelAsync(
    trainingData: jsonTrainingData,
    modelName: "new_model",
    hyperparameters: new Dictionary<string, string> {
        ["model_type"] = "classification",
        ["algorithm"] = "random_forest",
        ["n_estimators"] = "100",
        ["max_depth"] = "10"
    },
    validate: true);

if (trainingResult.Success)
{
    Console.WriteLine($"Model trained successfully: {trainingResult.ModelId}");
    foreach (var metric in trainingResult.Metrics)
    {
        Console.WriteLine($"{metric.Key}: {metric.Value}");
    }
}
```

### Python Server Testing

You can use the included `test_client.py` script to test the Python server:

```
python test_client.py --server localhost:50051
```

This will run a series of tests to verify that the server is working correctly.

## Architecture

### gRPC Protocol

The communication between C# and Python is defined in the `pythonml.proto` file, which specifies:

- `ProcessData`: For model inference/prediction
- `TrainModel`: For training new models
- `GetModelInfo`: For retrieving model metadata
- `CheckHealth`: For service health checks

### C# Components

- **PythonMLClient**: Handles low-level gRPC communication with retry logic
- **PythonMLClientFactory**: Creates and manages client instances
- **PythonMLService**: High-level service for ML operations

### Python Components

- **ModelManager**: Manages ML models (loading, saving, registering)
- **PythonMLServicer**: Implements the gRPC service interface
- **Server**: Sets up and runs the gRPC server

## Extending the System

### Adding Support for New ML Frameworks

To add support for new ML frameworks beyond scikit-learn:

1. Extend the `ModelManager` class to handle the new framework
2. Update the training and inference logic
3. Ensure proper serialization/deserialization

### Adding New Operations

To add new operations:

1. Update the `pythonml.proto` file with new message types and service methods
2. Regenerate the protocol code (both C# and Python)
3. Implement the new methods in both the C# client and Python server

## Troubleshooting

- **Connection Issues**: Ensure the server is running and the port is accessible
- **Timeout Errors**: Increase the timeout settings for long-running operations
- **Serialization Errors**: Check JSON data format for compatibility

## License

This project is licensed under the MIT License - see the LICENSE file for details.