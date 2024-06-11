import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";

// Definir __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());

// Inicia el servidor HTTP
app.listen(process.env.PORT || 4000, () => {
  console.log(`Server listening on port ${process.env.PORT || 4000}`);
});

app.post("/api/save-data", (req, res) => {
  const { filename, data } = req.body;
  if (!filename || !data) {
    return res.status(400).send("Faltan el nombre del archivo o los datos");
  }
  const filePath = path.join(__dirname, "data", `${filename}.json`);
  fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      return res.status(500).send("Error al guardar los datos");
    }
    return res.status(200).send("Datos guardados exitosamente");
  });
});

app.get("/api/get-data/:filename", (req, res) => {
  const filename = req.params.filename;

  if (!filename) {
    return res.status(400).send("Falta el nombre del archivo");
  }

  // Ruta del archivo específico
  const filePath = path.join(__dirname, "data", `${filename}.json`);

  // Leer el archivo
  fs.readFile(filePath, "utf8", (err, fileData) => {
    if (err) {
      if (err.code === "ENOENT") {
        return res.status(404).send("Archivo no encontrado");
      }
      return res.status(500).send("Error al leer el archivo");
    }

    // Devolver el contenido del archivo
    res.status(200).json(JSON.parse(fileData));

    // Eliminar el archivo después de devolver su contenido
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) {
        console.error("Error al eliminar el archivo:", unlinkErr);
      }
    });
  });
});
