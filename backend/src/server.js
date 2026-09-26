//declarando const requerindo os framewroks
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const usuariosRoutes = require("./routes/usuarios.routes");

//chamando as funções que serão usadas aqui
app.use(cors());
app.use(express.json());
app.use("/api/usuarios", usuariosRoutes);

// no caminho / retorna json dizendo que o ELO está ligado
app.get("/", (req, res) => {
    res.json({
        message: "API ELO ligado!"
    });
});

// A porta que é aberta
const PORT = process.env.PORT || 3000;

//apenas um console log simples
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
