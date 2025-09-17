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
        const loginBtn = document.getElementById('login-btn');
        const createReviewBtn = document.getElementById('create-review-btn');
        const refreshReviewsBtn = document.getElementById('refresh-reviews-btn');
        
        console.log('Binding events. Found elements:', {
            loginBtn: !!loginBtn,
            createReviewBtn: !!createReviewBtn,
            refreshReviewsBtn: !!refreshReviewsBtn
        });
        
        loginBtn?.addEventListener('click', () => this.handleLogin());
        createReviewBtn?.addEventListener('click', () => {
            console.log('Create review button clicked');
            this.handleCreateReview();
        });
        refreshReviewsBtn?.addEventListener('click', () => this.handleRefreshReviews());

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
            setTimeout(() => {
                console.log('Auto-refreshing reviews after login');
                this.handleRefreshReviews();
            }, 1000);
            
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
        console.log('handleCreateReview called');
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
            id: this.reviews.length > 0 ? Math.max(...this.reviews.map(r => r.id)) + 1 : 1,
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
        console.log('About to display reviews after creation. Total reviews:', this.reviews.length);
        this.displayReviews();
        
        // Show success message
        this.updateAuthStatus(`Review created successfully! Total reviews: ${this.reviews.length}`, 'success');
    }

    async handleRefreshReviews() {
        console.log('handleRefreshReviews called');
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
        console.log('About to display reviews from refresh. Total reviews:', this.reviews.length);
        this.displayReviews();
        this.updateAuthStatus(`Reviews loaded successfully (${this.reviews.length} total)`, 'success');
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
        if (!container) {
            console.error('Reviews container not found');
            return;
        }

        console.log('Displaying reviews:', this.reviews.length);

        if (this.reviews.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--text-secondary);">No reviews found. Create your first review above!</p>';
            return;
        }

        const reviewsHTML = this.reviews.map(review => `
            <div style="border: 1px solid var(--border-color); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; background: var(--background-light);" data-review-id="${review.id}">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                    <div style="flex: 1;">
                        <h5 style="font-size: 1.1rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem;">${this.escapeHtml(review.customerName)}</h5>
                        <div style="display: flex; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
                            ${this.generateStarRating(review.rating)}
                            <span style="color: var(--text-secondary); font-size: 0.9rem;">${review.rating}/5</span>
                            <span style="padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; ${this.getSentimentColorStyle(review.sentiment)}">
                                ${review.sentiment.toUpperCase()}
                            </span>
                        </div>
                        <p style="font-size: 0.85rem; color: var(--text-secondary);">
                            Created: ${new Date(review.createdAt).toLocaleDateString()} 
                            ${review.updatedAt !== review.createdAt ? '• Updated: ' + new Date(review.updatedAt).toLocaleDateString() : ''}
                        </p>
                    </div>
                    <div style="display: flex; gap: 0.5rem; margin-left: 1rem;">
                        <button style="color: var(--primary-color); background: none; border: none; padding: 0.5rem; cursor: pointer; border-radius: 4px; transition: all 0.3s ease;" 
                                onmouseover="this.style.background='rgba(37, 99, 235, 0.1)'" 
                                onmouseout="this.style.background='none'"
                                onclick="apiDemo.editReview(${review.id})" 
                                title="Edit Review">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button style="color: var(--danger-color); background: none; border: none; padding: 0.5rem; cursor: pointer; border-radius: 4px; transition: all 0.3s ease;" 
                                onmouseover="this.style.background='rgba(239, 68, 68, 0.1)'" 
                                onmouseout="this.style.background='none'"
                                onclick="apiDemo.deleteReview(${review.id})" 
                                title="Delete Review">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <p style="color: var(--text-primary); line-height: 1.6; margin-top: 1rem;">${this.escapeHtml(review.content)}</p>
            </div>
        `).join('');

        container.innerHTML = reviewsHTML;
        console.log('Reviews HTML updated successfully');
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
                ? '<i class="fas fa-star" style="color: #f59e0b; margin-right: 2px;"></i>' 
                : '<i class="far fa-star" style="color: #d1d5db; margin-right: 2px;"></i>';
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

    getSentimentColorStyle(sentiment) {
        const styles = {
            positive: 'background: linear-gradient(135deg, #dcfce7, #bbf7d0); color: #15803d;',
            negative: 'background: linear-gradient(135deg, #fef2f2, #fecaca); color: #dc2626;',
            neutral: 'background: linear-gradient(135deg, #f9fafb, #e5e7eb); color: #374151;'
        };
        return styles[sentiment] || styles.neutral;
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

// Mobile menu functions are now handled by common.js
// This ensures compatibility across all platforms including local development

// Initialize the API simulator when the page loads
let apiDemo;

document.addEventListener('DOMContentLoaded', () => {
    apiDemo = new APISimulator();
    
    // Make apiDemo globally accessible
    window.apiDemo = apiDemo;
    
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
    
    console.log('API Demo initialized and made globally available');
});

// Expose mobile menu functions globally
// Mobile menu functions now handled by common.js for better platform compatibility

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
});