const SALT_CC   = 'GHZ2026CPFCHECK'
const LS_KEY_CC = '@CPFCHECK:licenca'
const PREFIX_CC = 'CPFCHK'

function gerarChaveCC(n) {
  const p1 = String(n).padStart(4, '0')
  const p2 = btoa(n + SALT_CC).replace(/[^A-Z0-9]/gi, '').slice(0, 4).toUpperCase()
  const p3 = String((n * 41) % 9999).padStart(4, '0')
  return `${PREFIX_CC}-${p1}-${p2}-${p3}`
}

function validarChaveCC(key) {
  if (!key) return false
  const clean = key.trim().toUpperCase()
  const parts = clean.split('-')
  if (parts.length !== 4 || parts[0] !== PREFIX_CC) return false
  const n = parseInt(parts[1])
  if (isNaN(n)) return false
  return gerarChaveCC(n) === clean
}

function licencaAtivaCC() {
  try { return validarChaveCC(localStorage.getItem(LS_KEY_CC) || '') }
  catch(e) { return false }
}

function salvarLicencaCC(key) {
  localStorage.setItem(LS_KEY_CC, key.trim().toUpperCase())
}
