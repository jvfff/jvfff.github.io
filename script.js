document.getElementById('contactForm').addEventListener('submit', function(event) {
    event.preventDefault(); 

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    if (name === '' || email === '' || message === '') {
        document.getElementById('formStatus').textContent = 'Por favor, preencha todos os campos.';
        document.getElementById('formStatus').style.color = 'red';
    } else {
        const phoneNumber = "+5521995733103"; 

        const textMessage = `Nome: ${name}\nEmail: ${email}\nMensagem: ${message}`;

        const encodedMessage = encodeURIComponent(textMessage);

        const whatsappURL = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;

        window.open(whatsappURL, '_blank');

        document.getElementById('contactForm').reset();
        document.getElementById('formStatus').textContent = 'Mensagem enviada via WhatsApp!';
        document.getElementById('formStatus').style.color = 'green';
    }
});
