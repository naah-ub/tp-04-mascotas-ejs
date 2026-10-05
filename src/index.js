const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const path = require("node:path");
const { leerJson } = require("./archivos");
const PORT = 3000;
const rutaDatos = path.join(__dirname, "..", "datos", "mascotas.json");

async function main() {
    const mascotas = await leerJson(rutaDatos);
    const app = express();

    app.set("view engine", "ejs");
    app.set("views", path.join(__dirname, "..", "views"));
    app.use(expressLayouts);
    app.set("layout", "layouts/main");
    app.use(express.static(path.join(__dirname, "..", "public")));
    app.use(express.urlencoded({ extended: false }));

    app.get("/", (req, res) => {
        res.render("inicio", { titulo: "Encuentra a tu nuevo mejor amigo" });
    });

    app.get("/mascotas", (req, res) => {
        res.render("mascotas/lista", {
            titulo: "Encuentra a tu nuevo mejor amigo",
            mascotas,
        });

        // res.render("mascotas/lista", {
        //     titulo: "Encuentra a tu nuevo mejor amigo",
        //     mascotas: []
        // });
    });

    app.get("/mascotas/nueva", (req, res) => {
        res.render("mascotas/nueva", {
            titulo: "Nueva mascota",
            error: null,
            valores: {},
        });
    });

    app.get("/mascotas/:id", (req, res) => {
        const id = Number(req.params.id);
        const mascota = mascotas.find((elemento) => elemento.id === id);
        if (!mascota) {
            return res.status(404).render("no-encontrado", {
                titulo: "Mascota no encontrada",
                mensaje: "No existe una mascota con ese identificador.",
            });
        }
        res.render("mascotas/detalle", {
            titulo: mascota.nombre,
            mascota,
        });
    });

    app.post("/mascotas", (req, res) => {
        // Leer req.body sacando el estado también
        const { nombre, especie, edad, descripcion, estado } = req.body;

        // Limpiar y normalizar las cadenas de texto
        const nombreLimpio = String(nombre ?? "").trim();
        const especieLimpia = String(especie ?? "").trim();
        const descripcionLimpia = String(descripcion ?? "").trim();
        const estadoLimpio = String(estado ?? "").trim();

        // Convertir edad a número
        const edadNumerica = Number(edad);

        // Valores permitidos para el estado
        const estadosValidos = ["En adopción", "Reservada", "Adoptada"];

        // Comprobar que los campos estén completos y la edad sea válida
        if (
            !nombreLimpio ||
            !especieLimpia ||
            !descripcionLimpia ||
            !estadoLimpio ||
            !estadosValidos.includes(estadoLimpio) ||
            !Number.isFinite(edadNumerica) ||
            edadNumerica < 0
        ) {

            return res.status(400).render("mascotas/nueva", {
                titulo: "Nueva Mascota",
                error: "Completá todos los campos con valores válidos.",
                valores: req.body
            });
        }

        // Ante éxito, generar un identificador único y ordenado
        const ultimoId = mascotas.reduce(
            (mayorId, mascota) => Math.max(mayorId, mascota.id),
            0
        );

        // Agregar al arreglo
        mascotas.push({
            id: ultimoId + 1,
            nombre: nombreLimpio,
            especie: especieLimpia,
            edad: edadNumerica,
            descripcion: descripcionLimpia,
            estado: estadoLimpio,
            imagen: "/img/mascota.svg"
        });

        // Redirigir a /mascotas
        res.redirect("/mascotas");
    });


    app.listen(PORT, () => {
        console.log(`Aplicación disponible en http://localhost:${PORT}`);
    });
}

main().catch((error) => {
    console.error("No se pudo iniciar la aplicación:", error);
    process.exitCode = 1;
});
