console.log("Register JS loaded");

document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("registerForm");
    const inputs = form.querySelectorAll(".form-input");
    
    // Add input validation
    inputs.forEach(input => {
        input.addEventListener("blur", validateInput);
        input.addEventListener("input", clearValidation);
    });

    form.onsubmit = handleSubmit;
});

function validateInput(e) {
    const input = e.target;
    const value = input.value.trim();
    
    // Remove existing validation classes
    input.classList.remove("valid", "invalid");
    
    // Basic validation
    if (input.type === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && emailRegex.test(value)) {
            input.classList.add("valid");
        } else if (value) {
            input.classList.add("invalid");
        }
    } else if (input.required && value) {
        input.classList.add("valid");
    } else if (input.required && !value) {
        input.classList.add("invalid");
    }
}

function clearValidation(e) {
    const input = e.target;
    input.classList.remove("valid", "invalid");
}

async function handleSubmit(e) {
    e.preventDefault();
    
    const registerBtn = document.getElementById("registerBtn");
    const messageDiv = document.getElementById("msg");
    
    // Show loading state
    registerBtn.innerHTML = '<div class="loading"></div> Creating Account...';
    registerBtn.disabled = true;
    
    // Hide previous message
    messageDiv.classList.remove("show");
    
    const payload = {
        first_name: document.getElementById("first_name").value,
        last_name: document.getElementById("last_name").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    };
    
    try {
        const res = await fetch("/users/register/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        
        const json = await res.json();
        
        if (json.status === 200 || json.status === "200" || json.message === "REGISTRATION_SUCCESSFUL") {
            showMessage("Registration successful! You can now sign in.", "success");
            document.getElementById("registerForm").reset();
            
            setTimeout(() => {
                window.location.href = "/users/login_page/";
                
            }, 2000);
            
        } else {
            showMessage( (json.message || "Registration failed"), "error");
        }
    } catch (error) {
        showMessage("Network error. Please try again.", "error");
    } finally {
        // Reset button
        registerBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
        registerBtn.disabled = false;
    }
 }

function showMessage(text, type) {
    const messageDiv = document.getElementById("msg");
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    
    // Show message with animation
    setTimeout(() => {
        messageDiv.classList.add("show");
    }, 100);
}

// Add some interactive effects
document.addEventListener("DOMContentLoaded", function() {
    const inputs = document.querySelectorAll(".form-input");
    
    inputs.forEach(input => {
        input.addEventListener("focus", function() {
            this.parentElement.style.transform = "scale(1.02)";
        });
        
        input.addEventListener("blur", function() {
            this.parentElement.style.transform = "scale(1)";
        });
    });
});
