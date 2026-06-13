const bedrock = require('bedrock-protocol');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Render necesita una ruta web activa o marcará error de despliegue
app.get('/', (req, res) => {
  res.send('Bot de Aternos corriendo activamente 24/7.');
});

app.listen(PORT, () => {
  console.log(`Mini-servidor web escuchando en el puerto ${PORT}`);
});

function conectarBot() {
  console.log('Iniciando conexión con Aternos...');
  
  const client = bedrock.createClient({
    host: 'pueblaoficial.aternos.me', 
    port: 51582, // Recuerda cambiar el puerto si cambia en tu panel de Aternos       
    username: 'AlexToffler',
    offline: true,
    raknetTimeout: 15000,
    skipTickCheck: true
  });

  client.on('start_game', () => {
    console.log('¡Conectado a Aternos con éxito! Manteniendo el servidor despierto.');
  });

  // Si el servidor de Aternos se llega a reiniciar o apagar por mantenimiento,
  // el bot esperará 2 minutos e intentará reconectarse automáticamente en bucle.
  client.on('error', (err) => {
    console.error('Conexión perdida o servidor apagado. Reconectando en 2 minutos...', err.message);
    setTimeout(conectarBot, 120000);
  });

  client.on('close', () => {
    console.log('Conexión cerrada. Intentando reconectar...');
    setTimeout(conectarBot, 60000);
  });
}

// Arrancar el bot
conectarBot();
