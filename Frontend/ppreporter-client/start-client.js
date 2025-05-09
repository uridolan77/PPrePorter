// Simple Node.js script to start the React application
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('===================================');
console.log('Starting PPreporter Client Application');
console.log('===================================');

// Ensure we're in the correct directory
const projectRoot = __dirname;
console.log(`Project directory: ${projectRoot}`);

// Check if package.json exists
const packageJsonPath = path.join(projectRoot, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('Error: package.json not found. Make sure you are in the correct directory.');
  process.exit(1);
}

// Check if node_modules exists, if not run npm install
const nodeModulesPath = path.join(projectRoot, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('node_modules not found. Running npm install...');
  const npmInstall = spawn('npm', ['install'], { stdio: 'inherit', shell: true });
  
  npmInstall.on('close', (code) => {
    if (code !== 0) {
      console.error(`npm install failed with code ${code}`);
      process.exit(1);
    }
    startReactApp();
  });
} else {
  startReactApp();
}

function startReactApp() {
  console.log('Starting React application...');
  
  // Set environment variables
  const env = {
    ...process.env,
    REACT_APP_API_URL: 'https://localhost:7075/api',
    BROWSER: 'none' // Prevent opening browser automatically
  };
  
  console.log(`API URL set to: ${env.REACT_APP_API_URL}`);
  
  // Start the React application
  const reactStart = spawn('npx', ['react-scripts', 'start'], { 
    stdio: 'inherit', 
    shell: true,
    env
  });
  
  reactStart.on('close', (code) => {
    if (code !== 0) {
      console.error(`React application exited with code ${code}`);
      process.exit(code);
    }
  });
  
  console.log('React application started. Press Ctrl+C to stop.');
}
