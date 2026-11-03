#!/usr/bin/env node
/**
 * Normaliza el dataset de LinkedIn (Apify) a `src/data/linkedin.ts`.
 *
 * El dato crudo NO se transcribe a mano: se baja con la API de Apify y se
 * transforma acá, de forma reproducible y auditable.
 *
 * Descargar primero (el dataset vence a los 7 días):
 *   curl -H "Authorization: Bearer $TOKEN" \
 *     "https://api.apify.com/v2/datasets/bIfR6YXqGWsAbWbv2/items?format=json&clean=true&limit=1000" \
 *     -o /tmp/linkedin-raw.json
 *
 * Uso:
 *   node scripts/build-linkedin.mjs <ruta-al-json> [--write]
 *
 * Sin `--write` sólo imprime el diagnóstico y no toca el repo.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const [, , inputPath, flag] = process.argv
if (!inputPath) {
  console.error('uso: node scripts/build-linkedin.mjs <ruta-al-json> [--write]')
  process.exit(2)
}

const WRITE = flag === '--write'
const REFERENCE_DATE = '2026-11-03'

/** Relevancia por título: lo que este perfil busca. */
const KEEP = /desarrollad|developer|programador|software|ingenier|engineer|arquitect|devops|\bsre\b|analista de desarrollo|\bqa\b|\bdata\b|machine learning|\bml\b|embebid|embedded|firmware|electr[óo]nic|automatiz|\biot\b|rob[óo]tic|instrument|control|telecom|hardware|\bplc\b|fullstack|full stack|backend|frontend/i

/** Ruido: cargos que caen en la búsqueda pero no son del perfil. */
const DROP = /auditor|controller|convocatoria|asistente|abogad|contab|reclutador|talent acquisition|community manager|dise[ñn]ador gr[áa]fico|help desk|recepcionista|conductor|vigilante|operario|auxiliar/i

/** Stack: diccionario explícito, sin clasificador. Orden = prioridad de salida. */
const STACK = [
  ['Java', /\bjava\b(?!\s*script)/i],
  ['JavaScript', /javascript|\bjs\b/i],
  ['TypeScript', /typescript/i],
  ['Python', /\bpython\b/i],
  ['C++', /c\+\+/],
  ['C#', /c#|\.net\b/i],
  ['Go', /\bgolang\b|go microservices/i],
  ['Rust', /\brust\b/i],
  ['Kotlin', /\bkotlin\b/i],
  ['Swift', /\bswift\b/i],
  ['PHP', /\bphp\b/i],
  ['Laravel', /laravel/i],
  ['Spring Boot', /spring boot/i],
  ['Django', /django/i],
  ['Node.js', /\bnode(\.js)?\b|nestjs/i],
  ['Angular', /\bangular\b/i],
  ['React', /\breact\b/i],
  ['Vue', /\bvue\b/i],
  ['Flutter', /\bflutter\b/i],
  ['Android', /\bandroid\b/i],
  ['iOS', /\bios\b/i],
  ['COBOL', /cobol/i],
  ['SQL', /\bsql\b/i],
  ['PostgreSQL', /postgres/i],
  ['Oracle', /\boracle\b/i],
  ['MongoDB', /mongo/i],
  ['AWS', /\baws\b|amazon web services/i],
  ['Azure', /\bazure\b/i],
  ['GCP', /\bgcp\b|google cloud/i],
  ['Docker', /\bdocker\b/i],
  ['Kubernetes', /kubernetes|\bk8s\b/i],
  ['Terraform', /terraform/i],
  ['CI/CD', /ci\/cd|jenkins|gitlab ci|github actions/i],
  ['Microservicios', /microservici/i],
  ['Kafka', /\bkafka\b/i],
  ['Firmware', /firmware/i],
  ['Embebidos', /embebid|embedded/i],
  ['FPGA', /fpga|verilog|vhdl/i],
  ['RTOS', /rtos|freertos/i],
  ['PCB', /\bpcb\b|altium|kicad/i],
  ['PLC', /\bplc\b|tia portal|allen.?bradley/i],
  ['IoT', /\biot\b/i],
  ['MATLAB', /matlab|simulink/i],
  ['Linux', /\blinux\b/i],
]

const ELECTRONICS = /firmware|embebid|embedded|electr[óo]nic|automatiz|\bplc\b|\biot\b|\bpcb\b|rob[óo]tic|instrument|hardware|telecom|fpga|rtos/i

const stripRefs = (text) =>
  text
    .replace(/\s*\|\s*REF#?\s*\d+/gi, '')
    .replace(/\s*[-–]\s*REF\s*#?\d+/gi, '')
    .trim()

const parseSalary = (raw) => {
  if (!raw) return { salaryText: null, salaryMin: null, salaryMax: null }
  const numbers = [...raw.matchAll(/[\d][\d,.]*/g)]
    .map((match) => Number(match[0].replace(/[,.]/g, '')))
    .filter((value) => Number.isFinite(value) && value > 1000)
  if (numbers.length === 0) return { salaryText: raw, salaryMin: null, salaryMax: null }

  const annual = /\/\s*yr|\/\s*year|annual|año/i.test(raw)
  const toMillions = (value) => Number(((annual ? value / 12 : value) / 1_000_000).toFixed(4))
  const min = toMillions(Math.min(...numbers))
  const max = toMillions(Math.max(...numbers))

  return {
    salaryText: min === max ? `$${min}M COP` : `$${min} – ${max}M COP`,
    salaryMin: min,
    salaryMax: max,
  }
}

const parseMode = (text) => {
  if (/h[íi]brido|hybrid/i.test(text)) return 'Híbrido'
  if (/remoto|remote|teletrabajo|work from home|home ?office/i.test(text)) return 'Remoto'
  if (/presencial|on-?site|en sitio/i.test(text)) return 'Presencial'
  return 'No especifica'
}

const cityOf = (location) => {
  if (!location) return 'Colombia'
  const first = location.split(',')[0].trim()
  return /^(colombia)$/i.test(first) ? 'Colombia' : first
}

const extractStack = (text) => {
  const found = []
  for (const [label, pattern] of STACK) {
    if (found.length >= 6) break
    if (pattern.test(text) && !found.includes(label)) found.push(label)
  }
  return found
}

const raw = JSON.parse(readFileSync(resolve(inputPath), 'utf8'))

const dropped = { irrelevant: 0, noTitle: 0, noUrl: 0 }
const seen = new Map()
let duplicates = 0

for (const item of raw) {
  const rawTitle = (item.title ?? '').trim()
  if (!rawTitle) {
    dropped.noTitle += 1
    continue
  }
  if (!item.url) {
    dropped.noUrl += 1
    continue
  }
  if (DROP.test(rawTitle) || !KEEP.test(rawTitle)) {
    dropped.irrelevant += 1
    continue
  }

  const title = stripRefs(rawTitle)
  const company = (item.companyName ?? 'Confidencial').trim()
  const key = `${company.toLowerCase()}::${title.toLowerCase()}`

  const description = item.descriptionText ?? ''
  const haystack = `${title} ${description}`
  const stack = extractStack(haystack)
  const { salaryText, salaryMin, salaryMax } = parseSalary(item.salary)

  const candidate = {
    id: `li-${item.id}`,
    title,
    company,
    city: cityOf(item.location),
    track: ELECTRONICS.test(title) ? 'electronics' : 'dev',
    stack,
    stackInferred: true,
    salaryText: salaryText ?? 'No publica',
    salaryMin,
    salaryMax,
    mode: parseMode(haystack),
    contract: item.employmentType ? String(item.employmentType) : 'No especifica',
    publishedAt: item.postedAtDate ?? null,
    source: 'LinkedIn',
    url: item.url,
  }

  const previous = seen.get(key)
  if (previous) {
    duplicates += 1
    const newer =
      (candidate.publishedAt ?? '') > (previous.publishedAt ?? '') ? candidate : previous
    seen.set(key, newer)
  } else {
    seen.set(key, candidate)
  }
}

const jobs = [...seen.values()].sort(
  (a, b) =>
    (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '') || a.title.localeCompare(b.title),
)

const dev = jobs.filter((job) => job.track === 'dev').length
const electronics = jobs.length - dev
const withSalary = jobs.filter((job) => job.salaryMax !== null).length
const withStack = jobs.filter((job) => job.stack.length > 0).length
const modes = jobs.reduce((acc, job) => ({ ...acc, [job.mode]: (acc[job.mode] ?? 0) + 1 }), {})

console.log('=== DIAGNÓSTICO ===')
console.log('entrada                :', raw.length)
console.log('descartados por título :', dropped.irrelevant)
console.log('sin título / sin url   :', dropped.noTitle, '/', dropped.noUrl)
console.log('duplicados colapsados  :', duplicates)
console.log('salida                 :', jobs.length)
console.log('  desarrollo           :', dev)
console.log('  electrónica          :', electronics)
console.log('  con sueldo           :', withSalary)
console.log('  con stack detectado  :', withStack)
console.log('  modalidad            :', modes)
console.log('top empresas           :', Object.entries(
  jobs.reduce((acc, job) => ({ ...acc, [job.company]: (acc[job.company] ?? 0) + 1 }), {}),
).sort((a, b) => b[1] - a[1]).slice(0, 6))

if (!WRITE) {
  console.log('\n(dry run: nada escrito. Agregá --write para generar src/data/linkedin.ts)')
  process.exit(0)
}

const body = jobs
  .map(
    (job) => `  {
    id: ${JSON.stringify(job.id)},
    title: ${JSON.stringify(job.title)},
    company: ${JSON.stringify(job.company)},
    city: ${JSON.stringify(job.city)},
    track: ${JSON.stringify(job.track)},
    stack: ${JSON.stringify(job.stack)},
    stackInferred: true,
    salaryText: ${JSON.stringify(job.salaryText)},
    salaryMin: ${JSON.stringify(job.salaryMin)},
    salaryMax: ${JSON.stringify(job.salaryMax)},
    mode: ${JSON.stringify(job.mode)},
    contract: ${JSON.stringify(job.contract)},
    publishedAt: ${JSON.stringify(job.publishedAt)},
    source: 'LinkedIn',
    url: ${JSON.stringify(job.url)},
  },`,
  )
  .join('\n')

const file = `/**
 * GENERADO por scripts/build-linkedin.mjs — no editar a mano.
 *
 * Origen: Apify \`automation-lab/linkedin-jobs-scraper\`, run \`i9RMGEmfI1mTcYqYY\`,
 * dataset \`bIfR6YXqGWsAbWbv2\` (300 registros, scrape ${REFERENCE_DATE}).
 * ${raw.length} crudos → ${jobs.length} tras filtro de relevancia y dedupe.
 *
 * Carencias del origen, normalizadas acá:
 * - \`salary\`: sólo 2 de 300 lo publican; el resto queda «No publica».
 * - \`workplaceType\`: null en los 300 → la modalidad se infiere del texto.
 * - \`seniorityLevel\`: descartado, etiqueta «Senior Embedded Engineer» como Entry level.
 * - \`stack\`: detectado por diccionario explícito sobre título + descripción.
 */

import type { Job } from './jobs'

export const linkedinJobs: Job[] = [
${body}
]
`

writeFileSync(resolve('src/data/linkedin.ts'), file, 'utf8')
console.log('\nescrito: src/data/linkedin.ts (' + jobs.length + ' registros)')
