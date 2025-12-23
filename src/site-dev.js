#!/usr/bin/env node

import inquirer from 'inquirer'
import inquirerSearchList from 'inquirer-search-list'
import shell from 'shelljs'
import { sites } from './sites.js'

// Registrar el plugin de búsqueda
inquirer.registerPrompt('search-list', inquirerSearchList)

async function main() {
  const siteArg = process.argv[2]

  if (siteArg) {
    const site = sites.find(s => s.subdomain === siteArg)
    if (site) {
      await runVitepress(site.baseDir)
    }
    else {
      console.error(`Site with subdomain "${siteArg}" not found.`)
      process.exit(1)
    }
  }
  else {
    const selectedSite = await selectSite()
    await runVitepress(selectedSite.baseDir)
  }
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
      message: 'Selecciona un sitio para desarrollar:',
      choices,
      pageSize: 10,
    },
  ])

  return site
}

async function runVitepress(baseDir) {
  const workdir = process.cwd()
  console.log(`Running VitePress for site in ${workdir}${baseDir}...`)
  const { stdout, stderr } = shell.exec(`pnpx vitepress dev ${workdir}${baseDir}`)
  console.log(stdout)
  if (stderr) {
    console.error(stderr)
  }
}

main().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
