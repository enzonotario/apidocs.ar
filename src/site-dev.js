#!/usr/bin/env node

import { execSync } from 'node:child_process'
import shell from 'shelljs'
import { sites } from './sites.js'

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
  console.log('Select a site to run:')
  sites.forEach((site, index) => {
    console.log(`${index + 1}. ${site.name} (${site.subdomain})`)
  })

  const { stdout } = execSync('read -p "Enter the number of the site: " input; echo $input', { shell: '/bin/bash' })
  const selectedIndex = Number.parseInt(stdout.trim(), 10) - 1

  if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= sites.length) {
    console.error('Invalid selection.')
    process.exit(1)
  }

  return sites[selectedIndex]
}

async function runVitepress(baseDir) {
  console.log(`Running VitePress for site in ${baseDir}...`)
  const { stdout, stderr } = shell.exec(`pnpx vitepress dev ${baseDir}`)
  console.log(stdout)
  if (stderr) {
    console.error(stderr)
  }
}

main().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
