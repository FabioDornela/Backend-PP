const ErroHttp = require("../utils/erroHttp");
const normalizarCep = require("../utils/normalizarCep");

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/*
 * Regras por campo:
 *  obrigatorio, semTrim, min, max (tamanho do texto), email, cep, uf, enum, inteiro, data
 * Os valores validados e limpos (trim) substituem req.body.
 * Campos não declarados nas regras são descartados.
 */
function validarDados(regras) {
  return (req, res, next) => {
    const origem = req.body && typeof req.body === "object" ? req.body : {};
    const limpo = {};
    const erros = {};

    for (const [campo, regra] of Object.entries(regras)) {
      let valor = origem[campo];
      if (typeof valor === "string" && !regra.semTrim) valor = valor.trim();
      const vazio = valor === undefined || valor === null || valor === "";

      if (vazio) {
        if (regra.obrigatorio) erros[campo] = "Campo obrigatório.";
        else limpo[campo] = undefined;
        continue;
      }

      if (typeof valor !== "string" && typeof valor !== "number") {
        erros[campo] = "Valor inválido.";
        continue;
      }
      valor = String(valor);

      if (regra.min && valor.length < regra.min) {
        erros[campo] = `Use pelo menos ${regra.min} caracteres.`;
      } else if (regra.max && valor.length > regra.max) {
        erros[campo] = `Use no máximo ${regra.max} caracteres.`;
      } else if (regra.email && !REGEX_EMAIL.test(valor)) {
        erros[campo] = "E-mail inválido.";
      } else if (regra.cep) {
        const cep = normalizarCep(valor);
        if (cep === null) erros[campo] = "CEP inválido. Use 8 dígitos.";
        else valor = cep;
      } else if (regra.uf && !/^[A-Za-z]{2}$/.test(valor)) {
        erros[campo] = "Use a sigla do estado com 2 letras.";
      } else if (regra.enum && !regra.enum.includes(valor)) {
        erros[campo] = `Valor permitido: ${regra.enum.join(", ")}.`;
      } else if (regra.inteiro && !/^[1-9]\d*$/.test(valor)) {
        erros[campo] = "Informe um número inteiro válido.";
      } else if (regra.data && (!/^\d{4}-\d{2}-\d{2}$/.test(valor) || Number.isNaN(Date.parse(valor)))) {
        erros[campo] = "Data inválida. Use AAAA-MM-DD.";
      }

      if (!erros[campo]) {
        if (regra.uf) valor = valor.toUpperCase();
        if (regra.email) valor = valor.toLowerCase();
        limpo[campo] = regra.inteiro ? Number(valor) : valor;
      }
    }

    if (Object.keys(erros).length) {
      return next(new ErroHttp(400, "Dados inválidos.", erros));
    }

    req.body = limpo;
    next();
  };
}

// Valida parâmetros de rota numéricos (:id).
function validarId(req, res, next, valor) {
  if (!/^[1-9]\d{0,9}$/.test(valor)) {
    return next(new ErroHttp(400, "Identificador inválido."));
  }
  next();
}

module.exports = validarDados;
module.exports.validarId = validarId;
