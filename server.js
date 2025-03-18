const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const cors = require('cors'); // Para restringir el acceso con CORS

// Middleware para permitir solicitudes JSON y servir archivos estáticos
app.use(express.json());
app.use(express.static('public'));

// Configura CORS para permitir cualquier origen temporalmente
app.use(cors());

// Almacenar el CAPTCHA generado en memoria (mejorado para múltiples usuarios)
let captchaStore = {};

// Endpoint para generar un CAPTCHA
app.get('/api/generar-captcha', (req, res) => {
    const captcha = Math.floor(Math.random() * 9000) + 1000; // Número aleatorio de 4 dígitos
    const captchaId = Date.now().toString(); // ID único para el CAPTCHA
    captchaStore[captchaId] = captcha; // Almacenar el CAPTCHA con un ID único
    res.json({ captcha, captchaId }); // Enviar el CAPTCHA y su ID al cliente
});

// Endpoint para consultar el estado
app.post('/api/consultar', (req, res) => {
    const { dni, captchaInput, captchaId } = req.body;

    // Validar CAPTCHA
    if (!captchaStore[captchaId] || captchaInput != captchaStore[captchaId]) {
        return res.status(400).json({ error: 'CAPTCHA incorrecto' });
    }

    // Eliminar el CAPTCHA usado para evitar reutilización
    delete captchaStore[captchaId];

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