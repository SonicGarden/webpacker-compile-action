import * as cache from '@actions/cache'
import * as core from '@actions/core'
import slugify from '@sindresorhus/slugify'
import execa from 'execa'

async function run(): Promise<void> {
  try {
    const {stdout: digest} = await execa(
      'bundle',
      [
        'exec',
        'rails',
        'runner',
        'puts Webpacker.compiler.send(:watched_files_digest)'
      ],
      {
        env: {
          RAILS_ENV: 'test',
          DISABLE_SPRING: '1'
        }
      }
    )

    const compileCommand = core.getInput('compileCommand', {
      required: true
    })
    const paths = core.getInput('cachePaths', {required: true}).split('\n')

    const key = [
      core.getInput('cacheKeyPrefix', {required: true}),
      process.env.RAILS_ENV || 'development',
      slugify(compileCommand),
      digest
    ].join('-')

    const cacheKey = await cache.restoreCache(paths, key)
    const cacheHit = !!cacheKey
    core.setOutput('cache-hit', cacheHit.toString())

    if (cacheKey) {
      core.debug(`cache hit: ${cacheKey}`)
      return
    }

    await execa.command(compileCommand)

    // Error handling from https://github.com/actions/cache/blob/master/src/save.ts
    core.info('Saving cache')
    try {
      await cache.saveCache(paths, key)
    } catch (error) {
      if (error.name === cache.ValidationError.name) {
        throw error
      } else if (error.name === cache.ReserveCacheError.name) {
        core.info(error.message)
      } else {
        core.info(`[warning]${error.message}`)
      }
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
