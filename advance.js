const fsExtra = require('fs-extra')
const path = require('path')
const { resolvePath } = require('./scripts/utils')

async function go(appDir = process.argv[2]) {
	const appDirPath = resolvePath(appDir)
	const playgroundDirPath = path.resolve('./apps/00-playground')
	await fsExtra.remove(playgroundDirPath)
	await fsExtra.copy(path.resolve(appDirPath), playgroundDirPath, {
		filter(src, dest) {
			return !dest.includes('node_modules')
		},
	})
	require('./scripts/fix-pkg-names')
	console.log(`Playground is now at ${appDirPath}`)
}

if (require.main === module) {
	go()
} else {
	module.exports = go
}
