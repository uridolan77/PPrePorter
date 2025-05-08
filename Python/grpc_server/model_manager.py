"""Enhanced model manager for the Python ML gRPC server.

Supports model versioning, staging, and multiple ML frameworks.
"""

import os
import json
import pickle
import time
import uuid
import shutil
from typing import Dict, List, Optional, Any, Tuple, BinaryIO
from datetime import datetime
import io
import tempfile

import numpy as np
import pandas as pd

# Import scikit-learn models
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.svm import SVC, SVR
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, r2_score, mean_squared_error

# Import TensorFlow conditionally
try:
    import tensorflow as tf
    TENSORFLOW_AVAILABLE = True
except ImportError:
    TENSORFLOW_AVAILABLE = False

# Import PyTorch conditionally
try:
    import torch
    import torch.nn as nn
    PYTORCH_AVAILABLE = True
except ImportError:
    PYTORCH_AVAILABLE = False

# Supported ML frameworks
SUPPORTED_FRAMEWORKS = ["scikit-learn"]
if TENSORFLOW_AVAILABLE:
    SUPPORTED_FRAMEWORKS.append("tensorflow")
if PYTORCH_AVAILABLE:
    SUPPORTED_FRAMEWORKS.append("pytorch")

# Valid model stages
VALID_STAGES = ["development", "staging", "production", "archived"]

class ModelManager:
    """Enhanced model manager for the gRPC server.
    
    Supports:
    - Multi-framework (scikit-learn, TensorFlow, PyTorch)
    - Model versioning
    - Model staging (development, staging, production, archived)
    - Streaming data processing
    """
    
    def __init__(self, models_dir: str = "models"):
        """Initialize the model manager.
        
        Args:
            models_dir: Directory to store models
        """
        self.models_dir = models_dir
        self.models: Dict[str, Dict[str, Any]] = {}
        self.model_registry: Dict[str, Dict[str, Any]] = {}
        
        # Create models directory if it doesn't exist
        os.makedirs(self.models_dir, exist_ok=True)
        
        # Create subdirectories for each framework
        for framework in SUPPORTED_FRAMEWORKS:
            os.makedirs(os.path.join(self.models_dir, framework), exist_ok=True)
        
        # Load model registry if it exists
        self._load_registry()
        
        print(f"Model Manager initialized with frameworks: {SUPPORTED_FRAMEWORKS}")
    
    def _load_registry(self) -> None:
        """Load the model registry from disk."""
        registry_path = os.path.join(self.models_dir, "model_registry.json")
        if os.path.exists(registry_path):
            try:
                with open(registry_path, "r") as f:
                    self.model_registry = json.load(f)
                print(f"Loaded {len(self.model_registry)} models from registry")
            except Exception as e:
                print(f"Error loading model registry: {e}")
                self.model_registry = {}
    
    def _save_registry(self) -> None:
        """Save the model registry to disk."""
        registry_path = os.path.join(self.models_dir, "model_registry.json")
        try:
            with open(registry_path, "w") as f:
                json.dump(self.model_registry, f, indent=2)
        except Exception as e:
            print(f"Error saving model registry: {e}")
    
    def get_model_info(self, model_name: str, version: str = None, stage: str = None) -> Dict[str, Any]:
        """Get information about a model.
        
        Args:
            model_name: Name of the model
            version: Specific version to retrieve (default: latest)
            stage: Stage to retrieve (development, staging, production)
            
        Returns:
            Dictionary with model information
            
        Raises:
            ValueError: If model does not exist
        """
        if model_name not in self.model_registry:
            raise ValueError(f"Model '{model_name}' does not exist")
        
        info = self.model_registry[model_name].copy()
        
        # If stage is specified, get the version for that stage
        if stage and not version:
            if stage not in info["stage_versions"]:
                raise ValueError(f"No version found for stage '{stage}' of model '{model_name}'")
            version = info["stage_versions"][stage]
        
        # If no version is specified, use the latest
        if not version:
            version = info["latest_version"]
        
        # Get the specific version info
        if version not in info["versions"]:
            raise ValueError(f"Version '{version}' does not exist for model '{model_name}'")
        
        # Combine base info with version-specific info
        result = {**info, **info["versions"][version]}
        result["version"] = version
        
        return result
    
    def list_models(self, framework_filter: str = None, stage_filter: str = None, 
                    include_all_versions: bool = False) -> List[Dict[str, Any]]:
        """List available models with optional filtering.
        
        Args:
            framework_filter: Filter by framework (e.g., "scikit-learn", "tensorflow")
            stage_filter: Filter by stage (e.g., "production", "development")
            include_all_versions: Whether to include all versions or just the latest
            
        Returns:
            List of model information dictionaries
        """
        result = []
        
        for model_name, info in self.model_registry.items():
            # Apply framework filter if specified
            if framework_filter and info.get("framework") != framework_filter:
                continue
            
            if include_all_versions:
                # Include all versions
                for version, version_info in info["versions"].items():
                    # Skip if this version doesn't match the stage filter
                    if stage_filter and version_info.get("stage") != stage_filter:
                        continue
                    
                    model_summary = {
                        "model_name": model_name,
                        "version": version,
                        "description": version_info.get("description", info.get("description", "")),
                        "framework": info.get("framework", "unknown"),
                        "stage": version_info.get("stage", "unknown"),
                        "created_at": version_info.get("created_at", ""),
                        "updated_at": version_info.get("updated_at", "")
                    }
                    result.append(model_summary)
            else:
                # Just include the latest version or the version for the requested stage
                if stage_filter:
                    # Check if there's a version for this stage
                    if stage_filter not in info.get("stage_versions", {}):
                        continue
                    
                    version = info["stage_versions"][stage_filter]
                    version_info = info["versions"][version]
                else:
                    # Use the latest version
                    version = info["latest_version"]
                    version_info = info["versions"][version]
                
                model_summary = {
                    "model_name": model_name,
                    "version": version,
                    "description": version_info.get("description", info.get("description", "")),
                    "framework": info.get("framework", "unknown"),
                    "stage": version_info.get("stage", "unknown"),
                    "created_at": version_info.get("created_at", ""),
                    "updated_at": version_info.get("updated_at", "")
                }
                result.append(model_summary)
        
        return result
    
    def change_model_stage(self, model_name: str, version: str, 
                          current_stage: str, new_stage: str) -> Dict[str, Any]:
        """Change the stage of a model version.
        
        Args:
            model_name: Name of the model
            version: Version of the model
            current_stage: Current stage of the model version
            new_stage: New stage for the model version
            
        Returns:
            Dictionary with the result of the operation
            
        Raises:
            ValueError: If model does not exist or stage change is invalid
        """
        if model_name not in self.model_registry:
            raise ValueError(f"Model '{model_name}' does not exist")
        
        info = self.model_registry[model_name]
        
        if version not in info["versions"]:
            raise ValueError(f"Version '{version}' does not exist for model '{model_name}'")
        
        if new_stage not in VALID_STAGES:
            raise ValueError(f"Invalid stage '{new_stage}'. Valid stages are: {VALID_STAGES}")
        
        version_info = info["versions"][version]
        stage = version_info.get("stage", "development")
        
        # Verify current stage if specified
        if current_stage and stage != current_stage:
            raise ValueError(f"Version '{version}' is in stage '{stage}', not '{current_stage}'")
        
        # Update the stage for this version
        previous_stage = stage
        version_info["stage"] = new_stage
        version_info["updated_at"] = datetime.now().isoformat()
        
        # Update the stage_versions mapping
        info["stage_versions"][new_stage] = version
        
        # Remove from previous stage if different
        if previous_stage != new_stage and previous_stage in info["stage_versions"]:
            # Only remove if this version is still the one mapped to the previous stage
            if info["stage_versions"][previous_stage] == version:
                del info["stage_versions"][previous_stage]
        
        # Save the registry
        self._save_registry()
        
        return {
            "success": True,
            "model_name": model_name,
            "version": version,
            "previous_stage": previous_stage,
            "new_stage": new_stage
        }
    
    def _get_model_path(self, model_name: str, version: str = None, stage: str = None) -> str:
        """Get the path to a model file.
        
        Args:
            model_name: Name of the model
            version: Version of the model (default: latest)
            stage: Stage of the model (default: None)
            
        Returns:
            The path to the model file
            
        Raises:
            ValueError: If model does not exist
        """
        if model_name not in self.model_registry:
            raise ValueError(f"Model '{model_name}' does not exist")
        
        info = self.model_registry[model_name]
        
        # If stage is specified, get the version for that stage
        if stage and not version:
            if stage not in info["stage_versions"]:
                raise ValueError(f"No version found for stage '{stage}' of model '{model_name}'")
            version = info["stage_versions"][stage]
        
        # If no version is specified, use the latest
        if not version:
            version = info["latest_version"]
        
        # Get the specific version info
        if version not in info["versions"]:
            raise ValueError(f"Version '{version}' does not exist for model '{model_name}'")
        
        version_info = info["versions"][version]
        framework = info.get("framework", "scikit-learn")
        
        # Get model filename
        model_id = f"{model_name}_{version}"
        
        if framework == "scikit-learn":
            return os.path.join(self.models_dir, framework, f"{model_id}.pkl")
        elif framework == "tensorflow":
            return os.path.join(self.models_dir, framework, model_id)
        elif framework == "pytorch":
            return os.path.join(self.models_dir, framework, f"{model_id}.pt")
        else:
            raise ValueError(f"Unsupported framework: {framework}")
    
    def _get_model_instance(self, model_name: str, version: str = None, stage: str = None) -> Any:
        """Get a model instance.
        
        Args:
            model_name: Name of the model
            version: Version of the model (default: latest)
            stage: Stage of the model (default: None)
            
        Returns:
            Model instance
            
        Raises:
            ValueError: If model does not exist or cannot be loaded
        """
        if model_name not in self.model_registry:
            raise ValueError(f"Model '{model_name}' does not exist")
        
        info = self.model_registry[model_name]
        
        # If stage is specified, get the version for that stage
        if stage and not version:
            if stage not in info["stage_versions"]:
                raise ValueError(f"No version found for stage '{stage}' of model '{model_name}'")
            version = info["stage_versions"][stage]
        
        # If no version is specified, use the latest
        if not version:
            version = info["latest_version"]
        
        # Create a cache key for the model
        model_key = f"{model_name}:{version}"
        
        # Check if model is already loaded
        if model_key in self.models:
            return self.models[model_key]
        
        # Get model path
        model_path = self._get_model_path(model_name, version)
        
        # Get framework
        framework = info.get("framework", "scikit-learn")
        
        try:
            # Load model based on framework
            if framework == "scikit-learn":
                if not os.path.exists(model_path):
                    raise ValueError(f"Model file not found: {model_path}")
                
                with open(model_path, "rb") as f:
                    model = pickle.load(f)
            
            elif framework == "tensorflow":
                if not TENSORFLOW_AVAILABLE:
                    raise ValueError("TensorFlow is not available")
                
                if not os.path.exists(model_path):
                    raise ValueError(f"Model directory not found: {model_path}")
                
                model = tf.keras.models.load_model(model_path)
            
            elif framework == "pytorch":
                if not PYTORCH_AVAILABLE:
                    raise ValueError("PyTorch is not available")
                
                if not os.path.exists(model_path):
                    raise ValueError(f"Model file not found: {model_path}")
                
                # Get model architecture from registry
                architecture = info["versions"][version].get("architecture", {})
                
                # Create a model instance
                model = self._create_pytorch_model(architecture)
                
                # Load the weights
                model.load_state_dict(torch.load(model_path))
                model.eval()  # Set to evaluation mode
            
            else:
                raise ValueError(f"Unsupported framework: {framework}")
            
            # Cache the loaded model
            self.models[model_key] = model
            return model
            
        except Exception as e:
            raise ValueError(f"Failed to load model: {str(e)}")
    
    def _create_pytorch_model(self, architecture: Dict[str, Any]) -> nn.Module:
        """Create a PyTorch model instance from architecture description.
        
        Args:
            architecture: Dictionary describing the model architecture
            
        Returns:
            PyTorch model instance
        """
        if not PYTORCH_AVAILABLE:
            raise ValueError("PyTorch is not available")
        
        model_type = architecture.get("type", "unknown")
        
        if model_type == "mlp":
            # Simple Multi-Layer Perceptron
            layers = []
            layer_sizes = architecture.get("layers", [])
            
            for i in range(len(layer_sizes) - 1):
                layers.append(nn.Linear(layer_sizes[i], layer_sizes[i+1]))
                
                # Add activation function except for the last layer
                if i < len(layer_sizes) - 2:
                    activation = architecture.get("activation", "relu")
                    if activation == "relu":
                        layers.append(nn.ReLU())
                    elif activation == "sigmoid":
                        layers.append(nn.Sigmoid())
                    elif activation == "tanh":
                        layers.append(nn.Tanh())
            
            # Create the model
            model = nn.Sequential(*layers)
            return model
        
        else:
            raise ValueError(f"Unsupported PyTorch model type: {model_type}")
    
    def process_data(self, input_data: str, model_name: str, parameters: Dict[str, str],
                     version: str = None, stage: str = None) -> Tuple[str, float, Dict[str, str]]:
        """Process data using a model.
        
        Args:
            input_data: Input data (JSON string)
            model_name: Name of the model
            parameters: Processing parameters
            version: Specific version to use (default: latest)
            stage: Specific stage to use (default: None)
            
        Returns:
            Tuple of (result, confidence_score, metadata)
            
        Raises:
            ValueError: If model does not exist or input is invalid
        """
        start_time = time.time()
        
        # Get the model
        try:
            model = self._get_model_instance(model_name, version, stage)
        except ValueError as e:
            raise ValueError(f"Error loading model: {str(e)}")
        
        # Parse input data
        try:
            data = json.loads(input_data)
        except json.JSONDecodeError:
            raise ValueError("Invalid JSON input data")
        
        # Get model info
        info = self.get_model_info(model_name, version, stage)
        framework = info.get("framework", "scikit-learn")
        model_type = info.get("properties", {}).get("type", "unknown")
        
        # Process based on framework and model type
        try:
            if framework == "scikit-learn":
                result, confidence = self._process_sklearn(model, data, model_type)
            elif framework == "tensorflow":
                result, confidence = self._process_tensorflow(model, data, model_type)
            elif framework == "pytorch":
                result, confidence = self._process_pytorch(model, data, model_type)
            else:
                raise ValueError(f"Unsupported framework: {framework}")
            
            # Calculate processing time
            processing_time = time.time() - start_time
            
            # Prepare metadata
            metadata = {
                "model_type": model_type,
                "framework": framework,
                "version": info.get("version", ""),
                "stage": info.get("stage", ""),
                "processing_time_ms": str(int(processing_time * 1000)),
            }
            
            # Add any additional metadata from parameters
            if "include_feature_importance" in parameters and parameters["include_feature_importance"].lower() == "true":
                if hasattr(model, "feature_importances_"):
                    metadata["feature_importances"] = json.dumps(model.feature_importances_.tolist())
            
            # Convert result to JSON string
            result_json = json.dumps(result)
            
            return result_json, float(confidence), metadata
            
        except Exception as e:
            raise ValueError(f"Error processing data: {str(e)}")
    
    def process_data_stream(self, input_data: str, model_name: str, parameters: Dict[str, str],
                           version: str = None, stage: str = None, chunk_size: int = 1024):
        """Process data using a model and stream the results.
        
        Args:
            input_data: Input data (JSON string)
            model_name: Name of the model
            parameters: Processing parameters
            version: Specific version to use (default: latest)
            stage: Specific stage to use (default: None)
            chunk_size: Size of result chunks for streaming
            
        Yields:
            Dictionaries representing chunks of the result
            
        Raises:
            ValueError: If model does not exist or input is invalid
        """
        start_time = time.time()
        
        try:
            # Process the data normally
            result_json, confidence, metadata = self.process_data(
                input_data, model_name, parameters, version, stage)
            
            # Split the result into chunks
            result_bytes = result_json.encode('utf-8')
            total_size = len(result_bytes)
            total_chunks = (total_size + chunk_size - 1) // chunk_size
            
            for i in range(0, total_size, chunk_size):
                chunk = result_bytes[i:i+chunk_size].decode('utf-8')
                chunk_id = i // chunk_size
                is_last = (i + chunk_size >= total_size)
                
                yield {
                    "result_chunk": chunk,
                    "is_last_chunk": is_last,
                    "success": True,
                    "chunk_id": chunk_id,
                    "total_chunks": total_chunks,
                    "confidence_score": confidence if is_last else 0.0,
                    "metadata": metadata if is_last else {}
                }
                
        except Exception as e:
            # Send error in a single chunk
            yield {
                "result_chunk": "",
                "is_last_chunk": True,
                "success": False,
                "error_message": str(e),
                "chunk_id": 0,
                "total_chunks": 1,
                "confidence_score": 0.0,
                "metadata": {}
            }
    
    def _process_sklearn(self, model: Any, data: Any, model_type: str) -> Tuple[Any, float]:
        """Process data using a scikit-learn model.
        
        Args:
            model: The scikit-learn model
            data: The input data
            model_type: The type of model
            
        Returns:
            Tuple of (result, confidence)
        """
        # Convert data to appropriate format
        if isinstance(data, list):
            # Convert to numpy array
            if all(isinstance(item, (list, tuple)) for item in data):
                # 2D array
                X = np.array(data)
            else:
                # 1D array
                X = np.array(data).reshape(-1, 1)
        elif isinstance(data, dict):
            # Convert dict to DataFrame
            X = pd.DataFrame([data])
        else:
            raise ValueError("Input data must be a list or dictionary")
        
        # Make prediction
        if model_type.lower() in ["classification", "nlp", "vision"]:
            # Classification
            if hasattr(model, "predict_proba"):
                proba = model.predict_proba(X)
                y_pred = model.predict(X)
                confidence = np.max(proba, axis=1).mean()
            else:
                y_pred = model.predict(X)
                confidence = 1.0  # No probability available
            
            result = y_pred.tolist()
        else:
            # Regression
            y_pred = model.predict(X)
            confidence = 1.0  # No natural confidence for regression
            result = y_pred.tolist()
        
        return result, confidence
    
    def _process_tensorflow(self, model: Any, data: Any, model_type: str) -> Tuple[Any, float]:
        """Process data using a TensorFlow model.
        
        Args:
            model: The TensorFlow model
            data: The input data
            model_type: The type of model
            
        Returns:
            Tuple of (result, confidence)
        """
        if not TENSORFLOW_AVAILABLE:
            raise ValueError("TensorFlow is not available")
        
        # Convert data to appropriate format
        if isinstance(data, list):
            if all(isinstance(item, (list, tuple)) for item in data):
                # 2D array
                X = np.array(data, dtype=np.float32)
            else:
                # 1D array - expand to batch
                X = np.array([data], dtype=np.float32)
        elif isinstance(data, dict):
            # For models that expect multiple inputs
            X = {}
            for key, value in data.items():
                X[key] = np.array([value], dtype=np.float32)
        else:
            raise ValueError("Input data must be a list or dictionary")
        
        # Make prediction
        predictions = model.predict(X)
        
        # Handle different output types
        if model_type.lower() in ["classification"]:
            # For classification, get class with highest probability
            if isinstance(predictions, list):
                predictions = predictions[0]  # Get the main output if multiple outputs
            
            if len(predictions.shape) >= 2 and predictions.shape[1] > 1:
                # Multi-class classification
                y_pred = np.argmax(predictions, axis=1)
                confidence = np.max(predictions, axis=1).mean()
            else:
                # Binary classification
                y_pred = (predictions > 0.5).astype(int).flatten()
                confidence = np.mean(np.maximum(predictions, 1 - predictions))
            
            result = y_pred.tolist()
        else:
            # Regression or other
            result = predictions.tolist()
            confidence = 1.0
        
        return result, confidence
    
    def _process_pytorch(self, model: Any, data: Any, model_type: str) -> Tuple[Any, float]:
        """Process data using a PyTorch model.
        
        Args:
            model: The PyTorch model
            data: The input data
            model_type: The type of model
            
        Returns:
            Tuple of (result, confidence)
        """
        if not PYTORCH_AVAILABLE:
            raise ValueError("PyTorch is not available")
        
        # Convert data to appropriate format
        if isinstance(data, list):
            if all(isinstance(item, (list, tuple)) for item in data):
                # 2D array
                X = torch.tensor(data, dtype=torch.float32)
            else:
                # 1D array - expand to batch
                X = torch.tensor([data], dtype=torch.float32)
        elif isinstance(data, dict):
            # Not directly supported - convert to tensor
            # In practice, would need custom handling based on model
            raise ValueError("Dictionary input not supported for PyTorch models")
        else:
            raise ValueError("Input data must be a list")
        
        # Disable gradient computation for inference
        with torch.no_grad():
            # Make prediction
            predictions = model(X)
            
            # Convert to numpy for easier handling
            predictions_np = predictions.numpy()
            
            # Handle different output types
            if model_type.lower() in ["classification"]:
                # For classification
                if predictions_np.shape[1] > 1:
                    # Multi-class classification
                    y_pred = np.argmax(predictions_np, axis=1)
                    
                    # Apply softmax to get probabilities
                    softmax = torch.nn.Softmax(dim=1)
                    probs = softmax(predictions).numpy()
                    confidence = np.max(probs, axis=1).mean()
                else:
                    # Binary classification
                    y_pred = (predictions_np > 0.5).astype(int).flatten()
                    confidence = np.mean(np.maximum(predictions_np, 1 - predictions_np))
                
                result = y_pred.tolist()
            else:
                # Regression or other
                result = predictions_np.tolist()
                confidence = 1.0
        
        return result, confidence
    
    def train_model(self, training_data: str, model_name: str, hyperparameters: Dict[str, str], 
                    validate: bool, framework: str = "scikit-learn", 
                    initial_stage: str = "development") -> Tuple[bool, str, Dict[str, float], str, str]:
        """Train a machine learning model.
        
        Args:
            training_data: Training data (JSON string)
            model_name: Name of the model
            hyperparameters: Hyperparameters for the model
            validate: Whether to validate the model after training
            framework: ML framework to use (default: scikit-learn)
            initial_stage: Initial stage for the model (default: development)
            
        Returns:
            Tuple of (success, model_id, metrics, version, stage)
            
        Raises:
            ValueError: If input is invalid
        """
        try:
            # Validate framework
            if framework not in SUPPORTED_FRAMEWORKS:
                raise ValueError(f"Unsupported framework: {framework}. Supported frameworks: {SUPPORTED_FRAMEWORKS}")
            
            # Validate stage
            if initial_stage not in VALID_STAGES:
                raise ValueError(f"Invalid stage: {initial_stage}. Valid stages: {VALID_STAGES}")
            
            # Parse training data
            try:
                data = json.loads(training_data)
            except json.JSONDecodeError:
                raise ValueError("Invalid JSON training data")
            
            # Generate a new version number based on timestamp
            version = datetime.now().strftime("%Y%m%d%H%M%S")
            
            # Train based on framework
            if framework == "scikit-learn":
                success, model, metrics = self._train_sklearn(model_name, data, hyperparameters, validate)
            elif framework == "tensorflow":
                success, model, metrics = self._train_tensorflow(model_name, data, hyperparameters, validate)
            elif framework == "pytorch":
                success, model, metrics = self._train_pytorch(model_name, data, hyperparameters, validate)
            else:
                raise ValueError(f"Unsupported framework: {framework}")
            
            if not success:
                return False, "", metrics, "", ""
            
            # Save the model
            model_id = self._save_model(model, model_name, version, framework, hyperparameters)
            
            # Update model registry
            description = hyperparameters.get("description", f"Model {model_name}")
            
            if model_name in self.model_registry:
                # Update existing model info
                info = self.model_registry[model_name]
                
                # Update versions
                if "versions" not in info:
                    info["versions"] = {}
                
                # Add new version info
                info["versions"][version] = {
                    "description": description,
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat(),
                    "stage": initial_stage,
                    "hyperparameters": hyperparameters
                }
                
                # Add metrics to version info
                for key, value in metrics.items():
                    info["versions"][version][f"metric_{key}"] = value
                
                # Update latest version
                info["latest_version"] = version
                
                # Update stage_versions mapping
                if "stage_versions" not in info:
                    info["stage_versions"] = {}
                
                info["stage_versions"][initial_stage] = version
                
                # Update framework if not already set
                if "framework" not in info:
                    info["framework"] = framework
                
            else:
                # Create new model entry
                self.model_registry[model_name] = {
                    "name": model_name,
                    "description": description,
                    "framework": framework,
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat(),
                    "latest_version": version,
                    "versions": {
                        version: {
                            "description": description,
                            "created_at": datetime.now().isoformat(),
                            "updated_at": datetime.now().isoformat(),
                            "stage": initial_stage,
                            "hyperparameters": hyperparameters
                        }
                    },
                    "stage_versions": {
                        initial_stage: version
                    },
                    "supported_operations": ["predict"]
                }
                
                # Add metrics to version info
                for key, value in metrics.items():
                    self.model_registry[model_name]["versions"][version][f"metric_{key}"] = value
            
            # Save registry
            self._save_registry()
            
            # Clear model cache
            self.models = {}
            
            return True, model_id, metrics, version, initial_stage
            
        except Exception as e:
            print(f"Error training model: {str(e)}")
            return False, "", {"error": str(e)}, "", ""
    
    def _train_sklearn(self, model_name: str, data: Dict[str, Any], 
                       hyperparameters: Dict[str, str], validate: bool) -> Tuple[bool, Any, Dict[str, float]]:
        """Train a scikit-learn model.
        
        Args:
            model_name: Name of the model
            data: Training data
            hyperparameters: Hyperparameters for the model
            validate: Whether to validate the model after training
            
        Returns:
            Tuple of (success, model, metrics)
        """
        # Extract features and target
        if not isinstance(data, dict) or "features" not in data or "target" not in data:
            raise ValueError("Training data must contain 'features' and 'target' keys")
        
        X = np.array(data["features"])
        y = np.array(data["target"])
        
        # Determine model type
        model_type = hyperparameters.get("model_type", "classification").lower()
        algorithm = hyperparameters.get("algorithm", "random_forest").lower()
        
        # Create model based on type and algorithm
        if model_type == "classification":
            if algorithm == "random_forest":
                n_estimators = int(hyperparameters.get("n_estimators", "100"))
                max_depth = hyperparameters.get("max_depth")
                max_depth = int(max_depth) if max_depth and max_depth.lower() != "none" else None
                
                model = RandomForestClassifier(
                    n_estimators=n_estimators,
                    max_depth=max_depth,
                    random_state=42
                )
            elif algorithm == "logistic_regression":
                C = float(hyperparameters.get("C", "1.0"))
                model = LogisticRegression(
                    C=C,
                    max_iter=1000,
                    random_state=42
                )
            elif algorithm == "svm":
                C = float(hyperparameters.get("C", "1.0"))
                kernel = hyperparameters.get("kernel", "rbf")
                model = SVC(
                    C=C,
                    kernel=kernel,
                    probability=True,
                    random_state=42
                )
            else:
                raise ValueError(f"Unsupported classification algorithm: {algorithm}")
        
        elif model_type == "regression":
            if algorithm == "random_forest":
                n_estimators = int(hyperparameters.get("n_estimators", "100"))
                max_depth = hyperparameters.get("max_depth")
                max_depth = int(max_depth) if max_depth and max_depth.lower() != "none" else None
                
                model = RandomForestRegressor(
                    n_estimators=n_estimators,
                    max_depth=max_depth,
                    random_state=42
                )
            elif algorithm == "linear_regression":
                model = LinearRegression()
            elif algorithm == "svr":
                C = float(hyperparameters.get("C", "1.0"))
                kernel = hyperparameters.get("kernel", "rbf")
                model = SVR(
                    C=C,
                    kernel=kernel
                )
            else:
                raise ValueError(f"Unsupported regression algorithm: {algorithm}")
        else:
            raise ValueError(f"Unsupported model type: {model_type}")
        
        # Train the model
        model.fit(X, y)
        
        # Validate the model if requested
        metrics = {}
        if validate:
            y_pred = model.predict(X)
            
            if model_type == "classification":
                metrics["accuracy"] = float(accuracy_score(y, y_pred))
                
                # For binary classification
                if len(np.unique(y)) == 2:
                    metrics["precision"] = float(precision_score(y, y_pred, average="binary"))
                    metrics["recall"] = float(recall_score(y, y_pred, average="binary"))
                    metrics["f1_score"] = float(f1_score(y, y_pred, average="binary"))
                else:
                    metrics["precision"] = float(precision_score(y, y_pred, average="weighted"))
                    metrics["recall"] = float(recall_score(y, y_pred, average="weighted"))
                    metrics["f1_score"] = float(f1_score(y, y_pred, average="weighted"))
            else:
                metrics["r2_score"] = float(r2_score(y, y_pred))
                metrics["mean_squared_error"] = float(mean_squared_error(y, y_pred))
                metrics["root_mean_squared_error"] = float(np.sqrt(mean_squared_error(y, y_pred)))
        
        return True, model, metrics
    
    def _train_tensorflow(self, model_name: str, data: Dict[str, Any], 
                         hyperparameters: Dict[str, str], validate: bool) -> Tuple[bool, Any, Dict[str, float]]:
        """Train a TensorFlow model.
        
        Args:
            model_name: Name of the model
            data: Training data
            hyperparameters: Hyperparameters for the model
            validate: Whether to validate the model after training
            
        Returns:
            Tuple of (success, model, metrics)
        """
        if not TENSORFLOW_AVAILABLE:
            raise ValueError("TensorFlow is not available")
        
        # Extract features and target
        if not isinstance(data, dict) or "features" not in data or "target" not in data:
            raise ValueError("Training data must contain 'features' and 'target' keys")
        
        X = np.array(data["features"], dtype=np.float32)
        y = np.array(data["target"])
        
        # Convert target to one-hot encoding for classification if needed
        model_type = hyperparameters.get("model_type", "classification").lower()
        if model_type == "classification" and len(y.shape) == 1:
            # Check if binary or multi-class
            num_classes = int(hyperparameters.get("num_classes", "0"))
            if num_classes <= 0:
                num_classes = len(np.unique(y))
            
            if num_classes > 2:
                y = tf.keras.utils.to_categorical(y, num_classes=num_classes)
            else:
                # Binary classification - keep as is
                y = y.reshape(-1, 1)
        
        # Determine input shape and output shape
        input_shape = X.shape[1:]
        if len(input_shape) == 0:
            input_shape = (1,)
        
        if model_type == "classification":
            if len(y.shape) > 1:
                output_units = y.shape[1]  # One-hot encoded
                output_activation = "softmax"
            else:
                output_units = 1  # Binary
                output_activation = "sigmoid"
        else:
            output_units = 1  # Regression
            output_activation = None
        
        # Create model
        network_type = hyperparameters.get("network_type", "dense").lower()
        
        if network_type == "dense":
            # Simple dense neural network
            model = tf.keras.Sequential()
            
            # Input layer
            model.add(tf.keras.layers.InputLayer(input_shape=input_shape))
            
            # Hidden layers
            num_layers = int(hyperparameters.get("num_layers", "2"))
            hidden_units = int(hyperparameters.get("hidden_units", "64"))
            dropout_rate = float(hyperparameters.get("dropout_rate", "0.2"))
            activation = hyperparameters.get("activation", "relu")
            
            for _ in range(num_layers):
                model.add(tf.keras.layers.Dense(hidden_units, activation=activation))
                if dropout_rate > 0:
                    model.add(tf.keras.layers.Dropout(dropout_rate))
            
            # Output layer
            model.add(tf.keras.layers.Dense(output_units, activation=output_activation))
        
        elif network_type == "cnn":
            # Convolutional Neural Network for image data
            model = tf.keras.Sequential()
            
            # Reshape input if needed for 2D convolution
            if len(input_shape) == 1:
                # Try to interpret as image data
                image_height = int(hyperparameters.get("image_height", "0"))
                image_width = int(hyperparameters.get("image_width", "0"))
                image_channels = int(hyperparameters.get("image_channels", "0"))
                
                if image_height > 0 and image_width > 0 and image_channels > 0:
                    if image_height * image_width * image_channels != input_shape[0]:
                        raise ValueError(f"Image dimensions {image_height}x{image_width}x{image_channels} don't match input shape {input_shape}")
                    
                    # Reshape input data
                    X = X.reshape(-1, image_height, image_width, image_channels)
                    input_shape = (image_height, image_width, image_channels)
            
            # Input layer
            model.add(tf.keras.layers.InputLayer(input_shape=input_shape))
            
            # Conv layers
            filters = int(hyperparameters.get("filters", "32"))
            kernel_size = int(hyperparameters.get("kernel_size", "3"))
            pool_size = int(hyperparameters.get("pool_size", "2"))
            num_conv_layers = int(hyperparameters.get("num_conv_layers", "2"))
            
            for i in range(num_conv_layers):
                model.add(tf.keras.layers.Conv2D(filters * (2**i), kernel_size, activation="relu", padding="same"))
                model.add(tf.keras.layers.MaxPooling2D(pool_size))
            
            # Flatten and dense layers
            model.add(tf.keras.layers.Flatten())
            model.add(tf.keras.layers.Dense(128, activation="relu"))
            model.add(tf.keras.layers.Dropout(0.5))
            
            # Output layer
            model.add(tf.keras.layers.Dense(output_units, activation=output_activation))
        
        else:
            raise ValueError(f"Unsupported TensorFlow network type: {network_type}")
        
        # Compile model
        learning_rate = float(hyperparameters.get("learning_rate", "0.001"))
        optimizer = tf.keras.optimizers.Adam(learning_rate=learning_rate)
        
        if model_type == "classification":
            if output_units > 1:
                loss = "categorical_crossentropy"
                metrics_list = ["accuracy"]
            else:
                loss = "binary_crossentropy"
                metrics_list = ["accuracy"]
        else:
            loss = "mse"
            metrics_list = ["mae"]
        
        model.compile(optimizer=optimizer, loss=loss, metrics=metrics_list)
        
        # Train model
        batch_size = int(hyperparameters.get("batch_size", "32"))
        epochs = int(hyperparameters.get("epochs", "10"))
        validation_split = float(hyperparameters.get("validation_split", "0.2"))
        
        # Prepare callbacks
        callbacks = []
        if int(hyperparameters.get("early_stopping", "1")):
            patience = int(hyperparameters.get("patience", "5"))
            callbacks.append(tf.keras.callbacks.EarlyStopping(
                monitor="val_loss" if validation_split > 0 else "loss",
                patience=patience,
                restore_best_weights=True
            ))
        
        # Train
        history = model.fit(
            X, y,
            batch_size=batch_size,
            epochs=epochs,
            validation_split=validation_split if validation_split > 0 else None,
            callbacks=callbacks,
            verbose=1
        )
        
        # Collect metrics
        metrics = {}
        
        # Get the best epoch metrics
        for metric_name, values in history.history.items():
            if not metric_name.startswith("val_"):  # Only use training metrics
                metrics[metric_name] = float(min(values) if "loss" in metric_name else max(values))
        
        # If validation was enabled, use those metrics too
        if validation_split > 0:
            for metric_name, values in history.history.items():
                if metric_name.startswith("val_"):
                    metrics[metric_name] = float(min(values) if "loss" in metric_name else max(values))
        
        # If set to validate, evaluate on all data
        if validate and metrics is None:
            eval_result = model.evaluate(X, y, verbose=0)
            metrics = {}
            
            for i, metric_name in enumerate(["loss"] + metrics_list):
                metrics[metric_name] = float(eval_result[i])
        
        return True, model, metrics
    
    def _train_pytorch(self, model_name: str, data: Dict[str, Any], 
                      hyperparameters: Dict[str, str], validate: bool) -> Tuple[bool, Any, Dict[str, float]]:
        """Train a PyTorch model.
        
        Args:
            model_name: Name of the model
            data: Training data
            hyperparameters: Hyperparameters for the model
            validate: Whether to validate the model after training
            
        Returns:
            Tuple of (success, model, metrics)
        """
        if not PYTORCH_AVAILABLE:
            raise ValueError("PyTorch is not available")
        
        # Extract features and target
        if not isinstance(data, dict) or "features" not in data or "target" not in data:
            raise ValueError("Training data must contain 'features' and 'target' keys")
        
        X = np.array(data["features"], dtype=np.float32)
        y = np.array(data["target"], dtype=np.float32)
        
        # Convert to PyTorch tensors
        X_tensor = torch.tensor(X, dtype=torch.float32)
        y_tensor = torch.tensor(y, dtype=torch.float32)
        
        # Determine model type and architecture
        model_type = hyperparameters.get("model_type", "classification").lower()
        network_type = hyperparameters.get("network_type", "mlp").lower()
        
        # Extract input and output dimensions
        input_dim = X.shape[1] if len(X.shape) > 1 else 1
        
        if model_type == "classification":
            # Determine number of classes
            num_classes = int(hyperparameters.get("num_classes", "0"))
            if num_classes <= 0:
                num_classes = len(np.unique(y))
            
            output_dim = num_classes if num_classes > 2 else 1
        else:
            output_dim = y.shape[1] if len(y.shape) > 1 else 1
        
        # Create model architecture description
        architecture = {
            "type": network_type
        }
        
        if network_type == "mlp":
            # Multi-layer perceptron
            num_layers = int(hyperparameters.get("num_layers", "2"))
            hidden_units = int(hyperparameters.get("hidden_units", "64"))
            
            # Create layer sizes
            layer_sizes = [input_dim]
            for _ in range(num_layers - 1):
                layer_sizes.append(hidden_units)
            layer_sizes.append(output_dim)
            
            architecture["layers"] = layer_sizes
            architecture["activation"] = hyperparameters.get("activation", "relu")
        
        else:
            raise ValueError(f"Unsupported PyTorch network type: {network_type}")
        
        # Create model instance
        model = self._create_pytorch_model(architecture)
        
        # Define loss function
        if model_type == "classification":
            if output_dim > 1:
                criterion = nn.CrossEntropyLoss()
            else:
                criterion = nn.BCEWithLogitsLoss()
        else:
            criterion = nn.MSELoss()
        
        # Define optimizer
        learning_rate = float(hyperparameters.get("learning_rate", "0.01"))
        optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)
        
        # Training loop
        epochs = int(hyperparameters.get("epochs", "100"))
        batch_size = int(hyperparameters.get("batch_size", "32"))
        
        # Convert data to DataLoader if large enough
        if len(X) > batch_size:
            dataset = torch.utils.data.TensorDataset(X_tensor, y_tensor)
            dataloader = torch.utils.data.DataLoader(dataset, batch_size=batch_size, shuffle=True)
            use_dataloader = True
        else:
            use_dataloader = False
        
        # Training loop
        model.train()
        losses = []
        
        for epoch in range(epochs):
            epoch_loss = 0.0
            
            if use_dataloader:
                for batch_X, batch_y in dataloader:
                    # Zero gradients
                    optimizer.zero_grad()
                    
                    # Forward pass
                    outputs = model(batch_X)
                    
                    # Adjust output shape if needed
                    if model_type == "classification" and output_dim == 1:
                        # Binary classification with BCEWithLogitsLoss
                        loss = criterion(outputs.view(-1), batch_y)
                    else:
                        loss = criterion(outputs, batch_y)
                    
                    # Backward pass and optimize
                    loss.backward()
                    optimizer.step()
                    
                    epoch_loss += loss.item() * batch_X.size(0)
                
                epoch_loss /= len(X)
            else:
                # Small dataset, train on all data at once
                optimizer.zero_grad()
                outputs = model(X_tensor)
                
                # Adjust output shape if needed
                if model_type == "classification" and output_dim == 1:
                    # Binary classification
                    loss = criterion(outputs.view(-1), y_tensor)
                else:
                    loss = criterion(outputs, y_tensor)
                
                loss.backward()
                optimizer.step()
                
                epoch_loss = loss.item()
            
            losses.append(epoch_loss)
            
            # Print progress every 10 epochs
            if (epoch + 1) % 10 == 0:
                print(f"Epoch {epoch+1}/{epochs}, Loss: {epoch_loss:.4f}")
        
        # Compute metrics
        metrics = {}
        metrics["final_loss"] = float(losses[-1])
        metrics["min_loss"] = float(min(losses))
        
        # Validate model if requested
        if validate:
            model.eval()
            with torch.no_grad():
                outputs = model(X_tensor)
                
                if model_type == "classification":
                    if output_dim > 1:
                        # Multi-class
                        _, predicted = torch.max(outputs, 1)
                        y_pred = predicted.numpy()
                        y_true = y.astype(int)
                    else:
                        # Binary
                        predicted = (torch.sigmoid(outputs) > 0.5).float().view(-1)
                        y_pred = predicted.numpy()
                        y_true = y
                    
                    # Calculate metrics
                    accuracy = (y_pred == y_true).mean()
                    metrics["accuracy"] = float(accuracy)
                else:
                    # Regression
                    mse = nn.MSELoss()(outputs, y_tensor).item()
                    metrics["mean_squared_error"] = float(mse)
                    metrics["root_mean_squared_error"] = float(np.sqrt(mse))
        
        return True, model, metrics
    
    def _save_model(self, model: Any, model_name: str, version: str, 
                   framework: str, hyperparameters: Dict[str, str]) -> str:
        """Save a model to disk.
        
        Args:
            model: The model to save
            model_name: Name of the model
            version: Version string
            framework: Framework used (scikit-learn, tensorflow, pytorch)
            hyperparameters: Model hyperparameters
            
        Returns:
            Model ID string
        """
        model_id = f"{model_name}_{version}"
        
        # Create framework directory if it doesn't exist
        os.makedirs(os.path.join(self.models_dir, framework), exist_ok=True)
        
        if framework == "scikit-learn":
            # Save scikit-learn model
            model_path = os.path.join(self.models_dir, framework, f"{model_id}.pkl")
            with open(model_path, "wb") as f:
                pickle.dump(model, f)
        
        elif framework == "tensorflow":
            # Save TensorFlow model
            model_path = os.path.join(self.models_dir, framework, model_id)
            model.save(model_path)
        
        elif framework == "pytorch":
            # Save PyTorch model
            model_path = os.path.join(self.models_dir, framework, f"{model_id}.pt")
            torch.save(model.state_dict(), model_path)
        
        else:
            raise ValueError(f"Unsupported framework: {framework}")
        
        return model_id
    
    def train_model_stream(self, stream_processor):
        """Train a model with streaming data chunks.
        
        Args:
            stream_processor: Generator of data chunks
            
        Returns:
            Training result
        """
        try:
            # Initialize container for streamed data chunks
            training_data_buffer = []
            model_name = None
            hyperparameters = {}
            validate = True
            framework = "scikit-learn"
            initial_stage = "development"
            
            # Process incoming chunks
            for chunk in stream_processor:
                if chunk.is_first_chunk:
                    # Extract metadata from first chunk
                    model_name = chunk.model_name
                    hyperparameters = dict(chunk.hyperparameters)
                    validate = chunk.validate
                    framework = chunk.framework if chunk.framework else "scikit-learn"
                    initial_stage = chunk.initial_stage if chunk.initial_stage else "development"
                
                # Add this chunk to the buffer
                training_data_buffer.append(chunk.training_data_chunk)
                
                # If this is the last chunk, process the complete data
                if chunk.is_last_chunk:
                    # Combine all chunks
                    training_data = "".join(training_data_buffer)
                    
                    # Train the model with the complete data
                    success, model_id, metrics, version, stage = self.train_model(
                        training_data, model_name, hyperparameters, validate, framework, initial_stage)
                    
                    # Return the training result
                    return success, model_id, metrics, version, stage
            
            # If we get here, we didn't receive a chunk with is_last_chunk=True
            raise ValueError("Incomplete streaming data: no ending chunk received")
            
        except Exception as e:
            print(f"Error in train_model_stream: {str(e)}")
            return False, "", {"error": str(e)}, "", ""