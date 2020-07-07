import * as cache from '@actions/cache'
import * as core from '@actions/core'
import execa from 'execa'

async function run(): Promise<void> {
  try {
    const cacheKeyPrefix: string = core.getInput('cacheKeyPrefix', {
      required: true
    })
    const {stdout: digest} = await execa('bundle', [
      'exec',
      'rails',
      'runner',
      'puts Webpacker.compiler.send(:watched_files_digest)'
    ])

    const railsEnv = process.env.RAILS_ENV || 'development'
    const key = `${cacheKeyPrefix}-${railsEnv}-${digest}`

    const paths = ['public/packs', 'public/packs-test']

    const cacheKey = await cache.restoreCache(paths, key)
    const cacheHit = !!cacheKey
    core.setOutput('cache-hit', cacheHit.toString())

    if (cacheKey) {
      core.debug(`cache hit: ${cacheKey}`)
      return
    }

    await execa('bin/webpack')
    const cacheId = await cache.saveCache(paths, key)
    core.debug(`cache saved: ${cacheId}`)
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('reserveCache failed')
    ) {
      core.warning(error.message)
    } else {
      core.setFailed(error.message)
    }
  }
}

run()
