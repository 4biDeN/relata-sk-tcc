const MAPA_UF = Object.freeze({
  'acre':'AC','alagoas':'AL','amapá':'AP','amapa':'AP','amazonas':'AM','bahia':'BA','ceará':'CE','ceara':'CE',
  'distrito federal':'DF','espírito santo':'ES','espirito santo':'ES','goiás':'GO','goias':'GO','maranhão':'MA','maranhao':'MA',
  'mato grosso':'MT','mato grosso do sul':'MS','minas gerais':'MG','pará':'PA','para':'PA','paraíba':'PB','paraiba':'PB',
  'paraná':'PR','parana':'PR','pernambuco':'PE','piauí':'PI','piaui':'PI','rio de janeiro':'RJ','rio grande do norte':'RN',
  'rio grande do sul':'RS','rondônia':'RO','rondonia':'RO','roraima':'RR','santa catarina':'SC','são paulo':'SP','sao paulo':'SP',
  'sergipe':'SE','tocantins':'TO'
})

function normaliza(s) {
  return String(s||'').normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().trim()
}

export function resolverUF(address = {}) {
  const iso = address['ISO3166-2-lvl4'] || address['ISO3166-2-lvl6'] || address['ISO3166-2-lvl8'] || ''
  if (typeof iso === 'string' && iso.startsWith('BR-')) return iso.slice(3)
  if (typeof address.state_code === 'string' && /^[A-Z]{2}$/.test(address.state_code)) return address.state_code
  const nome = normaliza(address.state)
  return MAPA_UF[nome] || ''
}
