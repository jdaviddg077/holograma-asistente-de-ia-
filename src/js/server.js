async function pedirRespuestaStream(promptUsuario, elementoDondeEscribir) {
  const respuesta = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3.2:3b",
      prompt: promptUsuario,
      stream: true // Habilita la transmisión en tiempo real
    })
  });

  const lector = respuesta.body.getReader();
  const decodificador = new TextDecoder("utf-8");

  while (true) {
    const { done, value } = await lector.read();
    if (done) break;

    // Decodificar el bloque de datos que llega
    const chunk = decodificador.decode(value, { stream: true });
    
    // Ollama manda objetos JSON separados por salto de línea
    const lineas = chunk.split("\n").filter(linea => linea.trim() !== "");

    for (const linea of lineas) {
      const json = JSON.parse(linea);
      // Vas agregando fragmento por fragmento al HTML
      elementoDondeEscribir.innerText += json.response;
    }
  }
}