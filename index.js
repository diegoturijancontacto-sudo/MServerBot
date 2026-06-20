const bedrock = require('bedrock-protocol');
const express = require('express');
const fs = require('fs'); // <-- Requerido para leer archivos
const PNG = require('pngjs').PNG; // <-- Requerido para procesar los píxeles de la skin

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

// Función para transformar un PNG comercial en el formato crudo RGBA (Base64) que pide Bedrock
function cargarSkinPersonalizada(rutaArchivo) {
  try {
    if (!fs.existsSync(rutaArchivo)) {
      console.log(`[Skin] No se encontró el archivo "${rutaArchivo}". El bot usará la skin por defecto (Steve).`);
      return null;
    }

    const archivoBuffer = fs.readFileSync(rutaArchivo);
    const png = PNG.sync.read(archivoBuffer);

    // Bedrock no lee el archivo PNG completo, lee el array de bytes de color RGBA directamente mapeado
    const rawDataBuffer = png.data.toString('base64');

    console.log(`[Skin] "${rutaArchivo}" cargada con éxito (${png.width}x${png.height}).`);

    return {
      SkinId: "BotCustomSkinID",
      SkinImageWidth: png.width,
      SkinImageHeight: png.height,
      SkinData: rawDataBuffer,
      SkinResourcePatch: Buffer.from(JSON.stringify({
        geometry: { default: "geometry.humanoid.custom" }
      })).toString('base64'),
      GeometryData: "",
      CapeId: "",
      CapeData: "",
      PremiumSkin: true,
      PersonaSkin: false,
      CapeOnClassicSkin: false
    };
  } catch (err) {
    console.error('[Skin] Error al procesar el archivo de imagen:', err.message);
    return null;
  }
}

function conectarBot() {
  console.log('Iniciando conexión con Aternos...');
  
  // Cargamos los datos de la skin antes de crear el cliente
  const datosSkin = cargarSkinPersonalizada('skin.png');

  // Usamos exactamente los mismos parámetros de tu configuración original
  const clientOptions = {
    host: 'pueblaoficial.aternos.me', 
    port: 51582, 
    username: 'Herobrine',
    offline: true,
    raknetTimeout: 15000,
    skipTickCheck: true 
  };

  // Si la skin se procesó correctamente, se la inyectamos a las opciones
  if (datosSkin) {
    clientOptions.skinData = datosSkin;
  }

  const client = bedrock.createClient(clientOptions);

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
