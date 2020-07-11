# Webpacker Compile

Webpacker compile with cache

## Usage:

### Inputs

- `cacheKeyPrefix` - Cache key prefix. (default: `webpacker-compile`)
- `compileCommand` - Webpacker compile command. (default: `bin/rake webpacker:compile`)
- `cachePaths` - Cache pahts. (default: `public/packs\npublic/packs-test\ntmp/cache/webpacker`)

## Example

```yaml
on:
  pull_request:

jobs:
  rspec:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Set up Ruby
        uses: ruby/setup-ruby@v1
        with:
          bundler-cache: true

      - name: Set up Node.js
        uses: actions/setup-node@v1
        with:
          node-version: 10

      - name: Install Node.js dependencies
        run: yarn install --check-files

      - uses: SonicGarden/webpacker-compile-action@v1
        id: webpacker-compile

      - name: Setup database
        run: |
          bundle exec rake db:create
          bundle exec rake db:schema:load

      - name: Run rspec
        run: bin/rspec

      - name: size-limit
        if: steps.webpacker-compile.outputs.cache-hit != 'true'
        run: yarn size-limit
```
