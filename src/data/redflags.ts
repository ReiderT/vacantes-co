/**
 * Red flags detectadas sobre el mismo corpus de la corrida Apify del 2026-11-03.
 *
 * Cada flag exige `evidence`: un fragmento VERBATIM de la oferta (descripción o
 * campos estructurados del portal). Una red flag sin cita es una opinión, no un
 * hallazgo. Las descripciones de Computrabajo ya estaban en el dataset pagado;
 * no hizo falta ninguna corrida extra.
 */

import type { Source } from './jobs'

export type FlagCode =
  | 'sales-disguised'
  | 'age-discrimination'
  | 'salary-contradiction'
  | 'malformed-salary'
  | 'salary-hidden'
  | 'experience-vs-pay'
  | 'role-stuffing'
  | 'responsibility-overload'
  | 'mileage-as-pay'
  | 'own-vehicle'
  | 'saturday-work'
  | 'stale-posting'
  | 'empty-requirement'
  | 'mislabeled'

export interface FlagMeta {
  label: string
  severity: 'high' | 'medium'
  explain: string
}

export const FLAG_META: Record<FlagCode, FlagMeta> = {
  'sales-disguised': {
    label: 'Venta disfrazada de desarrollo',
    severity: 'high',
    explain:
      'El título dice «desarrollador» y la descripción describe venta en calle: ruta, tenderos, metas de colocación y foto-reporte con GPS.',
  },
  'age-discrimination': {
    label: 'Discriminación por edad',
    severity: 'high',
    explain:
      'La oferta fija un rango de edad como requisito. En Colombia el edad es criterio sospechoso de discriminación y no es un requisito laboral legítimo.',
  },
  'salary-contradiction': {
    label: 'El sueldo del texto no es el del portal',
    severity: 'high',
    explain:
      'La descripción declara una cifra y el campo de salario publicado por el portal dice otra. Una de las dos es falsa, y el candidato la descubre después de postularse.',
  },
  'malformed-salary': {
    label: 'Sueldo ilegible',
    severity: 'high',
    explain:
      'La cifra está mal escrita: falta un separador o un dígito, así que el monto puede leerse como uno o como diez veces otro.',
  },
  'salary-hidden': {
    label: 'Seniority alto, sueldo oculto',
    severity: 'medium',
    explain:
      'Se exigen años de experiencia y un stack amplio, pero el monto no se publica. La asimetría de información es toda del empleador.',
  },
  'experience-vs-pay': {
    label: 'Experiencia desproporcionada al sueldo',
    severity: 'medium',
    explain:
      'Años de experiencia, título profesional y responsabilidades de coordinación a cambio de un salario cercano al mínimo legal.',
  },
  'role-stuffing': {
    label: 'Varios cargos en un solo título',
    severity: 'medium',
    explain:
      'El título acumula dos o más cargos distintos con «/». Una sola persona, dos o tres puestos, un solo sueldo.',
  },
  'responsibility-overload': {
    label: 'Responsabilidades y requisitos inflados',
    severity: 'medium',
    explain:
      'La lista de responsabilidades y la de requisitos son tan largas que describen un equipo, no una vacante.',
  },
  'mileage-as-pay': {
    label: 'El rodamiento cuenta como salario',
    severity: 'medium',
    explain:
      'El reembolso de transporte se suma al «potencial mensual» como si fuera remuneración. No lo es: es un costo que la persona adelanta.',
  },
  'own-vehicle': {
    label: 'Exige vehículo propio',
    severity: 'medium',
    explain:
      'La moto propia es requisito indispensable para un cargo que paga sueldo base de nivel mínimo.',
  },
  'saturday-work': {
    label: 'Sábados laborables',
    severity: 'medium',
    explain:
      'La jornada incluye sábados, a veces cada 15 días, sin que el sueldo publicado lo compense.',
  },
  'stale-posting': {
    label: 'Vacante vieja todavía abierta',
    severity: 'medium',
    explain:
      'La oferta lleva más de un mes publicada y sigue listada. O el proceso está trabado, o el aviso se recicla para cosechar hojas de vida.',
  },
  'empty-requirement': {
    label: 'Requisito publicado vacío',
    severity: 'medium',
    explain:
      'El portal imprime «años de experiencia» sin el número. No se puede saber qué se exige, y el filtro del candidato tampoco.',
  },
  mislabeled: {
    label: 'Puesto mal etiquetado',
    severity: 'medium',
    explain:
      'El aviso aparece bajo «desarrollador» o «programador» pero la descripción es planeación administrativa, logística o ventas.',
  },
}

export interface RedFlagItem {
  /** Presente cuando la oferta también existe en `jobs.ts`. */
  jobId?: string
  title: string
  company: string
  city: string
  source: Source
  url: string
  salaryText: string
  publishedAt: string | null
  flags: { code: FlagCode; evidence: string }[]
}

export const redFlags: RedFlagItem[] = [
  {
    title: 'Programador (A) de Producción Metalmecánico / Industrial',
    company: 'Confidencial',
    city: 'Bogotá',
    source: 'Computrabajo',
    url: 'https://co.computrabajo.com/ofertas-de-trabajo/oferta-de-trabajo-de-programador-a-de-produccion-metalmecanico-industrial-en-bogota-dc-FCFA47C0F5153F9A61373E686DCF3405',
    salaryText: '$1.750.905',
    publishedAt: '2026-10-01',
    flags: [
      {
        code: 'age-discrimination',
        evidence: 'Edad: entre 25 y 40 años',
      },
      {
        code: 'salary-contradiction',
        evidence:
          'La descripción dice «Salario: $3.000.000 + prestaciones de ley» y el campo de salario del portal publica «$ 1.750.905,00 (Mensual)».',
      },
      {
        code: 'experience-vs-pay',
        evidence:
          '«Mínimo 3 años de experiencia en planeación, programación y control de producción en planta» + «Profesional en Ingeniería Industrial, Producción, Mecánica…» por $1.750.905.',
      },
    ],
  },
  {
    title: 'Desarrollador Comercial // Representante de ventas // Preventista // Vendedor tat',
    company: 'Nases EST (Altipal)',
    city: 'Cali',
    source: 'Computrabajo',
    url: 'https://co.computrabajo.com/ofertas-de-trabajo/oferta-de-trabajo-de-desarrollador-comercialrepresentante-de-ventaspreventistavendedor-tat-cali-en-cali-1E73A4C74855C21A61373E686DCF3405',
    salaryText: '$2.691.000',
    publishedAt: '2026-10-01',
    flags: [
      {
        code: 'role-stuffing',
        evidence:
          'Cuatro cargos en el título, separados por «//»: Desarrollador Comercial // Representante de ventas // Preventista // Vendedor tat.',
      },
      {
        code: 'own-vehicle',
        evidence:
          '«Es indispensable que los candidatos cuenten con medio de movilidad (moto) y documentos al día.»',
      },
      {
        code: 'saturday-work',
        evidence: '«Sábados cada 15 días (Ruta: 8:00 a.m. a 12:00 m. / Capacitaciones: 7:00 a.m. a 11:00 a.m.).»',
      },
      {
        code: 'experience-vs-pay',
        evidence:
          'Sueldo básico «$1.750.905» + comisiones que no están garantizadas más allá de dos meses: «Comisión garantizada al 80% los primeros 2 meses».',
      },
    ],
  },
  {
    title: 'Desarrollador / Asesor Comercial con Moto',
    company: 'ALO CREDIT COLOMBIA SAS',
    city: 'Bogotá',
    source: 'Computrabajo',
    url: 'https://co.computrabajo.com/ofertas-de-trabajo/oferta-de-trabajo-de-desarrollador-asesor-comercial-con-moto-ventas-en-bogota-dc-8C4CD3D6B82F2DD461373E686DCF3405',
    salaryText: '$2.000.000',
    publishedAt: '2026-10-28',
    flags: [
      {
        code: 'sales-disguised',
        evidence:
          '«Recorrer tu zona en moto, visitar tenderos y multimarcas» · «Reportar tu gestión. Foto-reporte y GPS por visita.»',
      },
      {
        code: 'own-vehicle',
        evidence: '«Moto propia con documentos al día. Aquí se paga rodamiento porque la moto es indispensable.»',
      },
      {
        code: 'saturday-work',
        evidence: '«Lunes a viernes 9am-6pm sábados 9am-2pm.»',
      },
    ],
  },
  {
    title: 'Vendedor / Desarrollador Comercial con Moto',
    company: 'ALO CREDIT COLOMBIA SAS',
    city: 'Cúcuta',
    source: 'Computrabajo',
    url: 'https://co.computrabajo.com/ofertas-de-trabajo/oferta-de-trabajo-de-vendedor-desarrollador-comercial-con-moto-en-cucuta-AAD36377FDF96FF061373E686DCF3405',
    salaryText: '$2.000.000',
    publishedAt: '2026-10-29',
    flags: [
      {
        code: 'sales-disguised',
        evidence:
          '«Como DESARROLLADOR para el CANAL CUENTAS CORPORATIVAS 100% en calle · Moto propia» y luego «Informe diario de visitas… Ubicación y foto-reporte como evidencia de ruta».',
      },
      {
        code: 'mileage-as-pay',
        evidence:
          'Desglose: «Salario base: $2.000.000 · Variable: hasta $800.000 por cumplimiento · Rodamiento: $300.000 · Potencial mensual: $3.100.000». El rodamiento es reembolso de costos, no remuneración.',
      },
    ],
  },
  {
    title: 'Ejecutivos comerciales / Desarrolladora de negocios / asesoras externas / Ejecutivas de cuentas',
    company: 'Grupo Soluciones Horizonte',
    city: 'Bogotá',
    source: 'Computrabajo',
    url: 'https://co.computrabajo.com/ofertas-de-trabajo/oferta-de-trabajo-de-ejecutivos-comerciales-desarrolladora-de-negocios-asesoras-externas-ejecutivas-de-cuentas-contrato-indefinido-en-bogota-dc-32723EB9B01D4A6761373E686DCF3405',
    salaryText: '$4.000.000',
    publishedAt: '2026-11-02',
    flags: [
      {
        code: 'malformed-salary',
        evidence:
          '«Salario base de $1.750095» — sin separador de miles ni decimales, ilegible: puede ser $1.750.095 o $17.500.950.',
      },
      {
        code: 'mileage-as-pay',
        evidence:
          '«un auxilio de transporte de $249.000+ Rodamiento $ 700000+ comisiones sin techo (a partir de $3.600.000+…)». El portal publica $4.000.000 como sueldo.',
      },
      {
        code: 'role-stuffing',
        evidence:
          'Cuatro denominaciones en el título: Ejecutivos comerciales / Desarrolladora de negocios / asesoras externas / Ejecutivas de cuentas.',
      },
    ],
  },
  {
    title: 'Desarrollador Oracle NetSuite e Integraciones API',
    company: 'Latin Promo Multimedia S.A.S',
    city: 'Medellín',
    source: 'Computrabajo',
    url: 'https://co.computrabajo.com/ofertas-de-trabajo/oferta-de-trabajo-de-desarrollador-oracle-netsuite-e-integraciones-api-tiempo-completo-presencialremoto-en-medellin-4320E8B19DA23B2561373E686DCF3405',
    salaryText: 'No publica',
    publishedAt: '2026-09-23',
    flags: [
      {
        code: 'responsibility-overload',
        evidence:
          '11 responsabilidades (SuiteScript, SuiteTalk, RESTlets, APIs REST/SOAP, pagos, contabilidad, documentación, arquitectura…) contra 12 requisitos, incluido «Experiencia avanzada» e «Inglés técnico».',
      },
      {
        code: 'salary-hidden',
        evidence:
          '«4 años de experiencia» + «Experiencia comprobada trabajando con Oracle NetSuite» + «proyectos de alta complejidad técnica» → el campo de salario del portal está vacío.',
      },
    ],
  },
  {
    title: 'Desarrollador Microsoft Power Platform Semi Senior',
    jobId: 'itera-power-platform',
    company: 'Itera Colombia S.A.S',
    city: 'Bogotá',
    source: 'Computrabajo',
    url: 'https://co.computrabajo.com/ofertas-de-trabajo/oferta-de-trabajo-de-desarrollador-microsoft-power-platform-semi-senior-en-bogota-dc-A27C49988E93C02661373E686DCF3405',
    salaryText: 'No publica',
    publishedAt: '2026-11-02',
    flags: [
      {
        code: 'responsibility-overload',
        evidence:
          '8 responsabilidades + 4 herramientas «indispensables» + 8 «deseables» (Power BI, MuleSoft, Azure Functions, Azure OpenAI, Graph API, Azure DevOps…) + «Inglés intermedio».',
      },
      {
        code: 'salary-hidden',
        evidence:
          'Se autodenomina «Semi Senior» con ese alcance y no publica monto: el campo de salario viene vacío.',
      },
    ],
  },
  {
    title: 'Desarrollador Backend Java',
    jobId: 'ct-nttdata-java',
    company: 'NTT DATA Colombia',
    city: 'Bogotá',
    source: 'Computrabajo',
    url: 'https://co.computrabajo.com/ofertas-de-trabajo/oferta-de-trabajo-de-desarrollador-backend-java-en-bogota-dc-8FD292C45BE6E6D761373E686DCF3405',
    salaryText: 'No publica',
    publishedAt: '2026-09-15',
    flags: [
      {
        code: 'empty-requirement',
        evidence: '«Educación mínima: Universidad / Carrera Profesional años de experiencia» — el número nunca se publicó.',
      },
      {
        code: 'salary-hidden',
        evidence:
          'Pide microservicios, CI/CD, Git, pruebas unitarias y documentación técnica, y el campo de salario viene vacío.',
      },
    ],
  },
  {
    title: 'Programador de mantenimiento',
    company: 'Ocupar Temporales S.A.',
    city: 'Candelaria',
    source: 'Computrabajo',
    url: 'https://co.computrabajo.com/ofertas-de-trabajo/oferta-de-trabajo-de-programador-de-mantenimiento-villa-gorgona-candelaria-florida-pradera-en-candelaria-4FA2F36EDD05D09561373E686DCF3405',
    salaryText: '$2.400.000',
    publishedAt: '2026-11-02',
    flags: [
      {
        code: 'mislabeled',
        evidence:
          '«Programador(a) de Mantenimiento, encargado(a) de apoyar la planeación, programación y seguimiento» + «Tecnólogo(a) en carreras administrativas». Aparece bajo la búsqueda «desarrollador».',
      },
      {
        code: 'saturday-work',
        evidence: '«Lunes a sábado» · «Sábados: 8:00 a.m. a 12:00 m.» por $2.400.000.',
      },
    ],
  },
  {
    title: 'Programador de rutas de tráfico transporte de carga',
    company: 'Confidencial',
    city: 'Mosquera',
    source: 'Computrabajo',
    url: 'https://co.computrabajo.com/ofertas-de-trabajo/oferta-de-trabajo-de-programador-de-rutas-de-trafico-transporte-de-carga-control-trafico-rutas-nacionales-en-mosquera-C83D0E882E22F77461373E686DCF3405',
    salaryText: 'No publica',
    publishedAt: null,
    flags: [
      {
        code: 'mislabeled',
        evidence:
          '«Programador de tráfico»: «Experiencia en manejo de conductores», «Excelente manejo de sistemas y excel». No hay desarrollo de software en la oferta.',
      },
      {
        code: 'salary-hidden',
        evidence: '«Salario a convenir según perfil» — sin rango, sin piso, sin techo.',
      },
    ],
  },
  {
    title: 'Desarrollador/a de Mercado',
    company: 'Central Cervecera de Colombia',
    city: 'Duitama',
    source: 'Computrabajo',
    url: 'https://co.computrabajo.com/ofertas-de-trabajo/oferta-de-trabajo-de-desarrolladora-de-mercado-en-duitama-75729D005E42E52261373E686DCF3405',
    salaryText: 'No publica',
    publishedAt: '2026-09-15',
    flags: [
      {
        code: 'mislabeled',
        evidence:
          '«Desarrollador de Mercado con experiencia en productos de consumo masivo… canal tienda a tienda (TAT)». Es un cargo comercial bajo la palabra «desarrollador».',
      },
      {
        code: 'stale-posting',
        evidence: 'Publicada el 2026-09-15 y todavía abierta 49 días después del scrape.',
      },
    ],
  },
  {
    title: 'Desarrollador Comercial TAT Cali',
    company: 'ALO CREDIT COLOMBIA SAS',
    city: 'Cali',
    source: 'Computrabajo',
    url: 'https://co.computrabajo.com/ofertas-de-trabajo/oferta-de-trabajo-de-desarrollador-comercial-tat-cali-cali-en-cali-4D48627A031ABF9961373E686DCF3405',
    salaryText: '$2.000.000',
    publishedAt: '2026-10-01',
    flags: [
      {
        code: 'own-vehicle',
        evidence: '«Desarrollador comercial (Debe tener moto, aplica hombres y mujeres)» · «Indispensable contar con Moto propia.»',
      },
      {
        code: 'mileage-as-pay',
        evidence: '«Salario básico de 2.000.000 + prestaciones de ley + rodamiento de 300.000 + comisiones».',
      },
      {
        code: 'saturday-work',
        evidence: '«Horarios de Lunes a viernes entre 9:00am a 6:00pm y sábados de 9:00am a 2:00pm».',
      },
    ],
  },
  {
    title: 'Sistemas embebidos / software developer C y C++ bilingüe',
    jobId: 'el-embebidos-cc',
    company: 'Confidencial',
    city: 'Bogotá',
    source: 'elempleo',
    url: 'https://www.elempleo.com/co/ofertas-trabajo/sistemas-embebidos-o-software-developer-cc-bilingue-presencial-1886566268?trabajo=firmware',
    salaryText: '$8 – 10M',
    publishedAt: '2025-09-09',
    flags: [
      {
        code: 'stale-posting',
        evidence:
          'Publicada el 2025-09-09: 420 días antes del scrape y todavía listada como activa, con rango $8 – 10M.',
      },
    ],
  },
  {
    title: 'Desarrollador fullstack / PL-SQL / Java',
    jobId: 'el-plsql-java',
    company: 'Digital Profit Colombia S.A.S',
    city: 'Bogotá',
    source: 'elempleo',
    url: 'https://www.elempleo.com/co/ofertas-trabajo/desarrollador-fullstack-pl-sql-java-1886771585?trabajo=desarrollador',
    salaryText: 'Confidencial',
    publishedAt: '2026-09-24',
    flags: [
      {
        code: 'role-stuffing',
        evidence:
          'Tres perfiles en un título: «Desarrollador fullstack / PL-SQL / Java». Backend, base de datos y frontend en una sola persona.',
      },
      {
        code: 'salary-hidden',
        evidence: 'Los tres perfiles, y el monto viene como «Salario confidencial».',
      },
    ],
  },
  {
    title: 'Ingeniero de automatización, control, electrónico — con programación',
    company: 'Confidencial',
    city: 'Bogotá',
    source: 'Computrabajo',
    url: 'https://co.computrabajo.com/ofertas-de-trabajo/oferta-de-trabajo-de-ingeniero-de-automatizacion-control-electronico-o-afin-con-experiencia-en-programacion-disponibilidad-inmediata-en-bogota-dc-B46D0838F4980ED861373E686DCF3405',
    salaryText: '$7.000.000',
    publishedAt: null,
    flags: [
      {
        code: 'role-stuffing',
        evidence:
          'Título de 14 palabras que cubre tres disciplinas y cierra con «disponibilidad inmediata»: automatización, control y electrónica «o afín con experiencia en programación».',
      },
    ],
  },
]

export const flagSummary = (() => {
  const counts = new Map<FlagCode, number>()
  for (const item of redFlags) {
    for (const flag of item.flags) {
      counts.set(flag.code, (counts.get(flag.code) ?? 0) + 1)
    }
  }
  const ordered = [...counts.entries()]
    .map(([code, count]) => ({ code, count, ...FLAG_META[code] }))
    .sort((a, b) => (a.severity === b.severity ? b.count - a.count : a.severity === 'high' ? -1 : 1))
  return {
    ordered,
    offers: redFlags.length,
    high: redFlags.filter((item) => item.flags.some((f) => FLAG_META[f.code].severity === 'high')).length,
    total: redFlags.reduce((sum, item) => sum + item.flags.length, 0),
  }
})()

/** Cobertura del corpus: cuántas de las 56 vacantes curadas no publican monto. */
export const salaryHiddenShare = { hidden: 24, total: 56 }
