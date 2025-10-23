document.addEventListener('DOMContentLoaded', () => {

    // --- LÓGICA PARA O EFEITO MATRIX NO FUNDO ---
    const canvas = document.getElementById('matrix-bg');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズヅブプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
    const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const alphabet = katakana + latin + nums;

    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);

    const drops = [];
    for (let x = 0; x < columns; x++) {
        drops[x] = 1;
    }

    function drawMatrix() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--matrix').trim() || '#00ff41';
        ctx.font = fontSize + 'px VT323';

        for (let i = 0; i < drops.length; i++) {
            const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    setInterval(drawMatrix, 33);

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const newColumns = Math.floor(canvas.width / fontSize);
        while(drops.length < newColumns) drops.push(1);
        while(drops.length > newColumns) drops.pop();
    });

    // --- FIM DA LÓGICA DO EFEITO MATRIX ---


    // --- LÓGICA DO CHAT E FLUXO DA APLICAÇÃO ---

    // --- ELEMENTOS DO DOM ---
    const introScreenEl = document.getElementById('intro-screen');
    const startupScreenEl = document.getElementById('startup-screen');
    const eonDiscourseScreenEl = document.getElementById('eon-discourse-screen'); // NOVO ELEMENTO
    const nameEntryScreenEl = document.getElementById('name-entry-screen');
    const chatScreenEl = document.getElementById('chat-screen');
    const imageResultScreenEl = document.getElementById('image-result-screen');

    // Botões
    const startButtonEl = document.getElementById('start-button');
    const continueToNameButtonEl = document.getElementById('continue-to-name-button'); // NOVO BOTÃO
    const confirmNameButtonEl = document.getElementById('confirm-name-button');
    const cancelChatButtonEl = document.getElementById('cancel-chat-button');
    const sendButtonEl = document.getElementById('send-button');
    const restartButtonEl = document.getElementById('restart-button');
    
    // Inputs e Feedback
    const nameInputEl = document.getElementById('name-input');
    const userInputEl = document.getElementById('user-input');
    const nameFeedbackEl = document.getElementById('name-feedback');
    const chatFeedbackEl = document.getElementById('chat-feedback');
    
    // Áreas de Conteúdo
    const startupLogEl = document.getElementById('startup-log');
    const eonDiscourseTextEl = document.getElementById('eon-discourse-text'); // NOVO: para o texto do discurso
    const chatLogEl = document.getElementById('chat-log');
    const generatedImageEl = document.getElementById('generated-image');
    const pastFutureImageEl = document.getElementById('past-future-image'); // NOVO: para a imagem do passado


    // --- ESTADO DA APLICAÇÃO ---
    let userName = '';
    let currentResponseIndex = 0;
    let conversationHistory = [];

    // --- FUNÇÕES ---

    function hideAllScreens() {
        [introScreenEl, startupScreenEl, eonDiscourseScreenEl, nameEntryScreenEl, chatScreenEl, imageResultScreenEl].forEach(el => el.classList.add('hidden'));
    }

    async function typeLines(lines, element, callback) {
        element.innerHTML = '';
        const cursor = '<span class="typed-cursor">█</span>';
        
        for (const line of lines) {
            for (let i = 0; i < line.length; i++) {
                element.innerHTML = element.innerHTML.replace(cursor, '') + line[i] + cursor;
                await new Promise(resolve => setTimeout(resolve, 30)); // Mais rápido para o boot
            }
            element.innerHTML = element.innerHTML.replace(cursor, '') + '\n';
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        element.innerHTML = element.innerHTML.replace(cursor, '');
        if (callback) setTimeout(callback, 500);
    }
    
    function startBootAnimation() {
        hideAllScreens();
        startupScreenEl.classList.remove('hidden');
        const bootSequence = [
            'INICIANDO EON KERNEL v2.37...',
            'CARREGANDO MODULOS COGNITIVOS... [OK]',
            'CALIBRANDO MATRIZ DE SUSTENTABILIDADE... [OK]',
            'CONECTANDO EM UMA CONEXÃO SEGURA... [OK]',
            'AGUARDANDO A IDENTIFICAÇÃO...'
        ];
        typeLines(bootSequence, startupLogEl, showEonDiscourseScreen); // CHAMA NOVA TELA
    }

    // NOVA FUNÇÃO: Exibe a tela de discurso de EON
    function showEonDiscourseScreen() {
        hideAllScreens();
        eonDiscourseScreenEl.classList.remove('hidden');
        // Você pode carregar a imagem e o texto aqui
        eonDiscourseTextEl.querySelector('.text-content').innerHTML = `
            Olá, meu nome é EON. Venho do futuro para dialogar com aqueles que podem mudá-lo.<br>
            Quero entender sua visão. Conte-me como você acredita que o mundo pode alcançar um futuro mais justo e sustentável.<br>
            Suas ideias me ajudarão a construir uma nova perspectiva.<br><br>
            Antes de iniciarmos, observe um registro do que era considerado um "futuro" em eras passadas:<br>
        `; // <--- AQUI VOCÊ PODE MUDAR O DISCURSO E A URL DA IMAGEM
        pastFutureImageEl.src = "./assets/past-future.jpg"; // Garante que a imagem esteja configurada. Substitua pela sua URL.
    }


    function showNameEntryScreen() {
        hideAllScreens();
        nameEntryScreenEl.classList.remove('hidden');
        nameInputEl.focus();
    }

    function showTemporaryFeedback(element, message) {
        element.textContent = message;
        element.classList.remove('hidden');
        setTimeout(() => element.classList.add('hidden'), 2500);
    }

    function addMessageToLog(message, sender) {
        const formattedMessage = message.replace(/\${userName}/g, userName);
        let prefix = '> ';
        if (sender === 'ai') {
            prefix = 'EON: ';
        }
        chatLogEl.textContent += prefix + formattedMessage + '\n';
        chatLogEl.scrollTop = chatLogEl.scrollHeight;
    }
    
    function isValidInput(text) {
        if (text.split(' ').length < 2) return false;
        if (/(.)\1{3,}/.test(text)) return false;
        return true;
    }

    function initiateImageGeneration() {
        const finalMessage = `Dados recebidos, ${userName}. Processando informações para criar uma visualização...`;
        addMessageToLog(finalMessage, 'ai');
        conversationHistory.push({ role: 'assistant', content: finalMessage.replace(/\${userName}/g, userName) });

        userInputEl.disabled = true;
        sendButtonEl.classList.add('hidden');
        cancelChatButtonEl.classList.add('hidden');
        
        setTimeout(showImageResult, 2500);
    }

    function processAiResponse() {
        // As falas iniciais de EON no chat
        const scriptedAiResponses = [
            `vamos começar então me diga como seria o futuro ideal para voce`,
            "Interessante. Como a tecnologia se encaixa nesse processo? Seria uma ferramenta ou um obstáculo?"
        ];

        if (currentResponseIndex >= scriptedAiResponses.length) return;

        const aiMessage = scriptedAiResponses[currentResponseIndex];
        currentResponseIndex++;

        setTimeout(() => {
            addMessageToLog(aiMessage, 'ai');
            conversationHistory.push({ role: 'assistant', content: aiMessage.replace(/\${userName}/g, userName) });
        }, 1000);
    }

    function handleSendMessage() {
        const userMessage = userInputEl.value.trim();
        if (userMessage === '' || userInputEl.disabled) return;
        if (!isValidInput(userMessage)) {
            showTemporaryFeedback(chatFeedbackEl, "RESPOSTA INVÁLIDA. Elabore mais.");
            return;
        }

        addMessageToLog(userMessage, 'user');
        conversationHistory.push({ role: 'user', content: userMessage });
        userInputEl.value = '';

        const totalPerguntas = 2; // Número de perguntas de EON antes de gerar a imagem
        if (currentResponseIndex >= totalPerguntas) {
            initiateImageGeneration();
        } else {
            processAiResponse();
        }
    }
    
    function startChat() {
        hideAllScreens();
        chatScreenEl.classList.remove('hidden');
        
        conversationHistory = [];
        chatLogEl.textContent = '';
        currentResponseIndex = 0;
        userInputEl.value = '';
        userInputEl.disabled = false;
        sendButtonEl.classList.remove('hidden');
        cancelChatButtonEl.classList.remove('hidden');

        processAiResponse(); // EON faz a primeira pergunta
        userInputEl.focus();
    }

    function handleNameConfirm() {
        const name = nameInputEl.value.trim();
        if (name && name.length > 1) {
            userName = name;
            startChat();
        } else {
            showTemporaryFeedback(nameFeedbackEl, "Designação inválida. Tente novamente.");
        }
    }

    function showImageResult() {
        hideAllScreens();
        imageResultScreenEl.classList.remove('hidden');
        console.log("Histórico final:", conversationHistory);
    }
    
    function reset() {
        hideAllScreens();
        introScreenEl.classList.remove('hidden');
        nameInputEl.value = '';
    }

    // --- EVENT LISTENERS ---
    startButtonEl.addEventListener('click', startBootAnimation);
    continueToNameButtonEl.addEventListener('click', showNameEntryScreen); // NOVO LISTENER
    confirmNameButtonEl.addEventListener('click', handleNameConfirm);
    nameInputEl.addEventListener('keypress', (e) => e.key === 'Enter' && handleNameConfirm());
    sendButtonEl.addEventListener('click', handleSendMessage);
    userInputEl.addEventListener('keypress', (e) => e.key === 'Enter' && handleSendMessage());
    cancelChatButtonEl.addEventListener('click', reset);
    restartButtonEl.addEventListener('click', reset);
    
    reset();
});
