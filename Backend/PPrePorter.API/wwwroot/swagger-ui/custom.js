// Custom JavaScript for Swagger UI

// Wait for the Swagger UI to be fully loaded
window.onload = function() {
    // Add a helper function to extract token from login response
    function addTokenExtractor() {
        // Check if we're on the Swagger UI page
        if (!window.ui) {
            console.log('Swagger UI not found');
            return;
        }
        
        // Find the login endpoint
        const loginEndpoint = document.querySelector('.opblock-tag-section[data-tag="Auth"] .opblock-summary-path[data-path*="/api/Auth/login"]');
        if (!loginEndpoint) {
            console.log('Login endpoint not found');
            return;
        }
        
        // Find the parent operation block
        const loginOpBlock = loginEndpoint.closest('.opblock');
        if (!loginOpBlock) {
            console.log('Login operation block not found');
            return;
        }
        
        // Create a button to extract and set the token
        const extractButton = document.createElement('button');
        extractButton.textContent = 'Extract Token & Authorize';
        extractButton.className = 'btn authorize extract-token-btn';
        extractButton.style.marginLeft = '10px';
        extractButton.style.display = 'none'; // Initially hidden
        
        // Add the button to the response section
        loginOpBlock.addEventListener('click', function() {
            // Wait for the response section to be created
            setTimeout(function() {
                const responseBody = loginOpBlock.querySelector('.responses-wrapper .highlight-code');
                if (responseBody && !loginOpBlock.querySelector('.extract-token-btn')) {
                    const responseSection = responseBody.closest('.responses-wrapper');
                    if (responseSection) {
                        const buttonContainer = document.createElement('div');
                        buttonContainer.style.marginTop = '10px';
                        buttonContainer.style.textAlign = 'right';
                        buttonContainer.appendChild(extractButton);
                        responseSection.appendChild(buttonContainer);
                        extractButton.style.display = 'inline-block';
                    }
                }
            }, 1000);
        });
        
        // Add click handler to extract and set the token
        extractButton.addEventListener('click', function() {
            try {
                const responseBody = loginOpBlock.querySelector('.responses-wrapper .highlight-code');
                if (responseBody) {
                    const responseText = responseBody.textContent;
                    const responseJson = JSON.parse(responseText);
                    
                    if (responseJson && responseJson.token) {
                        // Open the authorize dialog
                        const authorizeButton = document.querySelector('.swagger-ui .auth-wrapper .authorize');
                        if (authorizeButton) {
                            authorizeButton.click();
                            
                            // Wait for the dialog to open
                            setTimeout(function() {
                                // Find the input field and set the token
                                const tokenInput = document.querySelector('.swagger-ui .auth-container input[type="text"]');
                                if (tokenInput) {
                                    tokenInput.value = 'Bearer ' + responseJson.token;
                                    
                                    // Click the Authorize button
                                    const authorizeBtn = document.querySelector('.swagger-ui .auth-btn-wrapper .btn.modal-btn.auth.authorize');
                                    if (authorizeBtn) {
                                        authorizeBtn.click();
                                        
                                        // Show a success message
                                        const message = document.createElement('div');
                                        message.textContent = 'Successfully authorized with token!';
                                        message.style.color = 'green';
                                        message.style.fontWeight = 'bold';
                                        message.style.marginTop = '10px';
                                        
                                        const buttonContainer = extractButton.parentElement;
                                        if (buttonContainer) {
                                            buttonContainer.appendChild(message);
                                            
                                            // Remove the message after 3 seconds
                                            setTimeout(function() {
                                                message.remove();
                                            }, 3000);
                                        }
                                    }
                                }
                            }, 500);
                        }
                    } else {
                        console.error('Token not found in response');
                        alert('Token not found in response');
                    }
                }
            } catch (error) {
                console.error('Error extracting token:', error);
                alert('Error extracting token: ' + error.message);
            }
        });
    }
    
    // Call the function after a delay to ensure Swagger UI is fully loaded
    setTimeout(addTokenExtractor, 2000);
};
