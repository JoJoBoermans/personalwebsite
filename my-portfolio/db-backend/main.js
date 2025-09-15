// API Portfolio - Interactive Demo JavaScript
// Simulates a complete RESTful API with authentication, CRUD operations, and error handling

class APISimulator {
    constructor() {
        this.apiEndpoint = '/api';
        this.authToken = null;
        this.currentUser = null;
        this.reviews = [];
        this.requestId = 0;
        
        // Simulated database with initial data
        this.initializeData();
        this.bindEvents();
        this.initializeUI();
    }

    initializeData() {
        // Sample user data for authentication
        this.users = [
            {
                id: 1,
                email: 'demo@apiportfolio.com',
                password: 'demo123', // In real app, this would be hashed
                name: 'Demo User',
                role: 'admin'
            },
            {
                id: 2,
                email: 'user@example.com',
                password: 'password123',
                name: 'John Doe',
                role: 'user'
            }
        ];

        // Sample review data
        this.reviews = [
            {
                id: 1,
                customerId: 1,
                customerName: 'Sarah Johnson',
                rating: 5,
                content: 'Excellent service! The API integration was seamless and the documentation was comprehensive.',
                sentiment: 'positive',
                createdAt: new Date('2024-01-10T14:30:00Z').toISOString(),
                updatedAt: new Date('2024-01-10T14:30:00Z').toISOString()
            },
            {
                id: 2,
                customerId: 2,
                customerName: 'Mike Chen',
                rating: 4,
                content: 'Good experience overall. The authentication flow works well, though documentation could be clearer in some areas.',
                sentiment: 'positive',
                createdAt: new Date('2024-01-08T09:15:00Z').toISOString(),
                updatedAt: new Date('2024-01-08T09:15:00Z').toISOString()
            },
            {
                id: 3,
                customerId: 3,
                customerName: 'Emily Rodriguez',
                rating: 3,
                content: 'The API works as expected, but response times could be improved for better performance.',
                sentiment: 'neutral',
                createdAt: new Date('2024-01-05T16:45:00Z').toISOString(),
                updatedAt: new Date('2024-01-05T16:45:00Z').toISOString()
            }
        ];
    }

    bindEvents() {
        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }

        // Documentation tabs
        const docTabs = document.querySelectorAll('.doc-tab');
        docTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchDocumentationTab(tabName);
            });
        });

        // API Demo interactions
        document.getElementById('login-btn')?.addEventListener('click', () => this.handleLogin());
        document.getElementById('create-review-btn')?.addEventListener('click', () => this.handleCreateReview());
        document.getElementById('refresh-reviews-btn')?.addEventListener('click', () => this.handleRefreshReviews());

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    initializeUI() {
        // Set default demo credentials
        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');
        
        if (emailInput && passwordInput) {
            emailInput.value = 'demo@apiportfolio.com';
            passwordInput.value = 'demo123';
        }

        // Initialize auth status
        this.updateAuthStatus('Not authenticated. Use demo credentials above to login.', 'warning');
    }

    // Authentication Methods
    async handleLogin() {
        const email = document.getElementById('login-email')?.value;
        const password = document.getElementById('login-password')?.value;

        if (!email || !password) {
            this.updateAuthStatus('Please enter both email and password', 'error');
            return;
        }

        this.logAPIRequest('POST', '/api/auth/login', { email, password: '••••••••' });

        // Simulate API delay
        await this.delay(800);

        const user = this.users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Generate mock JWT token
            this.authToken = this.generateMockJWT(user);
            this.currentUser = user;
            
            const response = {
                success: true,
                data: {
                    token: this.authToken,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role
                    },
                    expiresIn: '24h'
                },
                timestamp: new Date().toISOString(),
                requestId: this.getRequestId()
            };

            this.logAPIResponse(200, response);
            this.updateAuthStatus(`Successfully authenticated as ${user.name} (${user.role})`, 'success');
            
            // Auto-refresh reviews after successful login
            setTimeout(() => this.handleRefreshReviews(), 1000);
            
        } else {
            const errorResponse = {
                error: {
                    code: 'INVALID_CREDENTIALS',
                    message: 'Invalid email or password',
                    timestamp: new Date().toISOString(),
                    requestId: this.getRequestId()
                }
            };

            this.logAPIResponse(401, errorResponse);
            this.updateAuthStatus('Invalid credentials. Try: demo@apiportfolio.com / demo123', 'error');
        }
    }

    // CRUD Operations
    async handleCreateReview() {
        if (!this.authToken) {
            this.updateAuthStatus('Please login first to create reviews', 'error');
            return;
        }

        const customerName = document.getElementById('customer-name')?.value;
        const rating = document.getElementById('rating')?.value;
        const content = document.getElementById('review-content')?.value;

        // Validation
        const validation = this.validateReviewData({ customerName, rating, content });
        if (!validation.isValid) {
            const errorResponse = {
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid request data',
                    details: validation.errors,
                    timestamp: new Date().toISOString(),
                    requestId: this.getRequestId()
                }
            };

            this.logAPIRequest('POST', '/api/reviews', { customerName, rating: parseInt(rating), content });
            this.logAPIResponse(400, errorResponse);
            return;
        }

        const newReview = {
            id: Math.max(...this.reviews.map(r => r.id)) + 1,
            customerId: this.reviews.length + 1,
            customerName,
            rating: parseInt(rating),
            content,
            sentiment: this.analyzeSentiment(content),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.logAPIRequest('POST', '/api/reviews', newReview);

        // Simulate API delay
        await this.delay(600);

        this.reviews.unshift(newReview);

        const response = {
            success: true,
            data: newReview,
            message: 'Review created successfully',
            timestamp: new Date().toISOString(),
            requestId: this.getRequestId()
        };

        this.logAPIResponse(201, response);

        // Clear form
        document.getElementById('customer-name').value = '';
        document.getElementById('rating').value = '';
        document.getElementById('review-content').value = '';

        // Refresh reviews display
        this.displayReviews();
    }

    async handleRefreshReviews() {
        if (!this.authToken) {
            this.updateAuthStatus('Please login first to view reviews', 'error');
            return;
        }

        this.logAPIRequest('GET', '/api/reviews?page=1&limit=10&sort=createdAt');

        // Simulate API delay
        await this.delay(500);

        const response = {
            success: true,
            data: this.reviews,
            pagination: {
                page: 1,
                limit: 10,
                total: this.reviews.length,
                totalPages: Math.ceil(this.reviews.length / 10)
            },
            timestamp: new Date().toISOString(),
            requestId: this.getRequestId()
        };

        this.logAPIResponse(200, response);
        this.displayReviews();
    }

    async handleUpdateReview(reviewId, updates) {
        if (!this.authToken) {
            this.updateAuthStatus('Authentication required', 'error');
            return;
        }

        const reviewIndex = this.reviews.findIndex(r => r.id === reviewId);
        if (reviewIndex === -1) {
            const errorResponse = {
                error: {
                    code: 'REVIEW_NOT_FOUND',
                    message: `Review with ID ${reviewId} not found`,
                    timestamp: new Date().toISOString(),
                    requestId: this.getRequestId()
                }
            };

            this.logAPIRequest('PUT', `/api/reviews/${reviewId}`, updates);
            this.logAPIResponse(404, errorResponse);
            return;
        }

        this.logAPIRequest('PUT', `/api/reviews/${reviewId}`, updates);

        // Simulate API delay
        await this.delay(400);

        this.reviews[reviewIndex] = {
            ...this.reviews[reviewIndex],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        const response = {
            success: true,
            data: this.reviews[reviewIndex],
            message: 'Review updated successfully',
            timestamp: new Date().toISOString(),
            requestId: this.getRequestId()
        };

        this.logAPIResponse(200, response);
        this.displayReviews();
    }

    async handleDeleteReview(reviewId) {
        if (!this.authToken) {
            this.updateAuthStatus('Authentication required', 'error');
            return;
        }

        const reviewIndex = this.reviews.findIndex(r => r.id === reviewId);
        if (reviewIndex === -1) {
            const errorResponse = {
                error: {
                    code: 'REVIEW_NOT_FOUND',
                    message: `Review with ID ${reviewId} not found`,
                    timestamp: new Date().toISOString(),
                    requestId: this.getRequestId()
                }
            };

            this.logAPIRequest('DELETE', `/api/reviews/${reviewId}`);
            this.logAPIResponse(404, errorResponse);
            return;
        }

        this.logAPIRequest('DELETE', `/api/reviews/${reviewId}`);

        // Simulate API delay
        await this.delay(300);

        this.reviews.splice(reviewIndex, 1);

        this.logAPIResponse(204, { message: 'Review deleted successfully' });
        this.displayReviews();
    }

    // UI Helper Methods
    displayReviews() {
        const container = document.getElementById('reviews-container');
        if (!container) return;

        if (this.reviews.length === 0) {
            container.innerHTML = '<p class="text-secondary text-center py-8">No reviews found. Create your first review above!</p>';
            return;
        }

        const reviewsHTML = this.reviews.map(review => `
            <div class="border rounded-lg p-4 mb-4 bg-white" data-review-id="${review.id}">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <h5 class="font-semibold text-lg">${this.escapeHtml(review.customerName)}</h5>
                        <div class="flex items-center mb-2">
                            ${this.generateStarRating(review.rating)}
                            <span class="ml-2 text-sm text-secondary">${review.rating}/5</span>
                            <span class="ml-3 px-2 py-1 rounded text-xs font-semibold ${this.getSentimentColor(review.sentiment)}">
                                ${review.sentiment.toUpperCase()}
                            </span>
                        </div>
                        <p class="text-sm text-secondary">
                            Created: ${new Date(review.createdAt).toLocaleDateString()} 
                            ${review.updatedAt !== review.createdAt ? '• Updated: ' + new Date(review.updatedAt).toLocaleDateString() : ''}
                        </p>
                    </div>
                    <div class="flex space-x-2">
                        <button class="text-blue-600 hover:text-blue-800 text-sm" onclick="apiDemo.editReview(${review.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="text-red-600 hover:text-red-800 text-sm" onclick="apiDemo.deleteReview(${review.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <p class="text-gray-800 leading-relaxed">${this.escapeHtml(review.content)}</p>
            </div>
        `).join('');

        container.innerHTML = reviewsHTML;
    }

    editReview(reviewId) {
        const review = this.reviews.find(r => r.id === reviewId);
        if (!review) return;

        const newContent = prompt('Edit review content:', review.content);
        const newRating = prompt('Edit rating (1-5):', review.rating);

        if (newContent !== null && newRating !== null) {
            const updates = {
                content: newContent,
                rating: parseInt(newRating),
                sentiment: this.analyzeSentiment(newContent)
            };

            this.handleUpdateReview(reviewId, updates);
        }
    }

    deleteReview(reviewId) {
        const review = this.reviews.find(r => r.id === reviewId);
        if (!review) return;

        if (confirm(`Are you sure you want to delete the review by ${review.customerName}?`)) {
            this.handleDeleteReview(reviewId);
        }
    }

    updateAuthStatus(message, type) {
        const statusElement = document.getElementById('auth-status');
        if (!statusElement) return;

        const colorClasses = {
            success: 'text-green-600 bg-green-50 border-green-200',
            error: 'text-red-600 bg-red-50 border-red-200',
            warning: 'text-yellow-600 bg-yellow-50 border-yellow-200'
        };

        statusElement.className = `p-3 rounded border ${colorClasses[type] || colorClasses.warning}`;
        statusElement.textContent = message;
    }

    switchDocumentationTab(tabName) {
        // Update tab styles
        document.querySelectorAll('.doc-tab').forEach(tab => {
            tab.classList.remove('active', 'text-primary', 'border-primary', 'border-b-2');
            tab.classList.add('text-secondary');
        });

        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active', 'text-primary', 'border-primary', 'border-b-2');
            activeTab.classList.remove('text-secondary');
        }

        // Show/hide content
        document.querySelectorAll('.doc-content').forEach(content => {
            content.classList.add('hidden');
        });

        const activeContent = document.getElementById(`${tabName}-content`);
        if (activeContent) {
            activeContent.classList.remove('hidden');
        }
    }

    // API Logging Methods
    logAPIRequest(method, endpoint, data = null) {
        const logElement = document.getElementById('api-log');
        if (!logElement) return;

        const timestamp = new Date().toLocaleTimeString();
        const requestLog = `
            <div class="mb-4">
                <p class="text-yellow-400">→ [${timestamp}] ${method} ${endpoint}</p>
                ${data ? `<p class="text-gray-400 ml-4">Body: ${JSON.stringify(data, null, 2)}</p>` : ''}
            </div>
        `;

        logElement.innerHTML += requestLog;
        logElement.scrollTop = logElement.scrollHeight;
    }

    logAPIResponse(statusCode, data) {
        const logElement = document.getElementById('api-log');
        if (!logElement) return;

        const timestamp = new Date().toLocaleTimeString();
        const statusColor = statusCode < 300 ? 'text-green-400' : statusCode < 500 ? 'text-yellow-400' : 'text-red-400';
        
        const responseLog = `
            <div class="mb-4">
                <p class="${statusColor}">← [${timestamp}] HTTP ${statusCode}</p>
                <pre class="text-gray-300 ml-4 text-xs overflow-x-auto">${JSON.stringify(data, null, 2)}</pre>
            </div>
        `;

        logElement.innerHTML += responseLog;
        logElement.scrollTop = logElement.scrollHeight;
    }

    // Utility Methods
    generateMockJWT(user) {
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = btoa(JSON.stringify({
            sub: user.id,
            email: user.email,
            role: user.role,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
        }));
        const signature = btoa('mock-signature-' + Date.now());
        
        return `${header}.${payload}.${signature}`;
    }

    validateReviewData(data) {
        const errors = [];

        if (!data.customerName || data.customerName.trim().length < 2) {
            errors.push({
                field: 'customerName',
                message: 'Customer name must be at least 2 characters long'
            });
        }

        if (!data.rating || data.rating < 1 || data.rating > 5) {
            errors.push({
                field: 'rating',
                message: 'Rating must be between 1 and 5'
            });
        }

        if (!data.content || data.content.trim().length < 10) {
            errors.push({
                field: 'content',
                message: 'Review content must be at least 10 characters long'
            });
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    analyzeSentiment(text) {
        const positiveWords = ['excellent', 'great', 'good', 'amazing', 'wonderful', 'fantastic', 'perfect', 'love', 'best'];
        const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'poor', 'disappointing'];

        const words = text.toLowerCase().split(/\s+/);
        let positiveCount = 0;
        let negativeCount = 0;

        words.forEach(word => {
            if (positiveWords.some(pw => word.includes(pw))) positiveCount++;
            if (negativeWords.some(nw => word.includes(nw))) negativeCount++;
        });

        if (positiveCount > negativeCount) return 'positive';
        if (negativeCount > positiveCount) return 'negative';
        return 'neutral';
    }

    generateStarRating(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += i <= rating 
                ? '<i class="fas fa-star text-yellow-400"></i>' 
                : '<i class="far fa-star text-gray-300"></i>';
        }
        return stars;
    }

    getSentimentColor(sentiment) {
        const colors = {
            positive: 'bg-green-100 text-green-800',
            negative: 'bg-red-100 text-red-800',
            neutral: 'bg-gray-100 text-gray-800'
        };
        return colors[sentiment] || colors.neutral;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getRequestId() {
        return `req_${++this.requestId}_${Date.now()}`;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Mobile menu functionality
function toggleMobileMenu() {
    const navMenu = document.getElementById('nav-menu');
    if (navMenu) {
        navMenu.classList.toggle('active');
    }
}

function closeMobileMenu() {
    const navMenu = document.getElementById('nav-menu');
    if (navMenu) {
        navMenu.classList.remove('active');
    }
}

// Initialize the API simulator when the page loads
let apiDemo;

document.addEventListener('DOMContentLoaded', () => {
    apiDemo = new APISimulator();
    
    // Add some initial helpful messages to the log
    const logElement = document.getElementById('api-log');
    if (logElement) {
        logElement.innerHTML = `
            <p style="color: #3b82f6;">// API Demo Initialized</p>
            <p style="color: var(--text-secondary);">// Try logging in with: demo@apiportfolio.com / demo123</p>
            <p style="color: var(--text-secondary);">// All API interactions will be logged here in real-time</p>
            <p style="color: var(--text-secondary);">// This demonstrates proper logging, error handling, and response formatting</p>
            <br>
        `;
    }
});

// Expose methods globally for inline event handlers
window.apiDemo = {
    editReview: (id) => apiDemo.editReview(id),
    deleteReview: (id) => apiDemo.deleteReview(id)
};

// Expose mobile menu functions globally
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;

// Add some visual enhancements
document.addEventListener('DOMContentLoaded', () => {
    // Add loading states to buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.classList.contains('loading')) return;
            
            const originalText = this.innerHTML;
            this.classList.add('loading');
            this.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing...';
            
            setTimeout(() => {
                this.classList.remove('loading');
                this.innerHTML = originalText;
            }, 1000);
        });
    });

    // Add intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe sections for scroll animations
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
    document.getElementById("login-email").value = "user@example.com";
    document.getElementById("login-password").value = "password123";

});
