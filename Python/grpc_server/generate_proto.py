#!/usr/bin/env python
"""Generate Python code from the protocol buffer files."""

import os
import subprocess
import sys

def generate_proto():
    """Generate Python code from proto files."""
    print("Generating Python code from protocol buffer files...")
    
    # Get the directory of this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Path to proto files
    proto_dir = os.path.join(script_dir, 'protos')
    
    # Output directory for generated files
    python_out = script_dir
    
    # Check if proto directory exists
    if not os.path.exists(proto_dir):
        print(f"Error: Proto directory not found: {proto_dir}")
        return 1
    
    # Create python_pb2 directory if it doesn't exist
    if not os.path.exists(os.path.join(script_dir, 'python_pb2')):
        os.makedirs(os.path.join(script_dir, 'python_pb2'))
    
    # Get list of proto files
    proto_files = [f for f in os.listdir(proto_dir) if f.endswith('.proto')]
    
    if not proto_files:
        print("Error: No .proto files found in the protos directory.")
        return 1
    
    print(f"Found proto files: {', '.join(proto_files)}")
    
    # Generate Python code from proto files
    for proto_file in proto_files:
        proto_path = os.path.join(proto_dir, proto_file)
        
        # Command to generate Python code using protoc
        cmd = [
            "python", "-m", "grpc_tools.protoc",
            f"--proto_path={proto_dir}",
            f"--python_out={python_out}",
            f"--grpc_python_out={python_out}",
            proto_path
        ]
        
        try:
            print(f"Running: {' '.join(cmd)}")
            subprocess.check_call(cmd)
            print(f"Successfully generated Python code for {proto_file}")
        except subprocess.CalledProcessError as e:
            print(f"Error generating Python code for {proto_file}: {e}")
            return 1
        except Exception as e:
            print(f"Unexpected error: {e}")
            return 1
    
    print("Python code generation complete!")
    return 0

if __name__ == "__main__":
    sys.exit(generate_proto())