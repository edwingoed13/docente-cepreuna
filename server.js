const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const cors = require('cors');

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(cors());

// Ruta para consultar el estado
app.post('/api/consultar', (req, res) => {
    const { dni } = req.body;

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