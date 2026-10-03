// A porta que é aberta
const PORT = process.env.PORT || 3000;

//apenas um console log simples
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
