import cache from '@actions/cache'
import * as core from '@actions/core'
import execa from 'execa'

async function run(): Promise<void> {
  try {
    const cacheKeyPrefix: string = core.getInput('cacheKeyPrefix')
    const {stdout} = await execa.command(
      "bundle exec rails runner 'puts Webpacker.compiler.send(:watched_files_digest)'"
    )
    const key = `${cacheKeyPrefix}-${stdout}`

    const paths = ['tmp/cache/webpacker', 'public/packs', 'public/packs-test']

    const cacheKey = await cache.restoreCache(paths, key)
    if (cacheKey) {
      core.debug(`cache hit: ${cacheKey}`)
      return
    }

    await execa.command('bundle exec rake webpacker:compile')
    const cacheId = await cache.saveCache(paths, key)
    core.debug(`cache saved: ${cacheId}`)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
