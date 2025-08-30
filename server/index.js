const express = require('express');
const { GoogleAuth } = require('google-auth-library');
const path = require('path');
const fs = require('fs');

// Si Node.js no trae fetch integrado, usamos node-fetch
const fetch = global.fetch || require('node-fetch');

const app = express();
app.use(express.json());

// Configuración de Firebase Service Account
const keyPath = path.join(__dirname, '../appdcre-firebase-adminsdk-fbsvc-33aa9688a5.json');
let rawKey = fs.readFileSync(keyPath, 'utf8');
let key = JSON.parse(rawKey);

// Asegurar saltos de línea en private_key
key.private_key = key.private_key.replace(/\\n/g, '\n').trim();

const SCOPES = ['https://www.googleapis.com/auth/firebase.messaging'];
const PROJECT_ID = 'appdcre';

// Función para generar token
async function getAccessToken() {
  const auth = new GoogleAuth({
    credentials: {
      client_email: key.client_email,
      private_key: key.private_key,
    },
    scopes: SCOPES,
  });

  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  return tokenResponse.token;
}

// 1) Notificar cuando se asigna una tarea a un colaborador
app.post('/notify-task', async (req, res) => {
  const { deviceToken, taskTitle, taskDeadline } = req.body;

  try {
    const accessToken = await getAccessToken();

    const message = {
      message: {
        token: deviceToken,
        notification: {
          title: 'Nueva tarea asignada',
          body: `${taskTitle} - Entrega: ${taskDeadline}`
        }
      }
    };

    const response = await fetch(`https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });

    const data = await response.json();
    console.log('Notificación enviada (tarea):', data);
    res.json(data);
  } catch (err) {
    console.error('Error enviando notificación de tarea:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 2) Notificar cuando se asigna un campo a un colaborador
app.post('/notify-field', async (req, res) => {
  const { deviceToken, fieldLocation, fieldDate } = req.body;

  try {
    const accessToken = await getAccessToken();

    const message = {
      message: {
        token: deviceToken,
        notification: {
          title: 'Se te asignó un campo',
          body: `Lugar: ${fieldLocation} - Fecha: ${fieldDate}`
        }
      }
    };

    const response = await fetch(`https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });

    const data = await response.json();
    console.log('Notificación enviada (campo):', data);
    res.json(data);
  } catch (err) {
    console.error('Error enviando notificación de campo:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 3) Notificar al admin cuando un cliente solicita un campo
app.post('/notify-client-request', async (req, res) => {
  const { deviceToken, clientName, requestedDate } = req.body;

  try {
    const accessToken = await getAccessToken();

    const message = {
      message: {
        token: deviceToken,
        notification: {
          title: 'Nuevo campo solicitado',
          body: `${clientName} solicitó un campo para: ${requestedDate}`
        }
      }
    };

    const response = await fetch(`https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });

    const data = await response.json();
    console.log('Notificación enviada (solicitud cliente):', data);
    res.json(data);
  } catch (err) {
    console.error('Error enviando notificación de solicitud:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 4) Notificar al admin cuando alguien entra a la sala de espera
app.post('/notify-waiting-room', async (req, res) => {
  const { deviceToken, userName } = req.body;

  try {
    const accessToken = await getAccessToken();

    const message = {
      message: {
        token: deviceToken,
        notification: {
          title: 'Usuario esperando rol',
          body: `${userName} está en la sala de espera`
        }
      }
    };

    const response = await fetch(`https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });

    const data = await response.json();
    console.log('Notificación enviada (sala de espera):', data);
    res.json(data);
  } catch (err) {
    console.error('Error enviando notificación de sala de espera:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 5) Recordatorio 1 día antes de un campo (para colaborador o admin)
app.post('/notify-reminder', async (req, res) => {
  const { deviceToken, fieldLocation, fieldDate } = req.body;

  try {
    const accessToken = await getAccessToken();

    const message = {
      message: {
        token: deviceToken,
        notification: {
          title: 'Recordatorio de campo',
          body: `Mañana hay campo en ${fieldLocation} (${fieldDate})`
        }
      }
    };

    const response = await fetch(`https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });

    const data = await response.json();
    console.log('Notificación enviada (recordatorio):', data);
    res.json(data);
  } catch (err) {
    console.error('Error enviando notificación de recordatorio:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 6) Notificar al admin cuando un colaborador termina su tarea o campo
app.post('/notify-task-done', async (req, res) => {
  const { deviceToken, taskTitle, collaboratorName } = req.body;

  try {
    const accessToken = await getAccessToken();

    const message = {
      message: {
        token: deviceToken,
        notification: {
          title: 'Tarea completada',
          body: `${collaboratorName} completó la tarea: ${taskTitle}`
        }
      }
    };

    const response = await fetch(`https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });

    const data = await response.json();
    console.log('Notificación enviada (tarea completada):', data);
    res.json(data);
  } catch (err) {
    console.error('Error enviando notificación de tarea completada:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor de notificaciones corriendo en http://localhost:${PORT}`);
});