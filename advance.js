const fsExtra = require('fs-extra')
const path = require('path')
const { resolvePath } = require('./scripts/utils')

let { 2: appDir } = process.argv

async function go() {
	const appDirPath = resolvePath(appDir)
	const playgroundDirPath = path.resolve('./apps/00-playground')
	await fsExtra.copy(path.resolve(appDirPath), playgroundDirPath, {
		filter(src, dest) {
			return !dest.includes('node_modules')
		},
	})
	require('./scripts/fix-pkg-names')
	console.log(`Playground is now at ${appDirPath}`)
}

go()
