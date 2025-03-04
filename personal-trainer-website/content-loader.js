const pageContents = {
    'featured-programs': {
        title: 'Featured Fitness Programs',
        heading: 'Our Top Recommended Programs',
        content: [
            'Comprehensive weight loss tracks',
            'Muscle building progressions',
            'Endurance and performance enhancement',
            'Personalized program matching',
            'Evidence-based training methodologies'
        ]
    },
    'success-stories': {
        title: 'Client Transformation Stories',
        heading: 'Real Results, Real People',
        content: [
            'Verified client transformations',
            'Before and after testimonials',
            'Diverse fitness journey examples',
            'Psychological and physical transformations',
            'Motivational progress narratives'
        ]
    },
    // HOME SECTION
    'home': {
        title: 'Personal Fitness Journey',
        content: [
            'Comprehensive fitness transformation platform',
            'Personalized training approaches',
            'Holistic wellness methodology',
            'Expert guidance from certified professionals',
            'Cutting-edge fitness and nutrition strategies'
        ]
    },

    // ABOUT SECTION
    'my-story': {
        title: 'Trainer\'s Personal Journey',
        content: [
            'Origins of passion for fitness',
            'Personal fitness challenges overcome',
            'Professional development milestones',
            'Motivation behind becoming a personal trainer',
            'Core training philosophy development'
        ]
    },
    'philosophy': {
        title: 'Training Philosophy',
        content: [
            'Holistic approach to fitness',
            'Mind-body connection principles',
            'Personalized transformation strategies',
            'Evidence-based training methodologies',
            'Psychological aspects of fitness journey'
        ]
    },
    'fitness-credentials': {
        title: 'Fitness Professional Credentials',
        content: [
            'Nationally recognized certifications',
            'Specialized training qualifications',
            'Continuous professional development',
            'Advanced fitness assessment techniques',
            'Specialized training modalities'
        ]
    },

    // SERVICES SECTION
    'in-person-sessions': {
        title: 'One-on-One In-Person Training',
        content: [
            'Personalized fitness assessment',
            'Customized workout development',
            'Real-time form correction',
            'Immediate feedback and motivation',
            'Adaptive training techniques',
            'Progress tracking and adjustment'
        ]
    },
    'virtual-sessions': {
        title: 'Virtual Personal Training',
        content: [
            'Comprehensive online fitness coaching',
            'Video-based technique analysis',
            'Remote workout programming',
            'Digital progress tracking',
            'Flexible scheduling',
            'Interactive nutrition guidance'
        ]
    },

    // TOOLS SECTION
    'weight-tracker': {
        title: 'Weight Tracking System',
        content: [
            'Digital weight logging',
            'Graphical progress visualization',
            'Historical data preservation',
            'Goal setting and tracking',
            'Privacy-protected personal metrics',
            'Integration with nutrition plans'
        ]
    },
    'macro-calculator': {
        title: 'Nutritional Macro Calculator',
        content: [
            'Personalized macro nutrient breakdown',
            'Goal-specific calculations',
            'Dietary preference accommodations',
            'Real-time nutrient tracking',
            'Customizable macronutrient goals',
            'Detailed nutritional insights'
        ]
    },
    'bodyweight-exercises': {
        title: 'Bodyweight Exercise Library',
        content: [
            'Comprehensive exercise demonstrations',
            'Difficulty level categorization',
            'Muscle group targeting',
            'Progressive difficulty options',
            'Form correction guidance',
            'No-equipment workout strategies'
        ]
    },

    // PROGRAMS SECTION
    'weight-loss-beginner': {
        title: 'Beginner Weight Loss Program',
        content: [
            'Foundational fitness assessment',
            'Gradual intensity progression',
            'Nutritional education',
            'Motivational support system',
            'Low-impact exercise strategies',
            'Psychological wellness integration'
        ]
    },
    'muscle-building-hypertrophy': {
        title: 'Hypertrophy Muscle Building Program',
        content: [
            'Scientific muscle growth principles',
            'Periodized training approach',
            'Nutrition for muscle development',
            'Recovery and growth strategies',
            'Detailed exercise progression',
            'Supplement optimization'
        ]
    },

    // BLOG SECTION
    'training-technique-advice': {
        title: 'Advanced Training Techniques',
        content: [
            'Proper exercise form fundamentals',
            'Common movement pattern corrections',
            'Injury prevention strategies',
            'Performance optimization techniques',
            'Scientific training principles',
            'Expert-level exercise insights'
        ]
    },
    'nutrition-meal-planning': {
        title: 'Comprehensive Meal Planning Guide',
        content: [
            'Nutritional balance strategies',
            'Meal prep efficiency techniques',
            'Goal-specific dietary approaches',
            'Macronutrient optimization',
            'Budget-friendly nutrition planning',
            'Sustainable eating habits'
        ]
    },

    // CONTACT SECTION
    'initial-consultation': {
        title: 'Initial Fitness Consultation',
        content: [
            'Comprehensive fitness assessment',
            'Goal setting session',
            'Personalized strategy development',
            'Health history review',
            'Fitness and nutrition baseline establishment',
            'Customized recommendation framework'
        ]
    },
    // More page contents would be added here, mirroring the full menu structure
};

document.addEventListener('DOMContentLoaded', () => {
    const pageName = window.location.pathname.split('/').pop().replace('.html', '');
    const pageData = pageContents[pageName];

    if (pageData) {
        document.title = pageData.title;
        document.getElementById('main-heading').textContent = pageData.heading;
        
        const contentDiv = document.getElementById('page-content');
        contentDiv.innerHTML = `
            <ul>
                ${pageData.content.map(item => `<li>${item}</li>`).join('')}
            </ul>
        `;
    }
});