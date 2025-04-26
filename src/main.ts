import type { Site } from './types.ts'
import { dirname, join } from 'node:path'
import fs from 'fs-extra'
import { sites } from './sites.js'

export async function main(): Promise<number> {
  for (const site of sites) {
    await cleanTemplateDir(site)
    await copyTemplateDir(site)
    await updateConfig(site)
    await updateIndex(site)
    await updateNetlifyToml(site)
    await createSpec(site)
    await transformSpec(site)
  }

  await transformList(sites)
  await writeList(sites)

  return 0
}

async function cleanTemplateDir() {
  const templateDir = join(__dirname, 'template')

  if (await fs.pathExists(join(templateDir, 'node_modules'))) {
    await fs.remove(join(templateDir, 'node_modules'))
  }
}

async function copyTemplateDir(site: Site) {
  const src = join(__dirname, 'template')
  const dest = join(__dirname, '..', site.baseDir)

  await fs.copy(src, dest)
}

async function updateConfig(site: Site) {
  const configPath = join(__dirname, '..', site.baseDir, '.vitepress', 'config.ts')
  const config = await fs.readFile(configPath, 'utf-8')

  const newConfig = config
    .replace('{{domain}}', site.name)
    .replace('{{description}}', site.description)

  await fs.writeFile(configPath, newConfig)
}

async function updateIndex(site: Site) {
  const indexPath = join(__dirname, '..', site.baseDir, 'index.md')
  const index = await fs.readFile(indexPath, 'utf-8')

  const newIndex = index
    .replace('{{name}}', site.name)

  await fs.writeFile(indexPath, newIndex)
}

async function updateNetlifyToml(site: Site) {
  const netlifyTomlPath = join(__dirname, '..', site.baseDir, 'netlify.toml')
  const netlifyToml = await fs.readFile(netlifyTomlPath, 'utf-8')

  const newNetlifyToml = netlifyToml
    .replace('{{baseDir}}', site.baseDir)

  await fs.writeFile(netlifyTomlPath, newNetlifyToml)
}

async function createSpec(site: Site) {
  const response = await fs.readFile(site.specUrl, 'utf-8')

  const specPath = join(__dirname, '..', site.baseDir, 'public', 'openapi.json')

  await fs.ensureDir(dirname(specPath))

  await fs.writeFile(specPath, response)
}

async function transformSpec(site: Site) {
  const specPath = join(__dirname, '..', site.baseDir, 'public', 'openapi.json')
  const spec = await fs.readJson(specPath)

  if (await fs.pathExists(join(__dirname, 'transformers', `${site.subdomain}.transformer.ts`))) {
    const transformer = await import(join(__dirname, 'transformers', `${site.subdomain}.transformer.ts`))
    const newSpec = await transformer.transform(spec)

    await fs.writeJson(specPath, newSpec, { spaces: 2 })
  }
}

async function transformList(sites: Site[]) {
  const sitesGroupedByTag: any[] = sites.reduce((acc, site) => {
    site.tags.forEach((tag) => {
      if (!acc[tag]) {
        acc[tag] = []
      }

      acc[tag].push(site)
    })

    return acc
  }, {})

  const listPath = join(__dirname, '..', 'docs', 'lista.md')

  const newContent = `# apidocs.ar
  
Lista de documentaciones de APIs públicas.
${Object.entries(sitesGroupedByTag).map(([tag, sites]) => {
  return `
## ${tag}

${sites.map((site) => {
  return `- [${site.description}](https://${site.subdomain}.apidocs.ar)`
}).join('\n')}
`
}).join('')}`

  await fs.writeFile(listPath, newContent)
}

async function writeList(sites: Site[]) {
  const listPathTs = join(__dirname, '..', 'docs', 'lista.ts')
  const newContentTs = `export const sites = ${JSON.stringify(sites, null, 2)}`
  await fs.writeFile(listPathTs, newContentTs)
}
