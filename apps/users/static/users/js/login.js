console.log("Login JS loaded");

// Form validation
function validateInput(input) {
    const value = input.value.trim();
    const type = input.type;
    
    if (type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(value)) {
            input.classList.remove('invalid');
            input.classList.add('valid');
            return true;
        } else {
            input.classList.remove('valid');
            input.classList.add('invalid');
            return false;
        }
    } else if (type === 'password') {
        if (value.length >= 6) {
            input.classList.remove('invalid');
            input.classList.add('valid');
            return true;
        } else {
            input.classList.remove('valid');
            input.classList.add('invalid');
            return false;
        }
    }
    
    return true;
}

// Add input event listeners for real-time validation
document.getElementById('email').addEventListener('input', function() {
    validateInput(this);
});

document.getElementById('password').addEventListener('input', function() {
    validateInput(this);
});

// Show message function
function showMessage(text, type = 'error') {
    const msgEl = document.getElementById('msg');
    msgEl.textContent = text;
    msgEl.className = `message ${type}`;
    msgEl.classList.add('show');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        msgEl.classList.remove('show');
    }, 5000);
}

// Loading state management
function setLoading(isLoading) {
    const btn = document.getElementById('loginBtn');
    const btnText = document.getElementById('btnText');
    
    if (isLoading) {
        btn.disabled = true;
        btnText.innerHTML = '<div class="loading"></div>Signing In...';
    } else {
        btn.disabled = false;
        btnText.innerHTML = 'Sign In';
    }
}

// Form submission handler
document.getElementById("loginForm").onsubmit = async (e) => {
    e.preventDefault();
    
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    
    // Validate inputs
    const emailValid = validateInput(document.getElementById("email"));
    const passwordValid = validateInput(document.getElementById("password"));
    
    if (!emailValid || !passwordValid) {
        showMessage("Please enter valid email and password", "error");
        return;
    }
    
    setLoading(true);
    
    try {
        const payload = { email, password };
        
        // Mock API call - replace with your actual endpoint
        const res = await fetch("/users/login/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        
        const json = await res.json();
        
        if (json.status === 200) {
            
            localStorage.setItem("access_token", json.data.tokens.access);
            localStorage.setItem("refresh_token", json.data.tokens.refresh);
            localStorage.setItem("user_id", json.data.id);
            
            showMessage("Login successful! Redirecting...", "success");
            
            // Simulate redirect after 2 seconds
            setTimeout(() => {
                window.location.replace("/task/tasks_page/");
                console.log("Would redirect to dashboard");
            }, 2000);
            
        } else {
            showMessage(json.message, "error");
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage("Network error. Please try again.", "error");
    } finally {
        setLoading(false);
    }
};