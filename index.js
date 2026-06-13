const bedrock = require('bedrock-protocol');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 10000;

// Render exige una respuesta HTTP para saber que el servicio está vivo
app.get('/', (req, res) => {
  res.send('MServerBot activo y manteniendo el servidor despierto.');
});

app.listen(PORT, () => {
  console.log(`Mini-servidor web escuchando en el puerto ${PORT}`);
});

let bucleChat = null;

function conectarBot() {
  console.log('Iniciando conexión con Aternos...');
  
  // Usamos exactamente los mismos parámetros que te funcionaron en Colab
  const client = bedrock.createClient({
    host: 'pueblaoficial.aternos.me', 
    port: 51582, // <-- ASEGÚRATE de que este sea el puerto actual de tu panel de Aternos
    username: 'BotAternos247',
    offline: true,
    raknetTimeout: 15000,
    skipTickCheck: true // El truco maestro de Colab para saltar los chunks
  });

  client.on('start_game', () => {
    console.log('¡Conectado a Aternos con éxito! Manteniendo el servidor despierto.');
    
    if (bucleChat) clearInterval(bucleChat);

    // Mandamos un mensaje cada 5 minutos para que Aternos no nos saque por AFK
    bucleChat = setInterval(() => {
      try {
        client.queue('text', {
          type: 'chat',
          needs_translation: false,
          source_name: client.username,
          xuid: '',
          platform_chat_id: '',
          message: 'Protección Anti-AFK activa. Servidor despierto. 🤖'
        });
        console.log('Mensaje Anti-AFK enviado con éxito.');
      } catch (e) {
        console.error('Error al enviar mensaje de actividad:', e.message);
      }
    }, 300000);
  });

  client.on('error', (err) => {
    console.error('Conexión perdida. Reconectando en 2 minutos...', err.message);
    if (bucleChat) clearInterval(bucleChat);
    setTimeout(conectarBot, 120000);
  });

  client.on('close', () => {
    console.log('Conexión cerrada. Intentando reconectar en 1 minuto...');
    if (bucleChat) clearInterval(bucleChat);
    setTimeout(conectarBot, 60000);
  });
}

// Arrancar el ciclo
conectarBot();
