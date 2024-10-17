document.addEventListener('DOMContentLoaded', function () {
    // Hero Button Animation
    const heroButton = document.querySelector('.hero-button');
    if (heroButton) {
        heroButton.addEventListener('mouseover', () => {
            heroButton.classList.add('pulse');
        });
        heroButton.addEventListener('mouseout', () => {
            heroButton.classList.remove('pulse');
        });
    }

    // Nav Link Smooth Scroll
    const navLinks = document.querySelectorAll('.nav-link');
    const navBar = document.getElementById('nav-bar');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector(link.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
            // Close menu after clicking link on mobile
            if (navBar) {
                navBar.classList.remove('open');
            }
        });
    });

    // Animated Cards
    const animatedCards = document.querySelectorAll('.animated-card');
    window.addEventListener('scroll', () => {
        animatedCards.forEach(card => {
            const cardPosition = card.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            if (cardPosition < windowHeight - 100) {
                card.classList.add('visible');
            }
        });
    });

    // Gallery Image Hover Animation
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
        item.addEventListener('mouseover', () => {
            item.classList.add('hovered');
        });
        item.addEventListener('mouseout', () => {
            item.classList.remove('hovered');
        });
    });

    // Testimonials Carousel (Auto Rotate)
    let currentTestimonial = 0;
    const testimonials = document.querySelectorAll('.testimonial');
    function rotateTestimonials() {
        testimonials[currentTestimonial].classList.remove('visible');
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
        testimonials[currentTestimonial].classList.add('visible');
    }
    setInterval(rotateTestimonials, 5000);

    // Contact Form Submission Alert
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Obrigado por entrar em contato! Nós responderemos em breve.');
            contactForm.reset();
        });
    }

    // Hamburger Menu Toggle
    const hamburgerMenu = document.getElementById('hamburger-menu');
    if (hamburgerMenu && navBar) {
        hamburgerMenu.addEventListener('click', () => {
            navBar.classList.toggle('open');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navBar.contains(e.target) && !hamburgerMenu.contains(e.target)) {
                navBar.classList.remove('open');
            }
        });
    }
});


document.getElementById('whatsapp-form').addEventListener('submit', function (e) {
    e.preventDefault(); // Impede o envio normal do formulário

    const name = document.getElementById('name').value;
    const message = document.getElementById('message').value;
    const phone = '5521982281955'; // Número com DDI +55 para Brasil

    // Formatar a mensagem para ser usada na URL
    const whatsappMessage = `Olá, meu nome é ${encodeURIComponent(name)}. ${encodeURIComponent(message)}`;

    // Montar a URL do WhatsApp
    const whatsappURL = `https://api.whatsapp.com/send?phone=${phone}&text=${whatsappMessage}`;

    // Redirecionar para o WhatsApp
    window.open(whatsappURL, '_blank');
});
