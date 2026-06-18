/**
 * db.js — CPFCheck database layer
 * Pure JSON / filesystem. Zero native dependencies.
 */
const fs   = require('fs')
const path = require('path')

function getDataDir() {
  try {
    const arg = process.argv.find(a => a.startsWith('--data-dir='))
    if (arg) return arg.replace('--data-dir=', '')
  } catch(e) {}
  return path.join(__dirname, '..', 'data')
}

const DATA_DIR = getDataDir()
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

function lerJSON(nome, padrao) {
  if (padrao === undefined) padrao = []
  const f = path.join(DATA_DIR, nome + '.json')
  try { return JSON.parse(fs.readFileSync(f, 'utf8')) } catch(e) { return padrao }
}
function salvarJSON(nome, dados) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
    fs.writeFileSync(path.join(DATA_DIR, nome + '.json'), JSON.stringify(dados, null, 2))
  } catch(e) {
    throw new Error('Erro ao salvar ' + nome + ': ' + e.message)
  }
}
function nextId(lista) {
  return lista.length ? Math.max(...lista.map(x => x.id || 0)) + 1 : 1
}
function agora() { return new Date().toLocaleString('sv-SE') }

// ── CONFIG ─────────────────────────────────────────────────
function getConfig(chave, padrao) {
  if (padrao === undefined) padrao = ''
  const cfg = lerJSON('config', {})
  return cfg[chave] !== undefined ? cfg[chave] : padrao
}
function setConfig(chave, valor) {
  const cfg = lerJSON('config', {})
  cfg[chave] = String(valor)
  salvarJSON('config', cfg)
}

// ── HISTÓRICO DE VERIFICAÇÕES ──────────────────────────────
function listarHistorico() {
  return lerJSON('historico').sort((a, b) => b.criado_em.localeCompare(a.criado_em))
}
function inserirHistorico(d) {
  const lista = lerJSON('historico')
  lista.push({ id: nextId(lista), ...d, criado_em: agora() })
  // Manter apenas os últimos 50 registros
  if (lista.length > 50) lista.splice(0, lista.length - 50)
  salvarJSON('historico', lista)
}
function limparHistorico() {
  salvarJSON('historico', [])
}

module.exports = {
  getConfig, setConfig,
  listarHistorico, inserirHistorico, limparHistorico
}
