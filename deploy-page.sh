npm run build
cd dist
git init
git add -A
git commit -m 'deploy'
git push -f https://github.com/mkathc/tesis-niveles-app.git  master:gh-pages