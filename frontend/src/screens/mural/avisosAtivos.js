// data no formato do banco (AAAA-MM-DD), no fuso do celular
function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// avisos que aparecem no mural: esconde os desativados e os que já expiraram
// (expira_em é o último dia em que aparece), do mais novo para o mais antigo.
// usado no Mural e no "Seu dia na escola" da tela inicial, que mostra o primeiro
export function avisosAtivos(lista) {
  const hoje = dateKey(new Date());
  return lista
    .filter((aviso) => aviso?.ativo !== false && !(aviso?.expira_em && aviso.expira_em < hoje))
    .sort((primeiro, segundo) => {
      const dataPrimeiro = Date.parse(primeiro?.criado_em ?? '') || 0;
      const dataSegundo = Date.parse(segundo?.criado_em ?? '') || 0;
      return dataSegundo - dataPrimeiro;
    });
}
