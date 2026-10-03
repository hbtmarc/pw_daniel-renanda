#!/bin/sh
# Gera os bundles minificados usados pelo index.html (GitHub Pages serve os arquivos como estão).
# Uso: sh scripts/build.sh   (requer Node; usa npx esbuild)
set -e
cd "$(dirname "$0")/.."
node scripts/check-prices.mjs
npx --yes esbuild@0.25.10 assets/css/main.css --bundle --minify --external:../fonts/* --outfile=assets/css/styles.min.css
npx --yes esbuild@0.25.10 assets/js/entry.js --bundle --minify --format=iife --target=es2019 --outfile=assets/js/app.min.js
