const bedrock = require('bedrock-protocol');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot de Aternos corriendo activamente 24/7 con sistema Anti-AFK.');
});

app.listen(PORT, () => {
  console.log(`Mini-servidor web escuchando en el puerto ${PORT}`);
});

let bucleChat = null; // Variable para controlar el bucle de texto

function conectarBot() {
  console.log('Iniciando conexión con Aternos...');
  
  const client = bedrock.createClient({
    host: process.env.ATERNOS_HOST || 'pueblaoficial.aternos.me', 
    port: 51582,       
    username: 'Isis',
    offline: true,
    raknetTimeout: 15000,
    skipTickCheck: true
  });

  client.on('start_game', () => {
    console.log('¡Conectado a Aternos con éxito! Activando protección Anti-AFK...');
    
    // Limpiamos cualquier bucle previo por seguridad
    if (bucleChat) clearInterval(bucleChat);

    // BUCLE ANTI-AFK: Envía un mensaje al chat cada 5 minutos (300000 milisegundos)
    // Esto le demuestra a Aternos que el bot está "activo" y evita el apagado.
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
        console.log('--- Mensaje Anti-AFK enviado al chat del juego ---');
      } catch (e) {
        console.error('No se pudo enviar el mensaje de actividad:', e.message);
      }
    }, 300000); 
  });

  client.on('error', (err) => {
    console.error('Conexión perdida o servidor apagado. Reconectando en 2 minutos...', err.message);
    if (bucleChat) clearInterval(bucleChat);
    setTimeout(conectarBot, 120000);
  });

  client.on('close', () => {
    console.log('Conexión cerrada. Intentando reconectar...');
    if (bucleChat) clearInterval(bucleChat);
    setTimeout(conectarBot, 60000);
  });
}

conectarBot();
