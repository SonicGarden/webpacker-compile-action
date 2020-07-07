# Webpacker Compile

Webpacker compile with cache

## Usage:

### Inputs

- `cacheKeyPrefix` - Cache key prefix. (default: `webpacker-compile`)

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

      - name: Setup database
        run: |
          bundle exec rake db:create
          bundle exec rake db:schema:load

      - name: Run rspec
        run: bin/rspec
```
