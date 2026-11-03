# vacantes-co

Radar de vacantes de desarrollo, firmware e ingeniería electrónica en Colombia, publicado como sitio estático con filtros del lado del cliente.

**Sitio**: https://reidert.github.io/vacantes-co/

## Qué es

Una foto (snapshot) del mercado tomada el **2026-11-03** con Apify, sobre dos portales reales de Colombia:

| Portal | Actor | Dataset |
|---|---|---|
| Computrabajo Colombia | `santamaria-automations/computrabajo-scraper` | `R6gRwTEqy2aQ8O7wG` (43 crudos) |
| elempleo.com | `corvuslab/elempleo-scraper` | `cFlHn2kJeADYCign2`, `3IpOJY0uXihY0aAnt`, `Qop4Vr6RoeCgqxA3c` (63 crudos) |

106 registros crudos → **56 vacantes técnicas curadas**. Se excluyeron los roles comerciales que Computrabajo archiva bajo «desarrollador» («Desarrollador Comercial», «Desarrollador de Mercado») y los planificadores de mantenimiento de planta («Programador de mantenimiento»).

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
├─ data/jobs.ts              dataset tipado + daysAgo / isThisWeek / isFirmware
├─ styles/global.css         tokens de marca (Tailwind v4 @theme) + fuentes
├─ layouts/Base.astro        theme boot sin flash, circuito SVG, header, footer
├─ components/
│  ├─ JobCard.astro          tarjeta con 12 data-* para el filtrado
│  ├─ FilterPanel.astro      búsqueda, 5 grupos de chips, orden, URL state
│  ├─ StatsBar.astro
│  ├─ SectionHeader.astro
│  └─ ThemeToggle.astro
├─ scripts/reveal.ts
└─ pages/index.astro
```

## Filtros

Client-side puro, sin islas de framework. El estado vive en la URL:

```
?q=firmware&track=electronics&mode=Remoto&source=elempleo&window=week&salary=only&sort=salary-desc
```

- **Rol**: Desarrollo · Electrónica
- **Modalidad**: Remoto · Híbrido · Presencial · No especifica
- **Portal**: Computrabajo · elempleo
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
