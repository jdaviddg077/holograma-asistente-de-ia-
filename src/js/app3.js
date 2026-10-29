const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const aiResponse = document.getElementById('ai-response');
const micBtn = document.getElementById('mic-btn');

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 

    const messageText = userInput.value;
    userInput.value = ""; 
    
    
    aiResponse.innerText = "";
    aiResponse.style.color = "aqua";

    try {
        const response = await fetch("http://localhost:5500/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: messageText })
        });

        if (!response.ok) throw new Error("Error en el servidor");

       
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

           
            const chunk = decoder.decode(value, { stream: true });
            fullText += chunk;

        
            aiResponse.innerText = fullText;
        }

        // 
        speakText(fullText);

    } catch (error) {
        console.error("Error al conectar con la IA:", error);
        aiResponse.innerText = "Error al conectar con el servidor.";
        aiResponse.style.color = "red";
    }
});

function speakText(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); 
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        window.speechSynthesis.speak(utterance);
    }
}


const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognitionAPI && micBtn) {
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'es-CO';       // 
    recognition.continuous = false;    // 
    recognition.interimResults = true; // 
    recognition.maxAlternatives = 1;

    let isListening = false;

    micBtn.addEventListener('click', () => {
        if (isListening) {
            recognition.stop();
            return;
        }

  
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }

        try {
            recognition.start();
        } catch (err) {
            console.error("No se pudo iniciar el reconocimiento:", err);
        }
    });

    recognition.addEventListener('start', () => {
        isListening = true;
        micBtn.classList.add('listening');
        userInput.placeholder = "Escuchando...";
    });

    recognition.addEventListener('result', (event) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }
        userInput.value = transcript;
    });

    recognition.addEventListener('end', () => {
        isListening = false;
        micBtn.classList.remove('listening');
        userInput.placeholder = "Escribe lo que quieras :)";

        
        if (userInput.value.trim().length > 0) {
            chatForm.requestSubmit();
        }
    });

    recognition.addEventListener('error', (event) => {
        console.error("Error de reconocimiento de voz:", event.error);
        isListening = false;
        micBtn.classList.remove('listening');
        userInput.placeholder = "Escribe lo que quieras :)";
    });
} else if (micBtn) {
    
    micBtn.style.display = 'none';
    console.warn("este navegador no soporta la web speak to text (usa Chrome o Edge).");
}