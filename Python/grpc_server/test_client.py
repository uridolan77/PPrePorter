"""Test client for the PythonML gRPC server."""

import os
import sys
import json
import time
import argparse
import logging

import grpc

# Import the generated protobuf classes
# These will be available after running generate_proto.py
from pythonml_pb2 import (
    ProcessRequest, TrainRequest, ModelInfoRequest, HealthCheckRequest
)
from pythonml_pb2_grpc import PythonMLServiceStub

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("gRPC_Client")

def test_health_check(stub):
    """Test the health check endpoint.
    
    Args:
        stub: The gRPC stub
        
    Returns:
        True if the health check passed, False otherwise
    """
    logger.info("Testing health check...")
    request = HealthCheckRequest()
    
    try:
        response = stub.CheckHealth(request)
        logger.info(f"Health check response: {response.status} - {response.message}")
        return response.status == 0  # 0 = SERVING
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return False

def test_train_model(stub, model_name, algorithm="random_forest"):
    """Test training a model.
    
    Args:
        stub: The gRPC stub
        model_name: The name of the model to train
        algorithm: The algorithm to use (default: random_forest)
        
    Returns:
        True if the training was successful, False otherwise
    """
    logger.info(f"Testing model training for '{model_name}' using {algorithm}...")
    
    # Generate sample training data
    if algorithm in ["random_forest", "logistic_regression", "svm"]:
        # Classification data
        training_data = {
            "features": [
                [1.0, 2.0, 3.0, 4.0],
                [2.0, 3.0, 4.0, 5.0],
                [3.0, 4.0, 5.0, 6.0],
                [4.0, 5.0, 6.0, 7.0],
                [5.0, 6.0, 7.0, 8.0]
            ],
            "target": [0, 0, 1, 1, 1]
        }
        model_type = "classification"
    else:
        # Regression data
        training_data = {
            "features": [
                [1.0],
                [2.0],
                [3.0],
                [4.0],
                [5.0]
            ],
            "target": [2.0, 4.0, 6.0, 8.0, 10.0]
        }
        model_type = "regression"
    
    # Create request
    request = TrainRequest(
        training_data=json.dumps(training_data),
        model_name=model_name,
        validate=True
    )
    
    # Add hyperparameters
    request.hyperparameters["model_type"] = model_type
    request.hyperparameters["algorithm"] = algorithm
    request.hyperparameters["description"] = f"Test {model_type} model using {algorithm}"
    
    if algorithm in ["random_forest"]:
        request.hyperparameters["n_estimators"] = "10"
        request.hyperparameters["max_depth"] = "3"
    elif algorithm in ["logistic_regression", "svm", "svr"]:
        request.hyperparameters["C"] = "1.0"
    
    try:
        response = stub.TrainModel(request)
        
        if response.success:
            logger.info(f"Model training successful. Model ID: {response.model_id}")
            logger.info(f"Metrics: {dict(response.metrics)}")
            return True
        else:
            logger.error(f"Model training failed: {response.error_message}")
            return False
    except Exception as e:
        logger.error(f"Model training failed: {str(e)}")
        return False

def test_get_model_info(stub, model_name):
    """Test getting model information.
    
    Args:
        stub: The gRPC stub
        model_name: The name of the model
        
    Returns:
        True if the model info was retrieved, False otherwise
    """
    logger.info(f"Testing get model info for '{model_name}'...")
    request = ModelInfoRequest(model_name=model_name)
    
    try:
        response = stub.GetModelInfo(request)
        logger.info(f"Model info: {response.model_name} - {response.version}")
        logger.info(f"Description: {response.description}")
        logger.info(f"Supported operations: {list(response.supported_operations)}")
        logger.info(f"Properties: {dict(response.properties)}")
        return True
    except Exception as e:
        logger.error(f"Get model info failed: {str(e)}")
        return False

def test_process_data(stub, model_name):
    """Test processing data with a model.
    
    Args:
        stub: The gRPC stub
        model_name: The name of the model to use
        
    Returns:
        True if the processing was successful, False otherwise
    """
    logger.info(f"Testing data processing with model '{model_name}'...")
    
    # Get model info to determine data format
    try:
        info_request = ModelInfoRequest(model_name=model_name)
        info_response = stub.GetModelInfo(info_request)
        model_type = info_response.properties.get("type", "unknown")
        
        # Generate sample test data based on model type
        if model_type.lower() == "classification":
            test_data = [[2.5, 3.5, 4.5, 5.5]]  # Single sample
        else:
            test_data = [[3.5]]  # Single sample
        
        # Create request
        request = ProcessRequest(
            input_data=json.dumps(test_data),
            model_name=model_name
        )
        
        # Add parameters
        request.parameters["include_feature_importance"] = "true"
        
        # Send request
        response = stub.ProcessData(request)
        
        if response.success:
            logger.info(f"Data processing successful. Result: {response.result}")
            logger.info(f"Confidence score: {response.confidence_score}")
            logger.info(f"Metadata: {dict(response.metadata)}")
            return True
        else:
            logger.error(f"Data processing failed: {response.error_message}")
            return False
    except Exception as e:
        logger.error(f"Data processing failed: {str(e)}")
        return False

def run_tests(server_address="localhost:50051"):
    """Run all tests.
    
    Args:
        server_address: The server address (default: localhost:50051)
        
    Returns:
        True if all tests passed, False otherwise
    """
    # Create a gRPC channel
    with grpc.insecure_channel(
        server_address,
        options=[
            ('grpc.max_send_message_length', 50 * 1024 * 1024),  # 50 MB
            ('grpc.max_receive_message_length', 50 * 1024 * 1024),  # 50 MB
        ]
    ) as channel:
        # Create a stub
        stub = PythonMLServiceStub(channel)
        
        # Run tests
        tests = [
            ("Health Check", lambda: test_health_check(stub)),
            ("Train Classification Model", lambda: test_train_model(stub, "test_classifier", "random_forest")),
            ("Train Regression Model", lambda: test_train_model(stub, "test_regressor", "linear_regression")),
            ("Get Classification Model Info", lambda: test_get_model_info(stub, "test_classifier")),
            ("Get Regression Model Info", lambda: test_get_model_info(stub, "test_regressor")),
            ("Process Data with Classification Model", lambda: test_process_data(stub, "test_classifier")),
            ("Process Data with Regression Model", lambda: test_process_data(stub, "test_regressor"))
        ]
        
        results = []
        for name, test_func in tests:
            logger.info(f"\n=== Running test: {name} ===")
            start_time = time.time()
            success = test_func()
            elapsed = time.time() - start_time
            
            if success:
                logger.info(f"✅ Test '{name}' passed in {elapsed:.2f}s")
            else:
                logger.error(f"❌ Test '{name}' failed in {elapsed:.2f}s")
            
            results.append(success)
        
        # Print summary
        logger.info("\n=== Test Summary ===")
        for i, (name, _) in enumerate(tests):
            status = "✅ PASSED" if results[i] else "❌ FAILED"
            logger.info(f"{status} - {name}")
        
        return all(results)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test client for the PythonML gRPC server")
    parser.add_argument("--server", type=str, default="localhost:50051", help="Server address")
    args = parser.parse_args()
    
    success = run_tests(args.server)
    sys.exit(0 if success else 1)