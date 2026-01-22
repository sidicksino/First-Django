document.addEventListener('DOMContentLoaded', () => {
    initScrollEffects();
    initFilters();
    initTiltEffect();
});

/**
 * Parallax and Scroll Reveal Effects
 */
function initScrollEffects() {
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const cards = document.querySelectorAll('.news-card');
    
    // Initial entrance animations
    if (heroTitle) {
        heroTitle.style.opacity = '0';
        heroTitle.style.transform = 'translateY(30px)';
        setTimeout(() => {
            heroTitle.style.transition = 'all 1s ease';
            heroTitle.style.opacity = '1';
            heroTitle.style.transform = 'translateY(0)';
        }, 300);
    }
    
    // Scroll observer for cards
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        card.style.transition = `all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${index * 0.1}s`; // Staggered delay
        observer.observe(card);
    });
}

/**
 * Filter System Logic
 */
function initFilters() {
    const pills = document.querySelectorAll('.pill');
    
    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            // Remove active class from all
            pills.forEach(p => p.classList.remove('active'));
            // Add active to clicked
            pill.classList.add('active');
            
            // In a real implementation with client-side filtering, we would filter here.
            // Since we are server-side rendering, we might reload the page with a query param
            // or fetch via API. For this demo, we'll just show the UI state change.
            console.log(`Filtering by category: ${pill.innerText}`);
        });
    });
}

/**
 * Vanilla JS Tilt Effect for Cards
 * Adds a subtle 3D tilt based on mouse position
 */
function initTiltEffect() {
    const cards = document.querySelectorAll('.news-card'); // Apply only to specific elements if performance is concern
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -5; // Max rotation deg
            const rotateY = ((x - centerX) / centerX) * 5;
            
            // Apply transformation
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            card.style.transition = 'transform 0.5s ease';
        });
        
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'none'; // Remove transition for smooth mouse following
        });
    });
}
