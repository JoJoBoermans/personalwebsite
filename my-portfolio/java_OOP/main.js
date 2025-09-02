// JavaScript for my Java OOP Learning Showcase
// Still learning web development too!

// Global variables
let currentBalance = 1000.00;
let currentVehicle = null;
let shapes = [];
let currentDatabase = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializePrincipleTabs();
    initializePlayground();
    initializeAnimations();
    initializeMobileMenu();
});

// Navigation functionality
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add scroll effect to navigation
    window.addEventListener('scroll', function() {
        const nav = document.querySelector('.nav');
        if (window.scrollY > 100) {
            nav.style.background = 'rgba(10, 14, 26, 0.98)';
        } else {
            nav.style.background = 'rgba(10, 14, 26, 0.95)';
        }
    });
}

// Principle tabs functionality
function initializePrincipleTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('.principle-panel');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const principle = this.getAttribute('data-principle');
            
            // Remove active class from all tabs and panels
            tabBtns.forEach(tab => tab.classList.remove('active'));
            panels.forEach(panel => panel.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding panel
            this.classList.add('active');
            document.getElementById(principle).classList.add('active');
        });
    });
}

// Encapsulation Demo - Bank Account
function deposit() {
    const amountInput = document.getElementById('amount-input');
    const amount = parseFloat(amountInput.value);
    const balanceElement = document.getElementById('balance');
    const logElement = document.getElementById('transaction-log');
    
    if (amount && amount > 0) {
        currentBalance += amount;
        balanceElement.textContent = currentBalance.toFixed(2);
        
        const logEntry = document.createElement('div');
        logEntry.innerHTML = `<span style="color: #10b981;">✓ Deposited: $${amount.toFixed(2)}</span>`;
        logElement.appendChild(logEntry);
        
        amountInput.value = '';
        logElement.scrollTop = logElement.scrollHeight;
        
        // Animation effect
        balanceElement.style.transform = 'scale(1.1)';
        balanceElement.style.color = '#10b981';
        setTimeout(() => {
            balanceElement.style.transform = 'scale(1)';
            balanceElement.style.color = '#ffffff';
        }, 300);
    } else {
        showError('Please enter a valid amount greater than 0');
    }
}

function withdraw() {
    const amountInput = document.getElementById('amount-input');
    const amount = parseFloat(amountInput.value);
    const balanceElement = document.getElementById('balance');
    const logElement = document.getElementById('transaction-log');
    
    if (amount && amount > 0) {
        if (amount <= currentBalance) {
            currentBalance -= amount;
            balanceElement.textContent = currentBalance.toFixed(2);
            
            const logEntry = document.createElement('div');
            logEntry.innerHTML = `<span style="color: #ef4444;">✓ Withdrawn: $${amount.toFixed(2)}</span>`;
            logElement.appendChild(logEntry);
            
            amountInput.value = '';
            logElement.scrollTop = logElement.scrollHeight;
            
            // Animation effect
            balanceElement.style.transform = 'scale(1.1)';
            balanceElement.style.color = '#ef4444';
            setTimeout(() => {
                balanceElement.style.transform = 'scale(1)';
                balanceElement.style.color = '#ffffff';
            }, 300);
        } else {
            showError('Insufficient funds! Available balance: $' + currentBalance.toFixed(2));
        }
    } else {
        showError('Please enter a valid amount greater than 0');
    }
}

function showError(message) {
    const logElement = document.getElementById('transaction-log');
    const errorEntry = document.createElement('div');
    errorEntry.innerHTML = `<span style="color: #ef4444;">✗ Error: ${message}</span>`;
    logElement.appendChild(errorEntry);
    logElement.scrollTop = logElement.scrollHeight;
}

// Inheritance Demo - Vehicle Classes
function createVehicle(type) {
    const displayElement = document.getElementById('vehicle-display');
    
    if (type === 'car') {
        currentVehicle = {
            type: 'Car',
            brand: 'Toyota',
            year: 2023,
            doors: 4,
            start: function() {
                return `${this.year} ${this.brand} ${this.type} engine started with key`;
            },
            getFuelEfficiency: function() {
                return 25.5;
            },
            displayInfo: function() {
                return `${this.year} ${this.brand} ${this.type} (${this.doors} doors)`;
            }
        };
    } else if (type === 'motorcycle') {
        currentVehicle = {
            type: 'Motorcycle',
            brand: 'Honda',
            year: 2023,
            hasSidecar: false,
            start: function() {
                return `${this.year} ${this.brand} ${this.type} started with button`;
            },
            getFuelEfficiency: function() {
                return 45.0;
            },
            displayInfo: function() {
                return `${this.year} ${this.brand} ${this.type} ${this.hasSidecar ? 'with sidecar' : ''}`;
            }
        };
    }
    
    if (currentVehicle) {
        displayElement.innerHTML = `
            <div style="background: rgba(0, 115, 150, 0.1); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <h5 style="color: #007396; margin-bottom: 0.5rem;">Vehicle Created:</h5>
                <p><strong>Info:</strong> ${currentVehicle.displayInfo()}</p>
                <p><strong>Start:</strong> ${currentVehicle.start()}</p>
                <p><strong>Fuel Efficiency:</strong> ${currentVehicle.getFuelEfficiency()} MPG</p>
            </div>
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; color: #a0a9c0;">
                // Inheritance in action:<br>
                // Base Vehicle class provides common structure<br>
                // ${currentVehicle.type} class extends Vehicle<br>
                // Method overriding: start() and getFuelEfficiency()<br>
                // Shared method: displayInfo() from base class
            </div>
        `;
    }
}

// Polymorphism Demo - Shape System
function addShape() {
    const shapeType = document.getElementById('shape-type').value;
    const canvas = document.getElementById('shapes-canvas');
    const ctx = canvas.getContext('2d');
    
    // Get actual canvas dimensions for mobile compatibility
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let shape;
    const margin = 50;
    const x = Math.random() * (canvas.width - margin * 2) + margin;
    const y = Math.random() * (canvas.height - margin * 2) + margin;
    
    switch (shapeType) {
        case 'circle':
            const radius = Math.random() * 30 + 20;
            shape = {
                type: 'Circle',
                x: x,
                y: y,
                radius: radius,
                color: getRandomColor(),
                draw: function() {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
                    ctx.fillStyle = this.color;
                    ctx.fill();
                    ctx.strokeStyle = '#ffffff';
                    ctx.stroke();
                },
                calculateArea: function() {
                    return Math.PI * this.radius * this.radius;
                }
            };
            break;
        case 'rectangle':
            const width = Math.random() * 60 + 40;
            const height = Math.random() * 60 + 40;
            shape = {
                type: 'Rectangle',
                x: x,
                y: y,
                width: width,
                height: height,
                color: getRandomColor(),
                draw: function() {
                    ctx.fillStyle = this.color;
                    ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
                    ctx.strokeStyle = '#ffffff';
                    ctx.strokeRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
                },
                calculateArea: function() {
                    return this.width * this.height;
                }
            };
            break;
        case 'triangle':
            const size = Math.random() * 40 + 30;
            shape = {
                type: 'Triangle',
                x: x,
                y: y,
                size: size,
                color: getRandomColor(),
                draw: function() {
                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y - this.size);
                    ctx.lineTo(this.x - this.size, this.y + this.size);
                    ctx.lineTo(this.x + this.size, this.y + this.size);
                    ctx.closePath();
                    ctx.fillStyle = this.color;
                    ctx.fill();
                    ctx.strokeStyle = '#ffffff';
                    ctx.stroke();
                },
                calculateArea: function() {
                    return (Math.sqrt(3) / 4) * this.size * this.size;
                }
            };
            break;
    }
    
    shapes.push(shape);
    drawAllShapes();
}

function drawAllShapes() {
    const canvas = document.getElementById('shapes-canvas');
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    shapes.forEach(shape => shape.draw());
}

function processAllShapes() {
    const outputElement = document.getElementById('shapes-output');
    
    if (shapes.length === 0) {
        outputElement.innerHTML = '<span style="color: #f59e0b;">No shapes to process! Add some shapes first.</span>';
        return;
    }
    
    let output = '<div style="font-family: \'JetBrains Mono\', monospace; font-size: 0.85rem;">';
    output += '<h5 style="color: #007396; margin-bottom: 1rem;">Polymorphic Processing Results:</h5>';
    
    shapes.forEach((shape, index) => {
        output += `<div style="margin-bottom: 0.8rem; padding: 0.5rem; background: rgba(0, 115, 150, 0.1); border-radius: 4px;">`;
        output += `<strong>${shape.type} ${index + 1}:</strong><br>`;
        output += `&nbsp;&nbsp;draw() → Drawing a ${shape.type.toLowerCase()}<br>`;
        output += `&nbsp;&nbsp;calculateArea() → ${shape.calculateArea().toFixed(2)} px²`;
        output += `</div>`;
    });
    
    output += '<div style="margin-top: 1rem; color: #a0a9c0; font-style: italic;">';
    output += '// Same method calls (draw, calculateArea) but different behaviors<br>';
    output += '// This is polymorphism - one interface, multiple implementations';
    output += '</div>';
    output += '</div>';
    
    outputElement.innerHTML = output;
}

function clearShapes() {
    shapes = [];
    drawAllShapes();
    document.getElementById('shapes-output').innerHTML = '';
}

function getRandomColor() {
    const colors = ['#007396', '#f89820', '#ed8b00', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Abstraction Demo - Database Connection
function connectDatabase() {
    const dbType = document.getElementById('db-type').value;
    const logElement = document.getElementById('db-log');
    
    const connectionString = `jdbc:${dbType}://localhost:5432/mydb`;
    
    switch (dbType) {
        case 'mysql':
            currentDatabase = {
                type: 'MySQL',
                connectionString: connectionString,
                connected: true,
                connect: function() {
                    return `[MySQLConnection] Connecting to MySQL database...`;
                },
                disconnect: function() {
                    return `[MySQLConnection] Disconnecting from MySQL database...`;
                },
                executeQuery: function(query) {
                    return `[MySQLConnection] Executing MySQL query: ${query}`;
                }
            };
            break;
        case 'postgresql':
            currentDatabase = {
                type: 'PostgreSQL',
                connectionString: connectionString,
                connected: true,
                connect: function() {
                    return `[PostgreSQLConnection] Connecting to PostgreSQL database...`;
                },
                disconnect: function() {
                    return `[PostgreSQLConnection] Disconnecting from PostgreSQL database...`;
                },
                executeQuery: function(query) {
                    return `[PostgreSQLConnection] Executing PostgreSQL query: ${query}`;
                }
            };
            break;
        case 'oracle':
            currentDatabase = {
                type: 'Oracle',
                connectionString: connectionString,
                connected: true,
                connect: function() {
                    return `[OracleConnection] Connecting to Oracle database...`;
                },
                disconnect: function() {
                    return `[OracleConnection] Disconnecting from Oracle database...`;
                },
                executeQuery: function(query) {
                    return `[OracleConnection] Executing Oracle query: ${query}`;
                }
            };
            break;
    }
    
    if (currentDatabase) {
        const logEntry = document.createElement('div');
        logEntry.innerHTML = `
            <div style="color: #10b981; margin-bottom: 0.5rem;">${currentDatabase.connect()}</div>
            <div style="color: #a0a9c0; font-size: 0.8rem;">Connection established to ${currentDatabase.type}</div>
            <hr style="border: none; border-top: 1px solid #2d3748; margin: 1rem 0;">
        `;
        logElement.appendChild(logEntry);
        logElement.scrollTop = logElement.scrollHeight;
    }
}

function disconnectDatabase() {
    const logElement = document.getElementById('db-log');
    
    if (currentDatabase && currentDatabase.connected) {
        const logEntry = document.createElement('div');
        logEntry.innerHTML = `
            <div style="color: #ef4444; margin-bottom: 0.5rem;">${currentDatabase.disconnect()}</div>
            <div style="color: #a0a9c0; font-size: 0.8rem;">Connection closed</div>
            <hr style="border: none; border-top: 1px solid #2d3748; margin: 1rem 0;">
        `;
        logElement.appendChild(logEntry);
        currentDatabase.connected = false;
        logElement.scrollTop = logElement.scrollHeight;
    } else {
        const errorEntry = document.createElement('div');
        errorEntry.innerHTML = `<div style="color: #f59e0b;">No active database connection!</div>`;
        logElement.appendChild(errorEntry);
        logElement.scrollTop = logElement.scrollHeight;
    }
}

function executeQuery() {
    const queryInput = document.getElementById('sql-query');
    const query = queryInput.value.trim();
    const logElement = document.getElementById('db-log');
    
    if (!currentDatabase || !currentDatabase.connected) {
        const errorEntry = document.createElement('div');
        errorEntry.innerHTML = `<div style="color: #ef4444;">Error: No active database connection! Please connect first.</div>`;
        logElement.appendChild(errorEntry);
        logElement.scrollTop = logElement.scrollHeight;
        return;
    }
    
    if (!query) {
        const errorEntry = document.createElement('div');
        errorEntry.innerHTML = `<div style="color: #f59e0b;">Error: Please enter a SQL query!</div>`;
        logElement.appendChild(errorEntry);
        logElement.scrollTop = logElement.scrollHeight;
        return;
    }
    
    const logEntry = document.createElement('div');
    logEntry.innerHTML = `
        <div style="color: #007396; margin-bottom: 0.5rem;">${currentDatabase.executeQuery(query)}</div>
        <div style="color: #10b981; font-size: 0.8rem;">Query executed successfully</div>
        <div style="color: #a0a9c0; font-size: 0.8rem; margin-top: 0.5rem;">
            // Abstract method implementation varies by database type<br>
            // Same interface, different internal logic
        </div>
        <hr style="border: none; border-top: 1px solid #2d3748; margin: 1rem 0;">
    `;
    logElement.appendChild(logEntry);
    logElement.scrollTop = logElement.scrollHeight;
}

// Code Playground
function initializePlayground() {
    const codeEditor = document.getElementById('code-editor');
    
    // Add syntax highlighting simulation
    codeEditor.addEventListener('input', function() {
        // This is a simple simulation - in a real application you'd use a proper syntax highlighter
        // For now, we'll just update the line numbers or add basic formatting
    });
}

function runCode() {
    try {
        const codeEditor = document.getElementById('code-editor');
        const outputElement = document.getElementById('code-output');
        
        if (!codeEditor || !outputElement) {
            console.error('Code editor or output element not found!');
            return;
        }
        
        const code = codeEditor.value;
    
    // Simulate code execution by parsing and showing expected output
    // This is a demonstration - not actual Java compilation
    let output = '';
    let hasExecutableCode = false;
    
    // Parse animal matches first (outside of main method check for scope)
    const dogMatches = code.match(/(?:Animal\s+\w+\s*=\s*)?new\s+Dog\s*\(\s*"([^"]+)"\s*,\s*(\d+)\s*\)/g);
    const catMatches = code.match(/(?:Animal\s+\w+\s*=\s*)?new\s+Cat\s*\(\s*"([^"]+)"\s*,\s*(\d+)\s*\)/g);
    const birdMatches = code.match(/(?:Animal\s+\w+\s*=\s*)?new\s+Bird\s*\(\s*"([^"]+)"\s*,\s*(\d+)\s*\)/g);
    
    // Check for main method and simulate execution
    if (code.includes('public static void main')) {
        output += '=== Program Output ===\n\n';
        hasExecutableCode = true;
        
        // Simulate Dog creation with any name and age
        if (dogMatches) {
            dogMatches.forEach(match => {
                const details = match.match(/new\s+Dog\s*\(\s*"([^"]+)"\s*,\s*(\d+)\s*\)/);
                if (details) {
                    const name = details[1];
                    const age = details[2];
                    output += `${name} is ${age} years old\n`;
                    output += `${name} says: Woof! Woof!\n\n`;
                }
            });
        }
        
        // Simulate Cat creation with any name and age
        if (catMatches) {
            catMatches.forEach(match => {
                const details = match.match(/new\s+Cat\s*\(\s*"([^"]+)"\s*,\s*(\d+)\s*\)/);
                if (details) {
                    const name = details[1];
                    const age = details[2];
                    output += `${name} is ${age} years old\n`;
                    output += `${name} says: Meow! Meow!\n\n`;
                }
            });
        }
        
        // Simulate Bird creation (if user adds it)
        if (birdMatches) {
            birdMatches.forEach(match => {
                const details = match.match(/new\s+Bird\s*\(\s*"([^"]+)"\s*,\s*(\d+)\s*\)/);
                if (details) {
                    const name = details[1];
                    const age = details[2];
                    output += `${name} is ${age} years old\n`;
                    output += `${name} says: Tweet! Tweet!\n\n`;
                }
            });
        }
        
        // Check for any BankAccount usage
        if (code.includes('BankAccount') && code.includes('new BankAccount')) {
            output += 'Deposited: $500.0\n';
            output += 'Withdrawn: $200.0\n';
            
            // Try to extract account details and balance from code
            const accountMatch = code.match(/new\s+BankAccount\s*\(\s*"([^"]+)"\s*,\s*(\d+(?:\.\d+)?)\s*\)/);
            if (accountMatch) {
                const accountNumber = accountMatch[1];
                const initialBalance = parseFloat(accountMatch[2]);
                const finalBalance = initialBalance + 500 - 200;
                output += `My balance: $${finalBalance.toFixed(1)}\n\n`;
            } else {
                output += 'My balance: $1300.0\n\n';
            }
        }
        
        // Look for custom animals or classes (anything that's not Dog, Cat, BankAccount)
        const customAnimals = code.match(/new\s+(\w+)\s*\(/g);
        if (customAnimals) {
            const seenClasses = new Set();
            customAnimals.forEach(match => {
                const className = match.replace(/new\s+/, '').replace('(', '');
                if (!['Dog', 'Cat', 'Bird', 'BankAccount', 'Animal'].includes(className) && !seenClasses.has(className)) {
                    seenClasses.add(className);
                    // Try to extract name if it follows the Animal pattern
                    const customMatch = code.match(new RegExp(`new\\s+${className}\\s*\\(\\s*"([^"]+)"\\s*,\\s*(\\d+)\\s*\\)`));
                    if (customMatch) {
                        const name = customMatch[1];
                        const age = customMatch[2];
                        output += `${name} the ${className} is ${age} years old\n`;
                        output += `${name} makes a ${className.toLowerCase()} sound!\n\n`;
                    } else {
                        output += `${className} created successfully!\n\n`;
                    }
                }
            });
        }
    }
    
    // Add execution info
    if (hasExecutableCode) {
        output += '\n=== Learning Notes ===\n';
        output += '✓ Code executed successfully!\n';
        output += '\n// What I\'m practicing:\n';
        
        // Count different OOP concepts being used
        let conceptsUsed = [];
        
        if (code.includes('extends')) {
            conceptsUsed.push('Inheritance: Using extends keyword ✓');
        }
        if (code.includes('super(')) {
            conceptsUsed.push('Super constructor: Calling parent class ✓');
        }
        if (code.includes('@Override')) {
            conceptsUsed.push('Method overriding: Custom behavior for child classes ✓');
        }
        if (code.includes('private') || code.includes('protected')) {
            conceptsUsed.push('Encapsulation: Controlling access to data ✓');
        }
        if (code.includes('abstract')) {
            conceptsUsed.push('Abstraction: Using abstract classes/methods ✓');
        }
        
        // Add polymorphism detection
        if ((dogMatches && dogMatches.length > 0) || (catMatches && catMatches.length > 0) || (birdMatches && birdMatches.length > 0)) {
            conceptsUsed.push('Polymorphism: Different animals, same method calls ✓');
        }
        
        conceptsUsed.forEach(concept => {
            output += `// → ${concept}\n`;
        });
        
        
        output += `// → Found ${conceptsUsed.length} OOP concepts in your code!\n`;
        output += '// → This is how I\'m learning Java OOP step by step!\n';
    } else {
        output = 'Ready to experiment! Try clicking "Run Code" with the default example.\n\n';
        output += 'Ideas to try:\n';
        output += '- Change animal names and ages (e.g., "Buddy", 5)\n';
        output += '- Add a new animal type (like Bird)\n';
        output += '- Change the bank account starting balance\n';
        output += '- Create animals with different names\n';
        output += '- Add new methods to the classes\n\n';
        output += '// Remember: The code parser is flexible - try different values!\n';
        output += '// Tip: Make sure your code has a main() method to see output!';
    }
    
    outputElement.innerHTML = `<pre style="margin: 0; white-space: pre-wrap; font-family: 'JetBrains Mono', monospace; line-height: 1.5;">${output}</pre>`;
    
        // Add animation effect
        outputElement.style.opacity = '0';
        setTimeout(() => {
            outputElement.style.transition = 'opacity 0.3s ease';
            outputElement.style.opacity = '1';
        }, 100);
        
    } catch (error) {
        console.error('Error in runCode function:', error);
        const outputElement = document.getElementById('code-output');
        if (outputElement) {
            outputElement.innerHTML = `<pre style="color: #ef4444;">Error executing code: ${error.message}\n\nPlease try again or refresh the page.</pre>`;
        }
    }
}

function clearOutput() {
    try {
        const outputElement = document.getElementById('code-output');
        if (outputElement) {
            outputElement.innerHTML = `<pre style="margin: 0; white-space: pre-wrap; font-family: 'JetBrains Mono', monospace;">Output cleared. Click "Run Code" to test your Java learning!

// Tip: Don't be afraid to experiment and make mistakes - that's how we learn!
// Try modifying the code above and see what happens! 🚀</pre>`;
        }
    } catch (error) {
        console.error('Error in clearOutput function:', error);
    }
}

// Animation utilities
function initializeAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.overview-card, .project-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease';
        observer.observe(card);
    });
    
    // Mobile-specific optimizations
    if (window.innerWidth <= 768) {
        // Reduce animations on mobile for better performance
        document.querySelectorAll('.overview-card, .project-card').forEach(card => {
            card.style.transition = 'opacity 0.3s ease';
        });
    }
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add smooth scrolling for better UX
function smoothScrollTo(targetId) {
    const element = document.getElementById(targetId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Learning Projects Data
let gameCharacter = null;
let students = [];
let pets = [];
let library = [];
let gameState = {
    playerHealth: 100,
    enemyHealth: 100,
    round: 1
};

// Simple Text-Based Game Implementation
class Player {
    constructor(name, type) {
        this.name = name;
        this.type = type;
        this.health = 100;
        this.maxHealth = 100;
        this.level = 1;
    }
    
    attack() {
        return `${this.name} attacks!`;
    }
    
    defend() {
        return `${this.name} defends!`;
    }
    
    heal() {
        const healAmount = Math.floor(Math.random() * 30) + 10;
        this.health = Math.min(this.maxHealth, this.health + healAmount);
        return `${this.name} heals for ${healAmount} HP!`;
    }
}

class Warrior extends Player {
    constructor(name) {
        super(name, 'Warrior');
        this.strength = 15;
    }
    
    attack() {
        const damage = Math.floor(Math.random() * this.strength) + 10;
        return `${this.name} the Warrior strikes with sword for ${damage} damage!`;
    }
    
    defend() {
        return `${this.name} raises shield and blocks incoming damage!`;
    }
}

class Mage extends Player {
    constructor(name) {
        super(name, 'Mage');
        this.mana = 50;
        this.intelligence = 12;
    }
    
    attack() {
        const damage = Math.floor(Math.random() * this.intelligence) + 8;
        return `${this.name} the Mage casts fireball for ${damage} magical damage!`;
    }
    
    defend() {
        return `${this.name} creates a magical barrier!`;
    }
}

class Archer extends Player {
    constructor(name) {
        super(name, 'Archer');
        this.dexterity = 13;
        this.arrows = 20;
    }
    
    attack() {
        const damage = Math.floor(Math.random() * this.dexterity) + 9;
        this.arrows--;
        return `${this.name} the Archer shoots an arrow for ${damage} damage! (${this.arrows} arrows left)`;
    }
    
    defend() {
        return `${this.name} dodges with agility!`;
    }
}

// Student Grade Calculator Implementation
class Student {
    constructor(name) {
        this.name = name;
        this.grades = [];
    }
    
    addGrade(grade) {
        if (grade >= 0 && grade <= 100) {
            this.grades.push(grade);
            return true;
        }
        return false;
    }
    
    getAverage() {
        if (this.grades.length === 0) return 0;
        const sum = this.grades.reduce((total, grade) => total + grade, 0);
        return (sum / this.grades.length).toFixed(1);
    }
    
    getLetterGrade() {
        const avg = parseFloat(this.getAverage());
        if (avg >= 90) return 'A';
        if (avg >= 80) return 'B';
        if (avg >= 70) return 'C';
        if (avg >= 60) return 'D';
        return 'F';
    }
    
    getStatus() {
        return this.getLetterGrade() !== 'F' ? 'Passing' : 'Needs Improvement';
    }
}

// Pet Management System Implementation
class Animal {
    constructor(name, age) {
        this.name = name;
        this.age = age;
        this.happiness = 50;
        this.hunger = 50;
    }
    
    makeSound() {
        return 'Some animal sound';
    }
    
    feed() {
        this.hunger = Math.max(0, this.hunger - 30);
        this.happiness = Math.min(100, this.happiness + 10);
        return `${this.name} has been fed!`;
    }
    
    getInfo() {
        return `${this.name} (${this.age} years old) - Happiness: ${this.happiness}%, Hunger: ${this.hunger}%`;
    }
}

class Dog extends Animal {
    constructor(name, age) {
        super(name, age);
        this.breed = 'Mixed';
    }
    
    makeSound() {
        return `${this.name} barks: Woof! Woof!`;
    }
    
    play() {
        this.happiness = Math.min(100, this.happiness + 20);
        return `${this.name} plays fetch and wags tail happily!`;
    }
}

class Cat extends Animal {
    constructor(name, age) {
        super(name, age);
        this.lives = 9;
    }
    
    makeSound() {
        return `${this.name} meows: Meow! Meow!`;
    }
    
    nap() {
        this.happiness = Math.min(100, this.happiness + 15);
        return `${this.name} takes a cozy nap in the sunlight.`;
    }
}

class Bird extends Animal {
    constructor(name, age) {
        super(name, age);
        this.canFly = true;
    }
    
    makeSound() {
        return `${this.name} chirps: Tweet! Tweet!`;
    }
    
    sing() {
        this.happiness = Math.min(100, this.happiness + 25);
        return `${this.name} sings a beautiful melody!`;
    }
}

// Basic Library System Implementation
class Book {
    constructor(title, author, isbn) {
        this.title = title;
        this.author = author;
        this.isbn = isbn;
        this.isAvailable = true;
        this.borrowedBy = null;
        this.dateAdded = new Date().toLocaleDateString();
    }
    
    borrow(borrowerName) {
        if (this.isAvailable) {
            this.isAvailable = false;
            this.borrowedBy = borrowerName;
            return `${this.title} has been borrowed by ${borrowerName}`;
        }
        return `${this.title} is not available`;
    }
    
    returnBook() {
        if (!this.isAvailable) {
            const borrower = this.borrowedBy;
            this.isAvailable = true;
            this.borrowedBy = null;
            return `${this.title} has been returned by ${borrower}`;
        }
        return `${this.title} was not borrowed`;
    }
    
    getInfo() {
        const status = this.isAvailable ? 'Available' : `Borrowed by ${this.borrowedBy}`;
        return `"${this.title}" by ${this.author} (${this.isbn}) - ${status}`;
    }
}

class Library {
    constructor() {
        this.books = [];
        this.nextId = 1;
    }
    
    addBook(title, author, isbn) {
        const book = new Book(title, author, isbn);
        book.id = this.nextId++;
        this.books.push(book);
        return book;
    }
    
    findBook(searchTerm) {
        return this.books.filter(book => 
            book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.isbn.includes(searchTerm)
        );
    }
    
    getAllBooks() {
        return this.books;
    }
    
    removeBook(isbn) {
        this.books = this.books.filter(book => book.isbn !== isbn);
    }
}

// Initialize library instance
const librarySystem = new Library();

// Page load complete - all playground elements ready
console.log('Java OOP Learning Showcase with Projects loaded successfully! 🚀');

// Mobile navigation functions
function toggleMobileMenu() {
    const navMenu = document.getElementById('nav-menu');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    
    navMenu.classList.toggle('active');
    menuBtn.classList.toggle('active');
    
    // Change icon
    const icon = menuBtn.querySelector('i');
    if (navMenu.classList.contains('active')) {
        icon.className = 'fas fa-times';
    } else {
        icon.className = 'fas fa-bars';
    }
}

function closeMobileMenu() {
    const navMenu = document.getElementById('nav-menu');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const icon = menuBtn.querySelector('i');
    
    navMenu.classList.remove('active');
    menuBtn.classList.remove('active');
    icon.className = 'fas fa-bars';
}

function initializeMobileMenu() {
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        const navMenu = document.getElementById('nav-menu');
        const menuBtn = document.querySelector('.mobile-menu-btn');
        
        if (!navMenu.contains(e.target) && !menuBtn.contains(e.target)) {
            closeMobileMenu();
        }
    });
    
    // Close mobile menu on window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeMobileMenu();
        }
    });
    
    // Touch event handling for mobile devices
    let touchStartY = 0;
    document.addEventListener('touchstart', function(e) {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchmove', function(e) {
        const touchY = e.touches[0].clientY;
        const navMenu = document.getElementById('nav-menu');
        
        // Close menu on upward swipe when menu is open
        if (navMenu.classList.contains('active') && touchY < touchStartY - 100) {
            closeMobileMenu();
        }
    }, { passive: true });
}

// Add keyboard shortcuts for better interactivity
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to run code in playground
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (document.getElementById('code-editor') === document.activeElement) {
            e.preventDefault();
            runCode();
        }
    }
    
    // Escape to clear outputs
    if (e.key === 'Escape') {
        if (document.activeElement.closest('.playground-container')) {
            clearOutput();
        }
        // Also close mobile menu on escape
        closeMobileMenu();
    }
});

// ===== SIMPLE TEXT-BASED GAME FUNCTIONS =====
function createCharacter(type) {
    const names = {
        warrior: 'Thorin',
        mage: 'Gandalf',
        archer: 'Legolas'
    };
    
    const name = names[type];
    
    switch(type) {
        case 'warrior':
            gameCharacter = new Warrior(name);
            break;
        case 'mage':
            gameCharacter = new Mage(name);
            break;
        case 'archer':
            gameCharacter = new Archer(name);
            break;
    }
    
    // Reset game state
    gameState.playerHealth = 100;
    gameState.enemyHealth = 100;
    gameState.round = 1;
    
    updateGameDisplay();
    document.getElementById('game-actions').style.display = 'flex';
}

function updateGameDisplay() {
    const statusElement = document.getElementById('game-status');
    if (gameCharacter) {
        statusElement.innerHTML = `
            <div style="font-family: 'JetBrains Mono', monospace;">
                <h4 style="color: #007396; margin-bottom: 1rem;">⚔️ Battle Arena - Round ${gameState.round}</h4>
                <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                    <div>
                        <strong>${gameCharacter.name} the ${gameCharacter.type}</strong><br>
                        Health: ${gameState.playerHealth}/100 💚
                    </div>
                    <div>
                        <strong>Enemy Orc</strong><br>
                        Health: ${gameState.enemyHealth}/100 ❤️
                    </div>
                </div>
                <div id="battle-log" style="background: rgba(0,115,150,0.1); padding: 1rem; border-radius: 6px; min-height: 80px; font-size: 0.85rem;">
                    Welcome to battle, ${gameCharacter.name}! Choose your action.
                </div>
            </div>
        `;
    }
}

function attack() {
    if (!gameCharacter) return;
    
    const battleLog = document.getElementById('battle-log');
    let logText = '';
    
    // Player attacks
    const playerAttack = gameCharacter.attack();
    const playerDamage = Math.floor(Math.random() * 25) + 10;
    gameState.enemyHealth = Math.max(0, gameState.enemyHealth - playerDamage);
    
    logText += `${playerAttack}\n`;
    logText += `Enemy takes ${playerDamage} damage!\n\n`;
    
    if (gameState.enemyHealth <= 0) {
        logText += `🎉 Victory! You defeated the orc!\n`;
        logText += `// Learning: Used inheritance - ${gameCharacter.type} extends Player class!`;
        battleLog.innerHTML = logText.replace(/\n/g, '<br>');
        return;
    }
    
    // Enemy attacks back
    const enemyDamage = Math.floor(Math.random() * 20) + 8;
    gameState.playerHealth = Math.max(0, gameState.playerHealth - enemyDamage);
    
    logText += `Orc strikes back for ${enemyDamage} damage!\n`;
    
    if (gameState.playerHealth <= 0) {
        logText += `💀 Defeat! You have been slain!\n`;
        logText += `// Try again - that's how we learn!`;
    } else {
        logText += `// Polymorphism in action: Same attack() method, different behavior!`;
    }
    
    battleLog.innerHTML = logText.replace(/\n/g, '<br>');
    gameState.round++;
    updateGameDisplay();
}

function defend() {
    if (!gameCharacter) return;
    
    const battleLog = document.getElementById('battle-log');
    const defendAction = gameCharacter.defend();
    
    // Reduced damage when defending
    const enemyDamage = Math.floor(Math.random() * 10) + 3;
    gameState.playerHealth = Math.max(0, gameState.playerHealth - enemyDamage);
    
    let logText = `${defendAction}\n`;
    logText += `Orc attacks but damage is reduced to ${enemyDamage}!\n`;
    logText += `// Method overriding: Each class has unique defend() behavior!`;
    
    battleLog.innerHTML = logText.replace(/\n/g, '<br>');
    gameState.round++;
    updateGameDisplay();
}

function heal() {
    if (!gameCharacter) return;
    
    const battleLog = document.getElementById('battle-log');
    const healAction = gameCharacter.heal();
    gameState.playerHealth = Math.min(100, gameState.playerHealth + 25);
    
    // Enemy still attacks
    const enemyDamage = Math.floor(Math.random() * 15) + 5;
    gameState.playerHealth = Math.max(0, gameState.playerHealth - enemyDamage);
    
    let logText = `${healAction}\n`;
    logText += `Orc attacks while you heal for ${enemyDamage} damage!\n`;
    logText += `// Inheritance: heal() method inherited from Player class!`;
    
    battleLog.innerHTML = logText.replace(/\n/g, '<br>');
    gameState.round++;
    updateGameDisplay();
}

function resetGame() {
    gameCharacter = null;
    document.getElementById('game-actions').style.display = 'none';
    document.getElementById('game-status').innerHTML = '<p>Welcome to my first OOP game! Select a character to start.</p>';
}

// ===== STUDENT GRADE CALCULATOR FUNCTIONS =====
function addStudent() {
    const name = document.getElementById('student-name').value.trim();
    const grade1 = parseFloat(document.getElementById('grade-1').value);
    const grade2 = parseFloat(document.getElementById('grade-2').value);
    const grade3 = parseFloat(document.getElementById('grade-3').value);
    
    if (!name) {
        alert('Please enter a student name!');
        return;
    }
    
    if (isNaN(grade1) || isNaN(grade2) || isNaN(grade3)) {
        alert('Please enter all three grades!');
        return;
    }
    
    // Create new student (encapsulation in action!)
    const student = new Student(name);
    student.addGrade(grade1);
    student.addGrade(grade2);
    student.addGrade(grade3);
    
    students.push(student);
    updateStudentDisplay();
    
    // Clear form
    document.getElementById('student-name').value = '';
    document.getElementById('grade-1').value = '';
    document.getElementById('grade-2').value = '';
    document.getElementById('grade-3').value = '';
}

function updateStudentDisplay() {
    const displayElement = document.getElementById('students-list');
    
    if (students.length === 0) {
        displayElement.innerHTML = '<p>No students added yet. Add a student to see encapsulation in action!</p>';
        return;
    }
    
    let html = '';
    students.forEach((student, index) => {
        html += `
            <div class="student-record">
                <strong>${student.name}</strong><br>
                Grades: [${student.grades.join(', ')}]<br>
                Average: ${student.getAverage()}% (${student.getLetterGrade()})<br>
                Status: <span style="color: ${student.getStatus() === 'Passing' ? '#10b981' : '#ef4444'};">${student.getStatus()}</span><br>
                <small style="color: #a0a9c0;">// Private grades array accessed through public methods (encapsulation!)</small>
            </div>
        `;
    });
    
    displayElement.innerHTML = html;
}

// ===== PET MANAGEMENT SYSTEM FUNCTIONS =====
function addPet() {
    const type = document.getElementById('pet-type').value;
    const name = document.getElementById('pet-name').value.trim();
    const age = parseInt(document.getElementById('pet-age').value);
    
    if (!name) {
        alert('Please enter a pet name!');
        return;
    }
    
    if (isNaN(age) || age < 0) {
        alert('Please enter a valid age!');
        return;
    }
    
    let pet;
    switch(type) {
        case 'dog':
            pet = new Dog(name, age);
            break;
        case 'cat':
            pet = new Cat(name, age);
            break;
        case 'bird':
            pet = new Bird(name, age);
            break;
    }
    
    pets.push(pet);
    updatePetDisplay();
    
    // Clear form
    document.getElementById('pet-name').value = '';
    document.getElementById('pet-age').value = '';
}

function feedAllPets() {
    if (pets.length === 0) {
        alert('No pets to feed! Add some pets first.');
        return;
    }
    
    pets.forEach(pet => pet.feed());
    updatePetDisplay();
}

function makeAllSounds() {
    if (pets.length === 0) {
        alert('No pets to make sounds! Add some pets first.');
        return;
    }
    
    const displayElement = document.getElementById('pets-display');
    let soundsHtml = '<div style="background: rgba(248,152,32,0.1); padding: 1rem; border-radius: 6px; margin-bottom: 1rem;"><strong>🔊 Pet Sounds (Polymorphism!):</strong><br>';
    
    pets.forEach(pet => {
        soundsHtml += `${pet.makeSound()}<br>`;
    });
    
    soundsHtml += '<small style="color: #a0a9c0;">// Same makeSound() method, different implementations!</small></div>';
    
    let petsHtml = '';
    pets.forEach((pet, index) => {
        petsHtml += `
            <div class="pet-item">
                <strong>${pet.name}</strong> (${pet.constructor.name})<br>
                ${pet.getInfo()}<br>
                <small style="color: #a0a9c0;">// ${pet.constructor.name} extends Animal class (inheritance!)</small>
            </div>
        `;
    });
    
    displayElement.innerHTML = soundsHtml + petsHtml;
}

function updatePetDisplay() {
    const displayElement = document.getElementById('pets-display');
    
    if (pets.length === 0) {
        displayElement.innerHTML = '<p>No pets yet! Add some pets to see inheritance and polymorphism working.</p>';
        return;
    }
    
    let html = '';
    pets.forEach((pet, index) => {
        html += `
            <div class="pet-item">
                <strong>${pet.name}</strong> (${pet.constructor.name})<br>
                ${pet.getInfo()}<br>
                <small style="color: #a0a9c0;">// ${pet.constructor.name} extends Animal class (inheritance!)</small>
            </div>
        `;
    });
    
    displayElement.innerHTML = html;
}

function clearPets() {
    pets = [];
    updatePetDisplay();
}

// ===== BASIC LIBRARY SYSTEM FUNCTIONS =====
function addBook() {
    const title = document.getElementById('book-title').value.trim();
    const author = document.getElementById('book-author').value.trim();
    const isbn = document.getElementById('book-isbn').value.trim();
    
    if (!title || !author || !isbn) {
        alert('Please fill in all book details!');
        return;
    }
    
    // Check if ISBN already exists
    if (librarySystem.findBook(isbn).length > 0) {
        alert('A book with this ISBN already exists!');
        return;
    }
    
    const book = librarySystem.addBook(title, author, isbn);
    updateLibraryDisplay();
    
    // Clear form
    document.getElementById('book-title').value = '';
    document.getElementById('book-author').value = '';
    document.getElementById('book-isbn').value = '';
    
    // Show success message
    const displayElement = document.getElementById('books-list');
    const successMsg = document.createElement('div');
    successMsg.style.cssText = 'background: rgba(16,185,129,0.2); padding: 0.5rem; border-radius: 4px; margin-bottom: 1rem; color: #10b981;';
    successMsg.innerHTML = `✅ Added "${title}" to library! (Book class instantiated)`;
    displayElement.insertBefore(successMsg, displayElement.firstChild);
    
    setTimeout(() => {
        if (successMsg.parentElement) {
            successMsg.remove();
        }
    }, 3000);
}

function searchBooks() {
    const searchTerm = prompt('Enter search term (title, author, or ISBN):');
    if (!searchTerm) return;
    
    const results = librarySystem.findBook(searchTerm);
    const displayElement = document.getElementById('books-list');
    
    if (results.length === 0) {
        displayElement.innerHTML = `<p style="color: #f59e0b;">No books found for "${searchTerm}"</p>`;
        setTimeout(() => updateLibraryDisplay(), 3000);
        return;
    }
    
    let html = `<div style="background: rgba(0,115,150,0.1); padding: 1rem; border-radius: 6px; margin-bottom: 1rem;">
                <strong>🔍 Search Results for "${searchTerm}" (${results.length} found):</strong><br><br>`;
    
    results.forEach(book => {
        html += `<div class="book-item">${book.getInfo()}</div>`;
    });
    
    html += '<small style="color: #a0a9c0;">// Using findBook() method - demonstrating class relationships!</small></div>';
    
    displayElement.innerHTML = html;
    
    setTimeout(() => updateLibraryDisplay(), 5000);
}

function showAllBooks() {
    updateLibraryDisplay();
}

function updateLibraryDisplay() {
    const displayElement = document.getElementById('books-list');
    const allBooks = librarySystem.getAllBooks();
    
    if (allBooks.length === 0) {
        displayElement.innerHTML = '<p>Library is empty. Add some books to get started!</p>';
        return;
    }
    
    let html = `<div style="margin-bottom: 1rem;"><strong>📚 Library Catalog (${allBooks.length} books):</strong></div>`;
    
    allBooks.forEach(book => {
        html += `<div class="book-item">${book.getInfo()}</div>`;
    });
    
    html += '<div style="margin-top: 1rem; font-size: 0.8rem; color: #a0a9c0;">// Each book is an instance of the Book class with encapsulated properties!</div>';
    
    displayElement.innerHTML = html;
}

function clearLibrary() {
    if (librarySystem.getAllBooks().length === 0) {
        alert('Library is already empty!');
        return;
    }
    
    if (confirm('Are you sure you want to clear all books from the library?')) {
        librarySystem.books = [];
        librarySystem.nextId = 1;
        updateLibraryDisplay();
    }
}