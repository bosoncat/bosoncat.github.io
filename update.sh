vuepress build
cd .vuepress/dist
git init
git add -A
git commit -m 'init'
git push -f https://github.com/higuoxing/higuoxing.github.io.git master
cd ../..
git add -A
git commit -m 'init'
git push -u origin dev-vue
