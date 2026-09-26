const express = require("express");
const router = express.Router();


// const banco = require("../database/db");

router.get("/", async (req, res) => {
    //usando try para verificar com SELECT se existe o usuario no banco de dados
    try {
        // const resultado = await banco.query(
        // //     "SELECT id, nome, email, cargo, ativo FROM usuarios"
        // );

        // res.json(resultado.rows);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Erro ao buscar usuários"
        });
    }
});


router.post('/', async (req, res) => {
    try {

        const { nome, email, cargo, ativo, turma } = req.body
        // const usuarioInformacao = await banco.query(
        //     "INSERT INTO usuarios (nome, email, cargo, ativo, turma) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        //     [nome, email, cargo, ativo, turma]
        // );

        // res.status(201).json(usuarioInformacao.rows[0]);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: "Erro ao cadastrar aluno"
        });
    }
});



module.exports = router;