// Auto-aplicar tema quando util.js carrega
;(function() {
  const t = localStorage.getItem('@CPFCHECK:tema') || 'light'
  document.documentElement.setAttribute('data-tema', t)
})()

function getTema() { return localStorage.getItem('@CPFCHECK:tema') || 'light' }
function aplicarTema(t) {
  document.documentElement.setAttribute('data-tema', t)
  localStorage.setItem('@CPFCHECK:tema', t)
}
function aplicarTemaAtual() { aplicarTema(getTema()) }

function aviso(tipo, msg) {
  const ok  = document.getElementById('avisoOk')
  const err = document.getElementById('avisoErro')
  if (tipo === 'ok') {
    if (err) err.style.display='none'
    if (ok)  { ok.textContent=msg; ok.style.display='block'; setTimeout(()=>ok.style.display='none',3200) }
  } else {
    if (ok)  ok.style.display='none'
    if (err) { err.textContent=msg; err.style.display='block'; setTimeout(()=>err.style.display='none',4000) }
  }
}

// ── VALIDAÇÃO DE CPF ─────────────────────────────────────
function limparCPF(cpf) {
  return String(cpf || '').replace(/\D/g, '')
}

function formatarCPF(cpf) {
  const n = limparCPF(cpf).padStart(11, '0').slice(-11)
  return `${n.slice(0,3)}.${n.slice(3,6)}.${n.slice(6,9)}-${n.slice(9,11)}`
}

function validarCPF(cpf) {
  const c = limparCPF(cpf)
  if (c.length !== 11) return false
  if (/^(\d)\1+$/.test(c)) return false

  // 1º dígito verificador
  let soma = 0
  for (let i = 0; i < 9; i++) soma += parseInt(c[i]) * (10 - i)
  let d1 = (soma * 10) % 11
  if (d1 === 10 || d1 === 11) d1 = 0
  if (d1 !== parseInt(c[9])) return false

  // 2º dígito verificador
  soma = 0
  for (let i = 0; i < 10; i++) soma += parseInt(c[i]) * (11 - i)
  let d2 = (soma * 10) % 11
  if (d2 === 10 || d2 === 11) d2 = 0
  return d2 === parseInt(c[10])
}

// ── MODAL DE CONFIRMAÇÃO ────────────────────────────────
function confirmar(mensagem, callback) {
  const existing = document.getElementById('_confirmModal')
  if (existing) existing.remove()

  const ov = document.createElement('div')
  ov.id = '_confirmModal'
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:99999;display:flex;align-items:center;justify-content:center'
  ov.innerHTML = `
    <div style="background:var(--card);border:1px solid var(--border);border-radius:14px;padding:28px 28px 22px;width:360px;box-shadow:0 20px 60px rgba(0,0,0,0.4)">
      <div style="font-size:20px;margin-bottom:10px">⚠️</div>
      <div style="font-size:14px;font-weight:600;color:var(--fg);margin-bottom:20px;line-height:1.5">${mensagem}</div>
      <div style="display:flex;gap:10px;justify-content:flex-end">
        <button id="_confirmNao" style="padding:9px 20px;border-radius:8px;border:1px solid var(--border);background:var(--card2);color:var(--muted);font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">Cancelar</button>
        <button id="_confirmSim" style="padding:9px 20px;border-radius:8px;border:none;background:var(--red);color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">Confirmar</button>
      </div>
    </div>`
  document.body.appendChild(ov)
  document.getElementById('_confirmSim').onclick = () => { ov.remove(); callback(true) }
  document.getElementById('_confirmNao').onclick = () => { ov.remove(); callback(false) }
  ov.onclick = (e) => { if (e.target === ov) { ov.remove(); callback(false) } }
}

// ── MODAL DE AVISO ───────────────────────────────────────
function avisoModal(mensagem) {
  const existing = document.getElementById('_avisoModal')
  if (existing) existing.remove()

  const ov = document.createElement('div')
  ov.id = '_avisoModal'
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:99999;display:flex;align-items:center;justify-content:center'
  ov.innerHTML = `
    <div style="background:var(--card);border:1px solid var(--border);border-radius:14px;padding:28px;width:min(420px,92vw);box-shadow:0 20px 60px rgba(0,0,0,0.4)">
      <div style="font-size:14px;color:var(--fg);margin-bottom:18px;line-height:1.5;white-space:pre-line;overflow-wrap:anywhere;word-break:break-word">${mensagem}</div>
      <button id="_avisoOkBtn" style="width:100%;padding:10px;border-radius:8px;border:none;background:var(--primary);color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">OK</button>
    </div>`
  document.body.appendChild(ov)
  document.getElementById('_avisoOkBtn').onclick = () => ov.remove()
}
