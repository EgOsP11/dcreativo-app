const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

// Ruta absoluta al JSON de la service account
const keyPath = path.join(__dirname, 'appdcre-firebase-adminsdk-fbsvc-33aa9688a5.json');

let key;
try {
  const rawKey = fs.readFileSync(keyPath, 'utf8');
  key = JSON.parse(rawKey);
} catch (err) {
  console.error('Error leyendo o parseando el JSON:', err.message);
  process.exit(1);
}

// Normalizar la clave privada
if (!key.private_key) {
  console.error('No se encontró "private_key" en el JSON');
  process.exit(1);
}

// Limpiar y asegurar formato PEM válido
key.private_key = key.private_key
  .replace(/\r/g, '')           // quitar retornos de carro (Windows)
  .replace(/\\n/g, '\n')        // convertir secuencias literales "\n" a saltos reales
  .trim();

// Imprimir debug para asegurarnos de que está bien
console.log('Email de service account:', key.client_email);
console.log('Preview de la clave (primeros 60 chars):', key.private_key.slice(0, 60));

const SCOPES = ['https://www.googleapis.com/auth/firebase.messaging'];

async function getAccessToken() {
  try {
    const client = new google.auth.JWT({
      email: key.client_email,
      key: key.private_key,
      scopes: SCOPES,
    });

    const token = await client.authorize();
    console.log('\nACCESS TOKEN:\n', token.access_token);
  } catch (err) {
    console.error('Error generando token:', err);
  }
}

getAccessToken();
