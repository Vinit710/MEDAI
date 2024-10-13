const toggleThemeButton = document.getElementById('toggleTheme');
const body = document.body;

toggleThemeButton.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const chatContent = document.querySelector('.chat-content');
    const chatHistory = document.querySelector('.chat-history');
    const messages = document.querySelectorAll('.message');
    const navbar = document.querySelector('.navbar');
    const historyList = document.getElementById("history-list");
    const toolsContainerLinks = document.querySelectorAll('.tools-container a');
    const containerFluid = document.querySelector(".container-fluid");
    const container = document.querySelector(".container");
    const aboutContainer = document.querySelector(".about-container");

    navbar.classList.toggle('dark-mode');
    chatContent.classList.toggle('dark-mode');
    chatHistory.classList.toggle('dark-mode');
    historyList.classList.toggle('dark-mode');
    containerFluid.classList.toggle('dark-mode');
    container.classList.toggle('dark-mode');
    aboutContainer.classList.toggle('dark-mode');

    messages.forEach(message => message.classList.toggle('dark-mode'));
    toolsContainerLinks.forEach(link => link.classList.toggle('dark-mode'));

    // Alternar entre los iconos de sol y luna
    const icon = toggleThemeButton.querySelector('i');
    if (body.classList.contains('dark-mode')) {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    } else {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }
});