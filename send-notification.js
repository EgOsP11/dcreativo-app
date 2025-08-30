// send-notification.js
// Enviar notificaciones FCM (HTTP v1) desde Node.
// Usa ENV: FIREBASE_PROJECT_ID y GOOGLE_APPLICATION_CREDENTIALS_JSON

const { GoogleAuth } = require('google-auth-library');

// Si tu Node no trae fetch (Node < 18), usa node-fetch dinámico.
const fetch =
  global.fetch ||
  ((...args) => import('node-fetch').then(({ default: f }) => f(...args)));

const SCOPES = ['https://www.googleapis.com/auth/firebase.messaging'];

function readJsonFromArgvOrStdin() {
  return new Promise((resolve) => {
    // 1) Intentar leer JSON desde argv:
    // node send-notification.js '{"token":"...","title":"...","body":"...","data":{"k":"v"}}'
    try {
      const arg = process.argv[2];
      if (arg) return resolve(JSON.parse(arg));
    } catch (_) {}

    // 2) Si no hay argv válido, leer desde STDIN:
    // echo '{"token":"...","title":"...","body":"..."}' | node send-notification.js
    let buf = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (c) => (buf += c));
    process.stdin.on('end', () => {
      try {
        resolve(JSON.parse(buf));
      } catch {
        resolve({});
      }
    });

    // Si nadie escribe en stdin, el proceso quedará esperando;
    // corta con Ctrl+D (Unix) o pasa datos por argv.
  });
}

async function getAccessToken() {
  const saJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!saJson) throw new Error('Falta GOOGLE_APPLICATION_CREDENTIALS_JSON');

  const creds = JSON.parse(saJson);

  // Arreglar saltos de línea si vienen escapados
  if (creds.private_key && typeof creds.private_key === 'string') {
    creds.private_key = creds.private_key.replace(/\\n/g, '\n').trim();
  }

  const auth = new GoogleAuth({ credentials: creds, scopes: SCOPES });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  if (!token || !token.token) throw new Error('No se pudo obtener access token');
  return token.token;
}

async function main() {
  const PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
  if (!PROJECT_ID) throw new Error('Falta FIREBASE_PROJECT_ID');

  const input = await readJsonFromArgvOrStdin();

  const token = input.token || input.deviceToken;
  const title = input.title || 'Notificación';
  const body = input.body || 'Mensaje de prueba';
  const data = input.data || {}; // opcional para deep-links, etc.

  if (!token) {
    throw new Error(
      'Falta "token". Pásalo así: node send-notification.js \'{"token":"FCM_TOKEN","title":"...","body":"..."}\''
    );
  }

  const accessToken = await getAccessToken();

  const url = `https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`;
  const payload = {
    message: {
      token,
      notification: { title, body },
      data,
    },
  };

  const r = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const text = await r.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }

  if (!r.ok) {
    console.error('FCM ERROR', r.status, r.statusText, json);
    process.exit(1);
  }

  console.log('FCM OK', json);
}

main().catch((e) => {
  console.error('ERROR', e.message || e);
  process.exit(1);
});
