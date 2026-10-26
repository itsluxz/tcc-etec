const bcrypt = require('bcrypt');
const supabase = require('../config/supabase');

const TABELA = 'usuarios';

const httpError = (status, message) => {
    const err = new Error(message);
    err.status = status;
    return err;
};


const semSenha = ({ senha, ...usuario }) => usuario;

exports.findAll = async () => {
    const { data, error } = await supabase.from(TABELA).select('*');
    if (error) throw error;
    return data.map(semSenha);
};

exports.findById = async (id) => {
    const { data: usuario, error } = await supabase
        .from(TABELA)
        .select('*')
        .eq('id', id)
        .maybeSingle();
    if (error) throw error;
    if (!usuario) throw httpError(404, 'Usuario não encontrado');
    return semSenha(usuario);
};

exports.create = async (data) => {
    if (!data.email) throw httpError(400, 'Email é obrigatório!');

    const novo = { ...data };
    if (novo.senha) novo.senha = await bcrypt.hash(novo.senha, 10);

    const { data: usuario, error } = await supabase
        .from(TABELA)
        .insert(novo)
        .select()
        .single();
    if (error) throw error;
    return semSenha(usuario);
};

exports.update = async (id, data) => {
    const alteracoes = { ...data };
    delete alteracoes.id;
    if (alteracoes.senha) alteracoes.senha = await bcrypt.hash(alteracoes.senha, 10);

    const { data: usuario, error } = await supabase
        .from(TABELA)
        .update(alteracoes)
        .eq('id', id)
        .select()
        .maybeSingle();
    if (error) throw error;
    if (!usuario) throw httpError(404, 'Usuario não encontrado');
    return semSenha(usuario);
};

exports.delete = async (id) => {
    const { data: usuario, error } = await supabase
        .from(TABELA)
        .delete()
        .eq('id', id)
        .select()
        .maybeSingle();
    if (error) throw error;
    if (!usuario) throw httpError(404, 'Usuario não encontrado');
    return semSenha(usuario);
};
