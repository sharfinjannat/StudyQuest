// SPA Section Switching
function showSection(sectionName) {
    console.log('=== showSection called with:', sectionName);
    
    // Prevent default link behavior
    if (event) {
        event.preventDefault();
    }
    
    const studentView = document.getElementById('app-view-student');
    const adminView = document.getElementById('app-view-admin');
    
    console.log('studentView found:', !!studentView);
    console.log('adminView found:', !!adminView);
    
    // Hide admin view if showing student
    if (sectionName === 'student') {
        console.log('Switching to student view');
        if (adminView) adminView.classList.add('hidden');
        
        // Show main content area
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.display = 'block';
        }
    } else if (sectionName === 'admin') {
        console.log('Switching to admin view');
        if (studentView) studentView.classList.add('hidden');
        if (adminView) adminView.classList.remove('hidden');
        
        // Hide main content area when showing admin
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.display = 'none';
        }
        
        // Show dashboard immediately when admin opens
        console.log('Calling showAdminSection with dashboard');
        showAdminSection('dashboard');
    } else {
        // For upload, bookmarks, etc., show student view with a notification
        console.log('Showing student view with notification for:', sectionName);
        if (studentView) studentView.classList.remove('hidden');
        showNotification(`${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)} section coming soon!`, 'info');
    }
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    if (event && event.target) {
        event.target.classList.add('active');
    }
}

// Semester Selection
function selectSemester(semesterNumber) {
    console.log('Selected semester:', semesterNumber);
    showNotification(`Semester ${semesterNumber} selected`, 'success');
}

// Department Selection
function selectDepartment(departmentName) {
    console.log('Selected department:', departmentName);
    
    // Hide all content sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('hidden');
        section.classList.remove('active');
    });
    
    // Show semester section
    const semesterSection = document.getElementById('semester-section');
    if (semesterSection) {
        semesterSection.classList.remove('hidden');
        semesterSection.classList.add('active');
    }
    
    // Update department name in semester section
    const currentDeptElement = document.getElementById('current-department');
    const semesterTitleElement = document.getElementById('semester-title');
    
    if (currentDeptElement) {
        currentDeptElement.textContent = departmentName;
    }
    
    if (semesterTitleElement) {
        const deptFullNames = {
            'CSE': 'Computer Science & Engineering (CSE)',
            'ICT': 'Information & Communication Technology (ICT)',
            'DBA': 'Department of Business Administration (DBA)'
        };
        semesterTitleElement.textContent = deptFullNames[departmentName] || departmentName;
    }
    
    showNotification(`${departmentName} department selected!`, 'success');
}

// Breadcrumb Navigation
function goToHome() {
    // Hide admin view
    const adminView = document.getElementById('app-view-admin');
    if (adminView) {
        adminView.classList.add('hidden');
    }
    
    // Show main content area
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.style.display = 'block';
    }
    
    // Hide all content sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('hidden');
        section.classList.remove('active');
    });
    
    // Show student section
    const studentSection = document.getElementById('student-section');
    if (studentSection) {
        studentSection.classList.remove('hidden');
        studentSection.classList.add('active');
    }
}

function goToDepartments() {
    // Same as going home since departments are in the home section
    goToHome();
}

// Admin Section Navigation
function showAdminSection(sectionName) {
    console.log('Showing admin section:', sectionName);
    
    // Prevent default link behavior
    if (event) {
        event.preventDefault();
    }
    
    // Hide all admin sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.add('hidden');
        section.classList.remove('active');
    });
    
    // Show the requested admin section
    const targetSection = document.getElementById(`admin-${sectionName}`);
    console.log('Target section found:', !!targetSection);
    
    if (targetSection) {
        targetSection.classList.remove('hidden');
        targetSection.classList.add('active');
        console.log('Section activated:', sectionName);
    } else {
        console.log('Section not found, defaulting to dashboard');
        // Default to dashboard if section not found
        const dashboardSection = document.getElementById('admin-dashboard');
        if (dashboardSection) {
            dashboardSection.classList.remove('hidden');
            dashboardSection.classList.add('active');
        }
    }
    
    // Update active nav link
    document.querySelectorAll('.admin-nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    if (event && event.target) {
        event.target.classList.add('active');
    }
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('open');
}

// Show Notification
function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 12px;
        color: white;
        font-weight: 500;
        z-index: 2000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    `;
    
    // Set background color based on type
    switch(type) {
        case 'success':
            notification.style.background = '#80CBC4';
            break;
        case 'error':
            notification.style.background = '#F48FB1';
            break;
        default:
            notification.style.background = 'linear-gradient(to right, #9FA8DA, #7986CB)';
    }
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            // Skip empty href attributes
            if (href && href !== '#') {
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    
    // Handle window resize
    window.addEventListener('resize', function() {
        const toggleBtn = document.querySelector('.mobile-menu-toggle');
        
        if (window.innerWidth > 768) {
            // Close mobile menu on desktop
            document.querySelector('.sidebar').classList.remove('open');
            
            // Remove mobile toggle button if it exists
            if (toggleBtn) {
                document.body.removeChild(toggleBtn);
            }
        }
    });
});

// Add initial styles for hero title animation
const heroStyles = document.createElement('style');
heroStyles.textContent = `
    .hero-title {
        opacity: 1;
        transform: translateY(0);
        transition: all 0.8s ease;
    }
`;
document.head.appendChild(heroStyles);
