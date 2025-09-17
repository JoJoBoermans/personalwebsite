/**
 * Full-Stack Project Showcase - Interactive Demonstration
 * Business Process Automation Tool with Lead Management System
 * 
 * Features:
 * - Lead form validation and submission
 * - Real-time lead scoring simulation
 * - Chart.js analytics dashboard
 * - Workflow automation demonstrations
 * - Activity logging system
 * - Mobile-responsive interactions
 */

// Global state management
let leadDatabase = [];
let activityLog = [];
let workflowCounters = {
    highScore: 0,
    nurture: 0,
    reports: 0
};

// Chart instance for analytics
let leadChart = null;

// DOM elements cache
const elements = {
    leadForm: null,
    leadScoreDisplay: null,
    leadScoreProgress: null,
    scoringFactors: null,
    recommendedActions: null,
    leadsTableBody: null,
    activityLog: null,
    totalLeads: null,
    avgScore: null,
    hotLeads: null,
    conversionRate: null,
    leadChart: null
};

/**
 * Initialize the application when DOM is loaded
 */
function initializeFullStackDemo() {
    try {
        initializeElements();
        setupEventListeners();
        initializeChart();
        loadSampleData();
        updateAnalytics();
        logActivity('System initialized', 'success');
        console.log('Full-stack demo initialized successfully');
    } catch (error) {
        console.error('Error initializing full-stack demo:', error);
        // Fallback: at least show some basic functionality
        if (elements.activityLog) {
            elements.activityLog.innerHTML = `
                <div style="color: var(--danger-color); text-align: center; padding: 2rem;">
                    Demo initialization failed. Please check browser console for details.
                    <br><small>This may be due to missing CDN resources in local development.</small>
                </div>
            `;
        }
    }
}

// Initialize when DOM is ready with multiple fallbacks for local development
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFullStackDemo);
} else {
    // DOM is already loaded
    initializeFullStackDemo();
}

// Also try initializing after a short delay as fallback for slow local servers
setTimeout(function() {
    if (!leadDatabase || leadDatabase.length === 0) {
        console.log('Fallback initialization attempt...');
        initializeFullStackDemo();
    }
}, 1000);

/**
 * Cache DOM elements for performance
 */
function initializeElements() {
    elements.leadForm = document.getElementById('leadForm');
    elements.leadScoreDisplay = document.querySelector('#leadScoreDisplay div:first-child');
    elements.leadScoreProgress = document.getElementById('leadScoreProgress');
    elements.scoringFactors = document.getElementById('scoringFactors');
    elements.recommendedActions = document.getElementById('recommendedActions');
    elements.leadsTableBody = document.getElementById('leadsTableBody');
    elements.activityLog = document.getElementById('activityLog');
    elements.totalLeads = document.getElementById('totalLeads');
    elements.avgScore = document.getElementById('avgScore');
    elements.hotLeads = document.getElementById('hotLeads');
    elements.conversionRate = document.getElementById('conversionRate');
    elements.leadChart = document.getElementById('leadChart');
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Lead form submission
    if (elements.leadForm) {
        elements.leadForm.addEventListener('submit', handleLeadSubmission);
        
        // Real-time validation and scoring
        const formInputs = elements.leadForm.querySelectorAll('input, select, textarea');
        formInputs.forEach(input => {
            input.addEventListener('input', handleFormInput);
            input.addEventListener('blur', validateField);
        });
    }

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

/**
 * Handle form input changes for real-time validation and scoring
 */
function handleFormInput(event) {
    clearValidationErrors();
    calculateLiveScore();
}

/**
 * Handle field validation on blur
 */
function validateField(event) {
    const field = event.target;
    const fieldName = field.id;
    const value = field.value.trim();
    
    let isValid = true;
    let errorMessage = '';

    switch (fieldName) {
        case 'companyName':
            if (!value) {
                isValid = false;
                errorMessage = 'Company name is required';
            } else if (value.length < 2) {
                isValid = false;
                errorMessage = 'Company name must be at least 2 characters';
            }
            break;
            
        case 'contactPerson':
            if (!value) {
                isValid = false;
                errorMessage = 'Contact person is required';
            } else if (value.length < 2) {
                isValid = false;
                errorMessage = 'Contact name must be at least 2 characters';
            }
            break;
            
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!value) {
                isValid = false;
                errorMessage = 'Email address is required';
            } else if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
            break;
            
        case 'phone':
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (value && !phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number';
            }
            break;
    }

    showFieldValidation(fieldName, isValid, errorMessage);
    return isValid;
}

/**
 * Show field validation results
 */
function showFieldValidation(fieldName, isValid, errorMessage) {
    const errorElement = document.getElementById(fieldName + 'Error');
    const inputElement = document.getElementById(fieldName);
    
    if (errorElement) {
        if (isValid) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
            inputElement.style.borderColor = 'var(--success-color)';
        } else {
            errorElement.textContent = errorMessage;
            errorElement.style.display = 'block';
            errorElement.style.color = 'var(--danger-color)';
            errorElement.style.fontSize = '0.8rem';
            errorElement.style.marginTop = '0.25rem';
            inputElement.style.borderColor = 'var(--danger-color)';
        }
    }
}

/**
 * Clear all validation errors
 */
function clearValidationErrors() {
    const errorMessages = document.querySelectorAll('.validation-message');
    const inputs = document.querySelectorAll('.form-input');
    
    errorMessages.forEach(error => {
        error.textContent = '';
        error.style.display = 'none';
    });
    
    inputs.forEach(input => {
        input.style.borderColor = '';
    });
}

/**
 * Calculate and display live lead score
 */
function calculateLiveScore() {
    const formData = getFormData();
    const score = calculateLeadScore(formData);
    const factors = getScoreFactors(formData);
    const actions = getRecommendedActions(score);
    
    updateScoreDisplay(score, factors, actions);
}

/**
 * Get form data as object
 */
function getFormData() {
    const form = elements.leadForm;
    if (!form) return {};
    
    return {
        companyName: form.companyName?.value || '',
        contactPerson: form.contactPerson?.value || '',
        email: form.email?.value || '',
        phone: form.phone?.value || '',
        industry: form.industry?.value || '',
        companySize: form.companySize?.value || '',
        budget: form.budget?.value || '',
        description: form.description?.value || ''
    };
}

/**
 * Calculate lead score based on form data
 */
function calculateLeadScore(data) {
    let score = 0;
    
    // Industry scoring (0-25 points)
    const industryScores = {
        'technology': 25,
        'finance': 22,
        'healthcare': 20,
        'manufacturing': 18,
        'retail': 15,
        'other': 10
    };
    score += industryScores[data.industry] || 0;
    
    // Company size scoring (0-25 points)
    const sizeScores = {
        'enterprise': 25,
        'large': 20,
        'medium': 15,
        'small': 10,
        'startup': 5
    };
    score += sizeScores[data.companySize] || 0;
    
    // Budget scoring (0-30 points)
    const budgetScores = {
        'over-500k': 30,
        '100k-500k': 25,
        '50k-100k': 20,
        '10k-50k': 15,
        'under-10k': 10
    };
    score += budgetScores[data.budget] || 0;
    
    // Contact completeness (0-10 points)
    if (data.companyName) score += 3;
    if (data.contactPerson) score += 3;
    if (data.email) score += 4;
    
    // Description quality (0-10 points)
    if (data.description) {
        if (data.description.length > 50) score += 10;
        else if (data.description.length > 20) score += 6;
        else if (data.description.length > 0) score += 3;
    }
    
    return Math.min(score, 100);
}

/**
 * Get scoring factors breakdown
 */
function getScoreFactors(data) {
    const factors = [];
    
    if (data.industry) {
        const industryScores = {
            'technology': { points: 25, label: 'High-value industry' },
            'finance': { points: 22, label: 'Finance sector' },
            'healthcare': { points: 20, label: 'Healthcare industry' },
            'manufacturing': { points: 18, label: 'Manufacturing sector' },
            'retail': { points: 15, label: 'Retail industry' },
            'other': { points: 10, label: 'Other industry' }
        };
        const industryData = industryScores[data.industry];
        if (industryData) {
            factors.push({
                factor: industryData.label,
                points: industryData.points,
                color: industryData.points >= 20 ? 'var(--success-color)' : 'var(--warning-color)'
            });
        }
    }
    
    if (data.companySize) {
        const sizeScores = {
            'enterprise': { points: 25, label: 'Enterprise (1000+)' },
            'large': { points: 20, label: 'Large company (201-1000)' },
            'medium': { points: 15, label: 'Medium company (51-200)' },
            'small': { points: 10, label: 'Small company (11-50)' },
            'startup': { points: 5, label: 'Startup (1-10)' }
        };
        const sizeData = sizeScores[data.companySize];
        if (sizeData) {
            factors.push({
                factor: sizeData.label,
                points: sizeData.points,
                color: sizeData.points >= 15 ? 'var(--success-color)' : 'var(--warning-color)'
            });
        }
    }
    
    if (data.budget) {
        const budgetScores = {
            'over-500k': { points: 30, label: 'Budget >$500K' },
            '100k-500k': { points: 25, label: 'Budget $100K-$500K' },
            '50k-100k': { points: 20, label: 'Budget $50K-$100K' },
            '10k-50k': { points: 15, label: 'Budget $10K-$50K' },
            'under-10k': { points: 10, label: 'Budget <$10K' }
        };
        const budgetData = budgetScores[data.budget];
        if (budgetData) {
            factors.push({
                factor: budgetData.label,
                points: budgetData.points,
                color: budgetData.points >= 20 ? 'var(--success-color)' : 'var(--warning-color)'
            });
        }
    }
    
    return factors;
}

/**
 * Get recommended actions based on score
 */
function getRecommendedActions(score) {
    if (score >= 80) {
        return [
            'Assign to senior sales rep immediately',
            'Schedule demo within 24 hours',
            'Send priority notification to sales team',
            'Add to high-priority follow-up list'
        ];
    } else if (score >= 60) {
        return [
            'Add to nurture email campaign',
            'Schedule follow-up in 3-5 days',
            'Send targeted industry content',
            'Monitor engagement metrics'
        ];
    } else if (score >= 40) {
        return [
            'Add to general newsletter list',
            'Send educational content',
            'Monitor for engagement increases',
            'Follow up in 2 weeks'
        ];
    } else {
        return [
            'Collect more qualifying information',
            'Send introductory materials',
            'Add to long-term nurture sequence',
            'Re-evaluate in 30 days'
        ];
    }
}

/**
 * Update score display with animation
 */
function updateScoreDisplay(score, factors, actions) {
    if (!elements.leadScoreDisplay) return;
    
    // Update score number with animation
    elements.leadScoreDisplay.textContent = score;
    elements.leadScoreDisplay.style.color = getScoreColor(score);
    
    // Update progress bar
    if (elements.leadScoreProgress) {
        elements.leadScoreProgress.style.width = score + '%';
        elements.leadScoreProgress.style.background = getScoreGradient(score);
    }
    
    // Update factors
    if (elements.scoringFactors && factors.length > 0) {
        elements.scoringFactors.style.display = 'block';
        const factorsList = document.getElementById('factorsList');
        if (factorsList) {
            factorsList.innerHTML = factors.map(factor => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: var(--background-dark); border-radius: 6px;">
                    <span style="color: var(--text-primary); font-size: 0.9rem;">${factor.factor}</span>
                    <span style="color: ${factor.color}; font-weight: 600;">+${factor.points}</span>
                </div>
            `).join('');
        }
    }
    
    // Update recommended actions
    if (elements.recommendedActions && actions.length > 0) {
        elements.recommendedActions.style.display = 'block';
        const actionsList = document.getElementById('actionsList');
        if (actionsList) {
            actionsList.innerHTML = actions.map(action => `
                <div style="display: flex; align-items: center; margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.9rem;">
                    <i class="fas fa-chevron-right" style="color: var(--primary-color); margin-right: 0.5rem; font-size: 0.7rem;"></i>
                    ${action}
                </div>
            `).join('');
        }
    }
}

/**
 * Get color based on score
 */
function getScoreColor(score) {
    if (score >= 80) return 'var(--success-color)';
    if (score >= 60) return 'var(--warning-color)';
    if (score >= 40) return 'var(--secondary-color)';
    return 'var(--danger-color)';
}

/**
 * Get gradient based on score
 */
function getScoreGradient(score) {
    if (score >= 80) return 'linear-gradient(135deg, #10b981, #059669)';
    if (score >= 60) return 'linear-gradient(135deg, #f59e0b, #d97706)';
    if (score >= 40) return 'linear-gradient(135deg, #3b82f6, #2563eb)';
    return 'linear-gradient(135deg, #ef4444, #dc2626)';
}

/**
 * Handle lead form submission
 */
function handleLeadSubmission(event) {
    event.preventDefault();
    
    // Validate all fields
    const form = event.target;
    const formData = getFormData();
    let isValid = true;
    
    // Validate required fields
    const requiredFields = ['companyName', 'contactPerson', 'email'];
    requiredFields.forEach(fieldName => {
        const field = form[fieldName];
        if (!validateField({ target: field })) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        logActivity('Form validation failed', 'error');
        return;
    }
    
    // Calculate final score
    const score = calculateLeadScore(formData);
    
    // Create lead object
    const lead = {
        id: Date.now(),
        ...formData,
        score: score,
        status: getLeadStatus(score),
        createdAt: new Date(),
        assignedTo: score >= 80 ? 'Senior Sales Rep' : 'Sales Team'
    };
    
    // Add to database
    leadDatabase.push(lead);
    
    // Update UI
    updateLeadsTable();
    updateAnalytics();
    updateChart();
    
    // Trigger workflow automation
    triggerWorkflows(lead);
    
    // Log activity
    logActivity(`New lead added: ${lead.companyName} (Score: ${score})`, 'success');
    
    // Show success animation
    showSuccessAnimation();
    
    // Clear form
    clearForm();
}

/**
 * Get lead status based on score
 */
function getLeadStatus(score) {
    if (score >= 80) return 'hot';
    if (score >= 60) return 'warm';
    if (score >= 40) return 'cold';
    return 'unqualified';
}

/**
 * Clear the lead form
 */
function clearForm() {
    if (!elements.leadForm) return;
    
    elements.leadForm.reset();
    clearValidationErrors();
    
    // Reset score display
    if (elements.leadScoreDisplay) {
        elements.leadScoreDisplay.textContent = '--';
        elements.leadScoreDisplay.style.color = 'var(--text-secondary)';
    }
    
    if (elements.leadScoreProgress) {
        elements.leadScoreProgress.style.width = '0%';
    }
    
    if (elements.scoringFactors) {
        elements.scoringFactors.style.display = 'none';
    }
    
    if (elements.recommendedActions) {
        elements.recommendedActions.style.display = 'none';
    }
}

/**
 * Update leads table
 */
function updateLeadsTable() {
    if (!elements.leadsTableBody) return;
    
    if (leadDatabase.length === 0) {
        elements.leadsTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="padding: 2rem; text-align: center; color: var(--text-secondary);">
                    No leads yet. Add your first lead using the form above!
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort leads by creation date (newest first)
    const sortedLeads = [...leadDatabase].sort((a, b) => b.createdAt - a.createdAt);
    
    elements.leadsTableBody.innerHTML = sortedLeads.map(lead => `
        <tr style="border-bottom: 1px solid var(--border-color);">
            <td style="padding: 1rem; color: var(--text-primary);">
                <div style="font-weight: 600;">${lead.companyName}</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary);">${lead.industry || 'Not specified'}</div>
            </td>
            <td style="padding: 1rem; color: var(--text-primary);">
                <div>${lead.contactPerson}</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary);">${lead.email}</div>
            </td>
            <td style="padding: 1rem; color: var(--text-primary);">
                ${lead.industry || 'Not specified'}
            </td>
            <td style="padding: 1rem; text-align: center;">
                <span style="background: ${getScoreColor(lead.score)}; color: white; padding: 0.25rem 0.5rem; border-radius: 12px; font-weight: 600;">
                    ${lead.score}
                </span>
            </td>
            <td style="padding: 1rem; text-align: center;">
                <span style="background: ${getStatusColor(lead.status)}; color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem; text-transform: capitalize;">
                    ${lead.status}
                </span>
            </td>
            <td style="padding: 1rem; text-align: center;">
                <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;" onclick="viewLead(${lead.id})">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

/**
 * Get status color
 */
function getStatusColor(status) {
    const colors = {
        'hot': 'var(--danger-color)',
        'warm': 'var(--warning-color)',
        'cold': 'var(--primary-color)',
        'unqualified': 'var(--text-secondary)'
    };
    return colors[status] || 'var(--text-secondary)';
}

/**
 * Trigger workflow automations
 */
function triggerWorkflows(lead) {
    // High-score lead assignment
    if (lead.score >= 80) {
        workflowCounters.highScore++;
        document.getElementById('highScoreCount').textContent = workflowCounters.highScore;
        logActivity(`High-score workflow triggered for ${lead.companyName}`, 'info');
        
        // Simulate priority notification
        setTimeout(() => {
            logActivity(`Priority notification sent to senior sales rep for ${lead.companyName}`, 'success');
        }, 1000);
    }
    
    // Nurture email sequence
    if (lead.score >= 60 && lead.score < 80) {
        workflowCounters.nurture++;
        document.getElementById('nurtureCount').textContent = workflowCounters.nurture;
        logActivity(`Nurture email sequence started for ${lead.companyName}`, 'info');
        
        // Simulate email enrollment
        setTimeout(() => {
            logActivity(`${lead.companyName} enrolled in ${lead.industry || 'general'} nurture campaign`, 'success');
        }, 1500);
    }
}

/**
 * Initialize Chart.js analytics chart
 */
function initializeChart() {
    if (!elements.leadChart) {
        console.log('Chart canvas not found, skipping chart initialization');
        return;
    }
    
    // Check if Chart.js is available
    if (typeof Chart === 'undefined') {
        console.error('Chart.js library not loaded. Please check CDN connection.');
        return;
    }
    
    try {
        const ctx = elements.leadChart.getContext('2d');
        
        leadChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Leads Generated',
                data: [],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }, {
                label: 'Hot Leads',
                data: [],
                borderColor: 'rgb(239, 68, 68)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Lead Generation Trends',
                    color: '#e5e7eb'
                },
                legend: {
                    labels: {
                        color: '#e5e7eb'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#9ca3af'
                    },
                    grid: {
                        color: 'rgba(75, 85, 99, 0.3)'
                    }
                },
                y: {
                    beginAt: 0,
                    ticks: {
                        color: '#9ca3af'
                    },
                    grid: {
                        color: 'rgba(75, 85, 99, 0.3)'
                    }
                }
            }
        }
    });
    
    } catch (error) {
        console.error('Error initializing Chart.js:', error);
        // Fallback: show message in chart area
        if (elements.leadChart) {
            elements.leadChart.parentElement.innerHTML = `
                <div style="text-align: center; color: var(--text-secondary); padding: 2rem;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i><br>
                    Chart initialization failed.<br>
                    <small>Please check internet connection for Chart.js CDN.</small>
                </div>
            `;
        }
    }
}

/**
 * Update chart with new data
 */
function updateChart() {
    if (!leadChart) return;
    
    // Generate the last 7 days of data
    const today = new Date();
    const labels = [];
    const totalData = [];
    const hotData = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        
        // Simulate realistic data progression
        const dayLeads = Math.max(0, leadDatabase.length - (6 - i) * 2 + Math.floor(Math.random() * 3));
        const dayHotLeads = Math.floor(dayLeads * 0.3);
        
        totalData.push(dayLeads);
        hotData.push(dayHotLeads);
    }
    
    leadChart.data.labels = labels;
    leadChart.data.datasets[0].data = totalData;
    leadChart.data.datasets[1].data = hotData;
    leadChart.update();
}

/**
 * Update analytics KPI cards
 */
function updateAnalytics() {
    if (!leadDatabase.length) return;
    
    const totalLeads = leadDatabase.length;
    const hotLeads = leadDatabase.filter(lead => lead.status === 'hot').length;
    const avgScore = Math.round(leadDatabase.reduce((sum, lead) => sum + lead.score, 0) / totalLeads);
    const conversionRate = Math.round((hotLeads / totalLeads) * 100);
    
    // Update KPI displays with animation
    animateCounter(elements.totalLeads, totalLeads);
    animateCounter(elements.avgScore, avgScore);
    animateCounter(elements.hotLeads, hotLeads);
    animateCounter(elements.conversionRate, conversionRate, '%');
}

/**
 * Animate counter values
 */
function animateCounter(element, targetValue, suffix = '') {
    if (!element) return;
    
    const startValue = parseInt(element.textContent) || 0;
    const duration = 1000;
    const startTime = performance.now();
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
        element.textContent = currentValue + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }
    
    requestAnimationFrame(updateCounter);
}

/**
 * Log activity to the activity log
 */
function logActivity(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const activity = {
        id: Date.now(),
        message,
        type,
        timestamp
    };
    
    activityLog.unshift(activity);
    
    // Keep only last 50 activities
    if (activityLog.length > 50) {
        activityLog = activityLog.slice(0, 50);
    }
    
    updateActivityLog();
}

/**
 * Update activity log display
 */
function updateActivityLog() {
    if (!elements.activityLog) return;
    
    if (activityLog.length === 0) {
        elements.activityLog.innerHTML = `
            <div style="color: var(--text-secondary); text-align: center; padding: 2rem;">
                Activity log will appear here as you interact with the system...
            </div>
        `;
        return;
    }
    
    elements.activityLog.innerHTML = activityLog.map(activity => {
        const iconClass = getActivityIcon(activity.type);
        const color = getActivityColor(activity.type);
        
        return `
            <div style="display: flex; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid var(--border-color);">
                <i class="${iconClass}" style="color: ${color}; margin-right: 0.75rem; width: 16px; text-align: center;"></i>
                <span style="color: var(--text-primary); flex: 1;">${activity.message}</span>
                <span style="color: var(--text-secondary); font-size: 0.8rem;">${activity.timestamp}</span>
            </div>
        `;
    }).join('');
}

/**
 * Get activity icon based on type
 */
function getActivityIcon(type) {
    const icons = {
        'success': 'fas fa-check-circle',
        'error': 'fas fa-times-circle',
        'warning': 'fas fa-exclamation-triangle',
        'info': 'fas fa-info-circle'
    };
    return icons[type] || 'fas fa-circle';
}

/**
 * Get activity color based on type
 */
function getActivityColor(type) {
    const colors = {
        'success': 'var(--success-color)',
        'error': 'var(--danger-color)',
        'warning': 'var(--warning-color)',
        'info': 'var(--primary-color)'
    };
    return colors[type] || 'var(--text-secondary)';
}

/**
 * Show success animation after form submission
 */
function showSuccessAnimation() {
    const form = elements.leadForm;
    if (!form) return;
    
    // Create success overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(16, 185, 129, 0.1);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeInOut 2s ease-in-out;
    `;
    
    overlay.innerHTML = `
        <div style="text-align: center; color: var(--success-color);">
            <i class="fas fa-check-circle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
            <div style="font-size: 1.2rem; font-weight: 600;">Lead Added Successfully!</div>
        </div>
    `;
    
    // Add keyframe animation
    if (!document.getElementById('successAnimation')) {
        const style = document.createElement('style');
        style.id = 'successAnimation';
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: scale(0.8); }
                50% { opacity: 1; transform: scale(1); }
                100% { opacity: 0; transform: scale(0.8); }
            }
        `;
        document.head.appendChild(style);
    }
    
    form.parentElement.style.position = 'relative';
    form.parentElement.appendChild(overlay);
    
    setTimeout(() => {
        overlay.remove();
    }, 2000);
}

/**
 * Load sample data for demonstration
 */
function loadSampleData() {
    const sampleLeads = [
        {
            id: 1,
            companyName: 'TechCorp Solutions',
            contactPerson: 'Sarah Johnson',
            email: 'sarah.johnson@techcorp.com',
            phone: '+1 (555) 123-4567',
            industry: 'technology',
            companySize: 'large',
            budget: '100k-500k',
            description: 'Looking for comprehensive business automation solution',
            score: 87,
            status: 'hot',
            createdAt: new Date(Date.now() - 86400000 * 2),
            assignedTo: 'Senior Sales Rep'
        },
        {
            id: 2,
            companyName: 'HealthFirst Medical',
            contactPerson: 'Dr. Michael Chen',
            email: 'm.chen@healthfirst.com',
            phone: '+1 (555) 987-6543',
            industry: 'healthcare',
            companySize: 'medium',
            budget: '50k-100k',
            description: 'Need to streamline patient management workflows',
            score: 73,
            status: 'warm',
            createdAt: new Date(Date.now() - 86400000 * 1),
            assignedTo: 'Sales Team'
        },
        {
            id: 3,
            companyName: 'StartupHub Inc',
            contactPerson: 'Alex Rodriguez',
            email: 'alex@startuphub.com',
            phone: '+1 (555) 456-7890',
            industry: 'other',
            companySize: 'startup',
            budget: 'under-10k',
            description: 'Small team looking for basic automation tools',
            score: 34,
            status: 'cold',
            createdAt: new Date(Date.now() - 86400000 * 3),
            assignedTo: 'Sales Team'
        }
    ];
    
    leadDatabase = sampleLeads;
    updateLeadsTable();
    updateAnalytics();
    updateChart();
    
    // Log sample data loading
    logActivity('Sample data loaded (3 leads)', 'info');
    
    // Simulate some workflow triggers
    workflowCounters.highScore = 1;
    workflowCounters.nurture = 1;
    document.getElementById('highScoreCount').textContent = workflowCounters.highScore;
    document.getElementById('nurtureCount').textContent = workflowCounters.nurture;
}

/**
 * Export leads functionality
 */
function exportLeads() {
    if (leadDatabase.length === 0) {
        logActivity('No leads to export', 'warning');
        return;
    }
    
    const csvContent = [
        'Company,Contact,Email,Industry,Size,Budget,Score,Status,Created',
        ...leadDatabase.map(lead => [
            lead.companyName,
            lead.contactPerson,
            lead.email,
            lead.industry || '',
            lead.companySize || '',
            lead.budget || '',
            lead.score,
            lead.status,
            lead.createdAt.toLocaleDateString()
        ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    logActivity(`Exported ${leadDatabase.length} leads to CSV`, 'success');
}

/**
 * Refresh leads functionality
 */
function refreshLeads() {
    updateLeadsTable();
    updateAnalytics();
    updateChart();
    logActivity('Leads data refreshed', 'info');
}

/**
 * Clear activity log
 */
function clearActivityLog() {
    activityLog = [];
    updateActivityLog();
    logActivity('Activity log cleared', 'info');
}

/**
 * View lead details (placeholder for modal functionality)
 */
function viewLead(leadId) {
    const lead = leadDatabase.find(l => l.id === leadId);
    if (lead) {
        logActivity(`Viewing details for ${lead.companyName}`, 'info');
        
        // In a real application, this would open a modal or navigate to a detail page
        alert(`Lead Details:\n\nCompany: ${lead.companyName}\nContact: ${lead.contactPerson}\nEmail: ${lead.email}\nScore: ${lead.score}\nStatus: ${lead.status}`);
    }
}

// Ensure all functions are available globally for HTML onclick handlers
// This is essential for Visual Studio Code Live Server and GitHub Pages compatibility
(function(global) {
    'use strict';
    
    // Make functions globally available with error handling
    try {
        global.clearForm = clearForm;
        global.exportLeads = exportLeads;
        global.refreshLeads = refreshLeads;
        global.clearActivityLog = clearActivityLog;
        global.viewLead = viewLead;
        
        console.log('Full-stack demo functions loaded successfully');
    } catch (error) {
        console.error('Error loading full-stack demo functions:', error);
    }
    
})(window);