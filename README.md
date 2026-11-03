# vacantes-co

Radar de vacantes de desarrollo, firmware e ingeniería electrónica en Colombia, publicado como sitio estático con filtros del lado del cliente.

**Sitio**: https://reidert.github.io/vacantes-co/

## Qué es

Una foto (snapshot) del mercado tomada el **2026-11-03** con Apify, sobre tres fuentes reales de Colombia:

| Portal | Actor | Dataset |
|---|---|---|
| Computrabajo Colombia | `santamaria-automations/computrabajo-scraper` | `R6gRwTEqy2aQ8O7wG` (43 crudos) |
| elempleo.com | `corvuslab/elempleo-scraper` | `cFlHn2kJeADYCign2`, `3IpOJY0uXihY0aAnt`, `Qop4Vr6RoeCgqxA3c` (63 crudos) |
| LinkedIn | `automation-lab/linkedin-jobs-scraper` | `bIfR6YXqGWsAbWbv2` (300 crudos) |

406 registros crudos → **262 vacantes técnicas curadas** (56 de Computrabajo+elempleo, 206 de LinkedIn). Se excluyeron los roles comerciales que Computrabajo archiva bajo «desarrollador» («Desarrollador Comercial», «Desarrollador de Mercado») y los planificadores de mantenimiento de planta.

**InfoJobs y Bumeran no operan en Colombia**: InfoJobs es España y Bumeran cubre siete países de LATAM sin Colombia.

## Comandos

```bash
npm install
npm run dev        # http://localhost:4321
npm run check      # astro check
npm run build      # dist/
npm run preview    # sirve dist/
```

## Estructura

```
src/
├─ data/
│  ├─ jobs.ts               dataset tipado + daysAgo / isThisWeek / isFirmware
│  ├─ linkedin.ts           GENERADO por scripts/build-linkedin.mjs (206 registros)
│  └─ redflags.ts           17 ofertas con señales, cada una con cita textual
├─ styles/global.css         tokens de marca (Tailwind v4 @theme) + fuentes
├─ layouts/Base.astro        theme boot sin flash, circuito SVG, header, footer
├─ components/
│  ├─ JobCard.astro          tarjeta con 12 data-* para el filtrado
│  ├─ FilterPanel.astro      búsqueda, 5 grupos de chips, orden, URL state
│  ├─ RedFlagCard.astro      una oferta marcada con sus citas
│  ├─ RedFlagsSection.astro  filtro por severidad y por tipo de señal
│  ├─ StatsBar.astro
│  ├─ SectionHeader.astro
│  └─ ThemeToggle.astro
├─ scripts/reveal.ts
└─ pages/index.astro

scripts/build-linkedin.mjs   normaliza el dataset crudo de LinkedIn
```

## LinkedIn: cómo se normaliza

El origen viene con carencias medidas, y el script las resuelve en vez de esconderlas:

| Problema del origen | Medición | Resolución |
|---|---|---|
| Sueldo casi nunca publicado | 2 de 300 | El resto queda «No publica» y no cuenta como dato |
| `workplaceType` nulo | 300 de 300 | Modalidad inferida del texto (remoto/híbrido/presencial) |
| `seniorityLevel` no confiable | «Senior Embedded Engineer» como *Entry level* | Campo descartado |
| Reposteo masivo | BairesDev 69 + FullStack 27 = 32% | Dedupe por empresa+título; los 61 roles distintos de BairesDev se conservan |

```bash
# regenerar (el dataset de Apify vence a los 7 días)
node scripts/build-linkedin.mjs /ruta/al/linkedin-raw.json           # dry run
node scripts/build-linkedin.mjs /ruta/al/linkedin-raw.json --write   # escribe src/data/linkedin.ts
```

## Red flags

Sección propia con **15 ofertas marcadas** y **34 señales**, cada una con una **cita verbatim** de la oferta. Una red flag sin texto que la respalde es una opinión, así que el campo `evidence` es obligatorio en `src/data/redflags.ts`.

| Señal | Qué detecta |
|---|---|
| Venta disfrazada de desarrollo | El título dice «desarrollador» y el texto describe ruta comercial con GPS |
| Discriminación por edad | La oferta fija un rango de edad como requisito |
| El sueldo del texto no es el del portal | La descripción dice una cifra y el campo del portal dice otra |
| Sueldo ilegible | Cifra mal escrita, sin separador o sin dígitos |
| Seniority alto, sueldo oculto | Años de experiencia y stack amplio, monto vacío |
| Experiencia desproporcionada al sueldo | Título profesional y 3 años por un salario cercano al mínimo |
| Varios cargos en un título | Dos o más cargos separados por «/» |
| Responsabilidades y requisitos inflados | Listas que describen un equipo, no una vacante |
| El rodamiento cuenta como salario | Reembolso de transporte sumado al «potencial mensual» |
| Exige vehículo propio | Moto propia como requisito indispensable |
| Sábados laborables | Jornada con sábados sin compensación en el sueldo |
| Vacante vieja todavía abierta | Más de un mes publicada y sigue listada |
| Requisito publicado vacío | «años de experiencia» sin el número |
| Puesto mal etiquetado | Bajo «desarrollador», pero es administración, logística o ventas |

Las descripciones de Computrabajo ya estaban en el dataset pagado, así que la sección **no costó ninguna corrida extra**.

## Filtros

Client-side puro, sin islas de framework. El estado vive en la URL:

```
?q=firmware&track=electronics&mode=Remoto&source=elempleo&window=week&salary=only&sort=salary-desc
```

- **Rol**: Desarrollo · Electrónica
- **Modalidad**: Remoto · Híbrido · Presencial · No especifica
- **Portal**: Computrabajo · elempleo · LinkedIn
- **Publicación**: Esta semana (≤7 d) · 30 días · Más de 30 días
- **Sueldo**: solo con monto publicado
- **Orden**: más recientes · mayor sueldo · menor sueldo

«Esta semana» se mide contra `REFERENCE_DATE` (la fecha del scrape), nunca contra `Date.now()`: la página es un snapshot y no debe derivar con el tiempo.

## Tipografía

| Rol | Familia | Nota |
|---|---|---|
| Display: H1, H2, métricas, eyebrows, badges | **Geist Pixel** | sólo existe peso 400 → nunca `font-extrabold` (el bold sintético embarra una fuente de píxeles) |
| Prosa, títulos de tarjeta, chips, controles | **Rubik Variable** | 300–800 |
| Sueldos, fechas, contadores | **Geist Mono Variable** | cifras alineadas |

Geist Pixel **no está en Google Fonts** (la API responde `400: Font family not found`); viene por `@fontsource/geist-pixel`.

## Deploy

GitHub Pages vía Actions (`.github/workflows/deploy.yml`). El build de CI pasa `BASE_PATH=/vacantes-co` porque un *project site* vive en un subpath; sin eso los assets dan 404. Local usa `/`.

## Límites conocidos

- Los filtros de fecha de ambos Actors fallan: `elempleo` reportó «Posted within: Last 7 days» y devolvió una oferta del 9-sep-2025. El recorte se hace del lado del cliente.
- Ningún portal expone habilidades como campo: el stack se infiere del título (`stackInferred` en el dataset) o de los tags de Computrabajo.
- El filtro interactivo no tiene test automatizado; la verificación fue una corrida de navegador con 8 aserciones.
