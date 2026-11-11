// Lê filtros simples da query string: apenas textos curtos, já sem espaços nas pontas.
function lerFiltros(query, campos) {
  const filtros = {};
  for (const campo of campos) {
    const valor = query[campo];
    if (typeof valor === "string" && valor.trim()) {
      filtros[campo] = valor.trim().slice(0, 100);
    }
  }

  const limite = Number.parseInt(query.limite, 10);
  if (Number.isInteger(limite) && limite > 0) filtros.limite = Math.min(limite, 100);

  return filtros;
}

module.exports = lerFiltros;
