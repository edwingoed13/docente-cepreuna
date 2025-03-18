const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const cors = require('cors'); // Para permitir acceso desde diferentes dominios

// Middleware para permitir solicitudes JSON y servir archivos estáticos
app.use(express.json());
app.use(express.static('public'));

// Configura CORS para permitir solicitudes desde cualquier origen
app.use(cors());

// Almacenar el CAPTCHA generado (en memoria, para simplificar)
let captchaServer = null;

// Endpoint para generar un CAPTCHA
app.get('/api/generar-captcha', (req, res) => {
    captchaServer = Math.floor(Math.random() * 9000) + 1000; // Número aleatorio de 4 dígitos
    res.json({ captcha: captchaServer });
});

// Endpoint para consultar el estado
app.post('/api/consultar', (req, res) => {
    const { dni, captchaInput } = req.body;

    // Validar CAPTCHA
    if (parseInt(captchaInput) !== captchaServer) {
        return res.status(400).json({ error: 'CAPTCHA incorrecto' });
    }

    // Cargar datos desde el archivo JSON
    try {
        const datos = JSON.parse(fs.readFileSync(path.join(__dirname, 'datos.json'), 'utf8'));
        const usuario = datos.find(user => user.nro_documento === dni);

        if (usuario) {
            res.json({
                nombre: usuario.Nombres_y_Apellidos,
                estado: usuario.Estado,
            });
        } else {
            res.status(404).json({ error: 'DNI no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al leer el archivo JSON' });
    }
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
