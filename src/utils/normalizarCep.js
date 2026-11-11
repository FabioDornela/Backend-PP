// Remove tudo que não for dígito. Retorna "" se vazio e null se inválido (diferente de 8 dígitos).
function normalizarCep(valor) {
  const digitos = String(valor ?? "").replace(/\D/g, "");
  if (!digitos) return "";
  return digitos.length === 8 ? digitos : null;
}

module.exports = normalizarCep;
