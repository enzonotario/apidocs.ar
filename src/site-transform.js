#!/usr/bin/env node

import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'fs-extra'
import inquirer from 'inquirer'
import inquirerSearchList from 'inquirer-search-list'
import { sites } from './sites.js'

inquirer.registerPrompt('search-list', inquirerSearchList)

const __dirname = dirname(fileURLToPath(import.meta.url))

async function main() {
  const siteArg = process.argv[2]

  let site
  if (siteArg) {
    site = sites.find(s => s.subdomain === siteArg)
    if (!site) {
      console.error(`Site with subdomain "${siteArg}" not found.`)
      process.exit(1)
    }
  }
  else {
    site = await selectSite()
  }

  await transformSpec(site)
}

async function selectSite() {
  const choices = sites.map(site => ({
    name: `${site.name} (${site.subdomain})${site.description ? ` - ${site.description}` : ''}`,
    value: site,
    short: site.name,
  }))

  const { site } = await inquirer.prompt([
    {
      type: 'search-list',
      name: 'site',
      message: 'Selecciona un sitio para transformar:',
      choices,
      pageSize: 10,
    },
  ])

  return site
}

async function transformSpec(site) {
  const specPath = join(__dirname, '..', site.baseDir, 'public', 'openapi.json')

  if (!await fs.pathExists(specPath)) {
    console.error(`openapi.json not found at ${specPath}`)
    process.exit(1)
  }

  const transformerPath = join(__dirname, 'transformers', `${site.subdomain}.transformer.ts`)

  if (!await fs.pathExists(transformerPath)) {
    console.log(`No transformer found for "${site.subdomain}", skipping.`)
    return
  }

  const spec = await fs.readJson(specPath)
  const transformer = await import(transformerPath)
  const newSpec = await transformer.transform(spec)

  await fs.writeJson(specPath, newSpec, { spaces: 2 })
  console.log(`✓ Transformed spec for "${site.name}" → ${specPath}`)
}

main().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
