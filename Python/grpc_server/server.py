"""gRPC server implementation for the PythonML service."""

import os
import sys
import json
import time
import logging
import signal
import threading
import concurrent.futures
from concurrent import futures
from typing import Dict, Any, Iterator

import grpc

# Import the generated protobuf classes
# These will be available after running generate_proto.py
from pythonml_pb2 import (
    ProcessRequest, ProcessResponse, 
    ProcessResponseChunk,
    TrainRequest, TrainResponse,
    TrainRequestChunk,
    ModelInfoRequest, ModelInfoResponse,
    ListModelsRequest, ListModelsResponse,
    ModelSummary,
    ModelStageRequest, ModelStageResponse,
    HealthCheckRequest, HealthCheckResponse
)
from pythonml_pb2_grpc import (
    PythonMLServiceServicer,
    add_PythonMLServiceServicer_to_server
)

from model_manager import ModelManager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("gRPC_Server")

class PythonMLServicer(PythonMLServiceServicer):
    """Implementation of the PythonML gRPC service."""

    def __init__(self, model_manager: ModelManager):
        """Initialize the servicer.
        
        Args:
            model_manager: The model manager to use
        """
        self.model_manager = model_manager
        self.start_time = time.time()
        logger.info("PythonML Servicer initialized")

    def ProcessData(self, request: ProcessRequest, context: grpc.ServicerContext) -> ProcessResponse:
        """Process data using a machine learning model.
        
        Args:
            request: The process request
            context: The gRPC context
            
        Returns:
            The process response
        """
        start_time = time.time()
        logger.info(f"Processing data with model: {request.model_name}")
        
        try:
            # Convert parameters map to dictionary
            parameters = dict(request.parameters)
            
            # Process the data
            result, confidence, metadata = self.model_manager.process_data(
                request.input_data,
                request.model_name,
                parameters,
                request.version if request.version else None,
                request.stage if request.stage else None
            )
            
            # Create response
            response = ProcessResponse(
                result=result,
                success=True,
                confidence_score=confidence
            )
            
            # Add metadata
            for key, value in metadata.items():
                response.metadata[key] = value
            
            logger.info(f"Successfully processed data with model {request.model_name} in {time.time() - start_time:.2f}s")
            return response
            
        except Exception as e:
            logger.error(f"Error processing data: {str(e)}")
            return ProcessResponse(
                success=False,
                error_message=str(e),
                confidence_score=0.0
            )

    def ProcessDataStream(self, request: ProcessRequest, context: grpc.ServicerContext) -> Iterator[ProcessResponseChunk]:
        """Process data using a model and stream the results.
        
        Args:
            request: The process request
            context: The gRPC context
            
        Yields:
            Chunks of the process response
        """
        start_time = time.time()
        logger.info(f"Processing data stream with model: {request.model_name}")
        
        try:
            # Convert parameters map to dictionary
            parameters = dict(request.parameters)
            
            # Process the data in chunks
            chunk_generator = self.model_manager.process_data_stream(
                request.input_data,
                request.model_name,
                parameters,
                request.version if request.version else None,
                request.stage if request.stage else None
            )
            
            # Yield each chunk as a response
            for chunk in chunk_generator:
                # Create response chunk
                response_chunk = ProcessResponseChunk(
                    result_chunk=chunk["result_chunk"],
                    is_last_chunk=chunk["is_last_chunk"],
                    success=chunk["success"],
                    chunk_id=chunk["chunk_id"],
                    total_chunks=chunk["total_chunks"]
                )
                
                # Add error message if present
                if "error_message" in chunk and chunk["error_message"]:
                    response_chunk.error_message = chunk["error_message"]
                
                # Add confidence score only in the last chunk
                if chunk["is_last_chunk"]:
                    response_chunk.confidence_score = chunk["confidence_score"]
                    
                    # Add metadata in the last chunk
                    for key, value in chunk.get("metadata", {}).items():
                        response_chunk.metadata[key] = value
                
                yield response_chunk
                
            logger.info(f"Successfully processed data stream with model {request.model_name} in {time.time() - start_time:.2f}s")
            
        except Exception as e:
            logger.error(f"Error processing data stream: {str(e)}")
            yield ProcessResponseChunk(
                success=False,
                error_message=str(e),
                is_last_chunk=True,
                chunk_id=0,
                total_chunks=1
            )

    def TrainModel(self, request: TrainRequest, context: grpc.ServicerContext) -> TrainResponse:
        """Train a machine learning model.
        
        Args:
            request: The train request
            context: The gRPC context
            
        Returns:
            The train response
        """
        start_time = time.time()
        logger.info(f"Training model: {request.model_name}")
        
        try:
            # Convert hyperparameters map to dictionary
            hyperparameters = dict(request.hyperparameters)
            
            # Train the model
            success, model_id, metrics, version, stage = self.model_manager.train_model(
                request.training_data,
                request.model_name,
                hyperparameters,
                request.validate,
                request.framework if request.framework else 'scikit-learn',
                request.initial_stage if request.initial_stage else 'development'
            )
            
            # Create response
            response = TrainResponse(
                success=success,
                model_id=model_id,
                version=version,
                stage=stage
            )
            
            # Add metrics
            for key, value in metrics.items():
                response.metrics[key] = value
            
            if success:
                logger.info(f"Successfully trained model {request.model_name} in {time.time() - start_time:.2f}s")
            else:
                logger.error(f"Failed to train model {request.model_name}")
                response.error_message = metrics.get("error", "Unknown error")
            
            return response
            
        except Exception as e:
            logger.error(f"Error training model: {str(e)}")
            return TrainResponse(
                success=False,
                error_message=str(e)
            )

    def TrainModelStream(self, request_iterator: Iterator[TrainRequestChunk], 
                       context: grpc.ServicerContext) -> TrainResponse:
        """Train a model with streaming data chunks.
        
        Args:
            request_iterator: Iterator of training data chunks
            context: The gRPC context
            
        Returns:
            The train response
        """
        start_time = time.time()
        logger.info("Training model with streaming data")
        
        try:
            # Train the model with streaming data
            success, model_id, metrics, version, stage = self.model_manager.train_model_stream(request_iterator)
            
            # Create response
            response = TrainResponse(
                success=success,
                model_id=model_id,
                version=version,
                stage=stage
            )
            
            # Add metrics
            for key, value in metrics.items():
                response.metrics[key] = value
            
            if success:
                logger.info(f"Successfully trained model with streaming data in {time.time() - start_time:.2f}s")
            else:
                logger.error("Failed to train model with streaming data")
                response.error_message = metrics.get("error", "Unknown error")
            
            return response
            
        except Exception as e:
            logger.error(f"Error training model with streaming data: {str(e)}")
            return TrainResponse(
                success=False,
                error_message=str(e)
            )

    def GetModelInfo(self, request: ModelInfoRequest, context: grpc.ServicerContext) -> ModelInfoResponse:
        """Get information about a machine learning model.
        
        Args:
            request: The model info request
            context: The gRPC context
            
        Returns:
            The model info response
        """
        logger.info(f"Getting info for model: {request.model_name}")
        
        try:
            # Get model info
            info = self.model_manager.get_model_info(
                request.model_name,
                request.version if request.version else None,
                request.stage if request.stage else None
            )
            
            # Create response
            response = ModelInfoResponse(
                model_name=info["model_name"],
                version=info["version"],
                description=info.get("description", ""),
                framework=info.get("framework", "scikit-learn"),
                stage=info.get("stage", "development"),
                created_at=info.get("created_at", ""),
                updated_at=info.get("updated_at", "")
            )
            
            # Add supported operations
            for op in info.get("supported_operations", []):
                response.supported_operations.append(op)
            
            # Add properties
            for key, value in info.get("properties", {}).items():
                if isinstance(value, str):
                    response.properties[key] = value
                else:
                    # Convert non-string values to string
                    response.properties[key] = str(value)
            
            # Add available versions
            for version in info.get("versions", {}).keys():
                response.available_versions.append(version)
            
            # Add stage versions
            for stage, version in info.get("stage_versions", {}).items():
                response.stage_versions[stage] = version
            
            logger.info(f"Successfully retrieved info for model {request.model_name}")
            return response
            
        except Exception as e:
            logger.error(f"Error getting model info: {str(e)}")
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details(str(e))
            return ModelInfoResponse()

    def ListModels(self, request: ListModelsRequest, context: grpc.ServicerContext) -> ListModelsResponse:
        """List available machine learning models.
        
        Args:
            request: The list models request
            context: The gRPC context
            
        Returns:
            The list models response
        """
        logger.info("Listing models")
        
        try:
            # Get list of models
            models = self.model_manager.list_models(
                framework_filter=request.framework_filter if request.framework_filter else None,
                stage_filter=request.stage_filter if request.stage_filter else None,
                include_all_versions=request.include_all_versions
            )
            
            # Create response
            response = ListModelsResponse()
            
            # Add models
            for model_info in models:
                model_summary = ModelSummary(
                    model_name=model_info["model_name"],
                    version=model_info["version"],
                    description=model_info.get("description", ""),
                    framework=model_info.get("framework", "scikit-learn"),
                    stage=model_info.get("stage", "development"),
                    created_at=model_info.get("created_at", ""),
                    updated_at=model_info.get("updated_at", "")
                )
                response.models.append(model_summary)
            
            logger.info(f"Successfully listed {len(models)} models")
            return response
            
        except Exception as e:
            logger.error(f"Error listing models: {str(e)}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(e))
            return ListModelsResponse()

    def ChangeModelStage(self, request: ModelStageRequest, context: grpc.ServicerContext) -> ModelStageResponse:
        """Change the stage of a model version.
        
        Args:
            request: The model stage request
            context: The gRPC context
            
        Returns:
            The model stage response
        """
        logger.info(f"Changing stage for model {request.model_name} version {request.version} "
                   f"from {request.current_stage} to {request.new_stage}")
        
        try:
            # Change model stage
            result = self.model_manager.change_model_stage(
                request.model_name,
                request.version,
                request.current_stage if request.current_stage else None,
                request.new_stage
            )
            
            # Create response
            response = ModelStageResponse(
                success=result["success"],
                model_name=result["model_name"],
                version=result["version"],
                previous_stage=result["previous_stage"],
                new_stage=result["new_stage"]
            )
            
            logger.info(f"Successfully changed stage for model {request.model_name}")
            return response
            
        except Exception as e:
            logger.error(f"Error changing model stage: {str(e)}")
            return ModelStageResponse(
                success=False,
                error_message=str(e),
                model_name=request.model_name,
                version=request.version
            )

    def CheckHealth(self, request: HealthCheckRequest, context: grpc.ServicerContext) -> HealthCheckResponse:
        """Check the health of the service.
        
        Args:
            request: The health check request
            context: The gRPC context
            
        Returns:
            The health check response
        """
        logger.info(f"Health check requested for component: {request.component or 'all'}")
        
        try:
            # Check uptime
            uptime = time.time() - self.start_time
            
            # Check if model manager is functioning
            models = self.model_manager.list_models()
            
            # Get framework information
            frameworks = []
            for framework in ["scikit-learn", "tensorflow", "pytorch"]:
                if framework in self.model_manager.SUPPORTED_FRAMEWORKS:
                    frameworks.append(framework)
            
            # Create response
            response = HealthCheckResponse(
                status=HealthCheckResponse.Status.SERVING,
                message=f"Service is healthy. Uptime: {uptime:.2f}s. Models: {len(models)}. Frameworks: {', '.join(frameworks)}"
            )
            
            logger.info("Health check passed")
            return response
            
        except Exception as e:
            logger.error(f"Health check failed: {str(e)}")
            return HealthCheckResponse(
                status=HealthCheckResponse.Status.NOT_SERVING,
                message=f"Service is unhealthy: {str(e)}"
            )


def serve(port: int = 50051, max_workers: int = 10):
    """Start the gRPC server.
    
    Args:
        port: The port to listen on
        max_workers: The maximum number of workers
    """
    # Create the model manager
    model_manager = ModelManager(models_dir="models")
    
    # Create a gRPC server
    server = grpc.server(
        futures.ThreadPoolExecutor(max_workers=max_workers),
        options=[
            ('grpc.max_send_message_length', 100 * 1024 * 1024),  # 100 MB
            ('grpc.max_receive_message_length', 100 * 1024 * 1024),  # 100 MB
        ]
    )
    
    # Add the servicer to the server
    servicer = PythonMLServicer(model_manager)
    add_PythonMLServiceServicer_to_server(servicer, server)
    
    # Add a port for the server to listen on
    server_address = f"[::]:{port}"
    server.add_insecure_port(server_address)
    
    # Start the server
    server.start()
    logger.info(f"Server started, listening on {server_address}")
    
    # Function to gracefully shut down the server
    def graceful_shutdown(signum, frame):
        logger.info("Received shutdown signal, stopping server...")
        server.stop(grace=5)  # 5 seconds grace period
        logger.info("Server stopped")
        sys.exit(0)
    
    # Register signal handlers
    signal.signal(signal.SIGINT, graceful_shutdown)
    signal.signal(signal.SIGTERM, graceful_shutdown)
    
    # Keep the server running
    try:
        while True:
            time.sleep(60 * 60 * 24)  # Sleep for 24 hours
    except KeyboardInterrupt:
        graceful_shutdown(None, None)


if __name__ == "__main__":
    # Parse command line arguments
    import argparse
    parser = argparse.ArgumentParser(description="PythonML gRPC Server")
    parser.add_argument("--port", type=int, default=50051, help="Port to listen on")
    parser.add_argument("--workers", type=int, default=10, help="Maximum number of workers")
    parser.add_argument("--max-message-size", type=int, default=100, 
                       help="Maximum message size in MB (for streaming large datasets)")
    args = parser.parse_args()
    
    # Start the server
    serve(port=args.port, max_workers=args.workers)