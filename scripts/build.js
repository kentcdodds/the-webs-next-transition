const { runInDirs } = require('./utils')

const [, , ...dirs] = process.argv
runInDirs('npm run --if-present build', dirs)
