// api/push.js
const { GoogleAuth } = require('google-auth-library');

const SCOPES = ['https://www.googleapis.com/auth/firebase.messaging'];
const allowOrigin = '*'; // cambia a tu dominio si quieres limitar

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-KEY');
}

async function getAccessToken() {
  const json = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!json) throw new Error('Missing GOOGLE_APPLICATION_CREDENTIALS_JSON');
  const creds = JSON.parse(json);
  if (typeof creds.private_key === 'string') {
    creds.private_key = creds.private_key.replace(/\\n/g, '\n').trim();
  }
  const auth = new GoogleAuth({ credentials: creds, scopes: SCOPES });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  if (!token?.token) throw new Error('No access token');
  return token.token;
}

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    // (Opcional) API key simple
    const apiKey = process.env.API_KEY;
    if (apiKey && req.headers['x-api-key'] !== apiKey) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { token, title = 'Notificación', body = 'Mensaje', data = {} } = req.body || {};
    if (!token) return res.status(400).json({ error: 'token requerido' });

    const projectId = process.env.FIREBASE_PROJECT_ID;
    if (!projectId) return res.status(500).json({ error: 'FIREBASE_PROJECT_ID faltante' });

    const accessToken = await getAccessToken();
    const r = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: { token, notification: { title, body }, data } }),
    });

    const text = await r.text();
    let json; try { json = JSON.parse(text); } catch { json = text; }
    if (!r.ok) return res.status(r.status).json({ error: json });

    return res.status(200).json(json);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || String(e) });
  }
};
