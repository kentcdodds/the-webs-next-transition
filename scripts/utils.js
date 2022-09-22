const fsExtra = require('fs-extra')
const cp = require('child_process')
const path = require('path')

function getAppsDirs() {
	return fsExtra
		.readdirSync('./apps')
		.filter(dir => /\d+-/.test(dir))
		.filter(dir => !dir.includes('00-'))
		.map(dir => `./apps/${dir}`)
}

function runInDirs(script, dirs = []) {
	if (!dirs.length) {
		dirs = getAppsDirs()
	}
	console.log(`🏎  "${script}":\n- ${dirs.join('\n- ')}\n`)

	for (const dir of dirs) {
		console.log(`🏎  ${script} in ${dir}`)
		cp.execSync(script, { cwd: dir, stdio: 'inherit' })
	}
}

function resolvePath(p) {
	const appDir = getAppsDirs().find(dir => {
		const fullPath = path.resolve(dir)
		return (
			fullPath.startsWith(path.resolve(p)) ||
			path.basename(fullPath).startsWith(p) ||
			path.basename(fullPath).startsWith(`0${p}`)
		)
	})

	if (!appDir || !fsExtra.existsSync(appDir)) {
		const err = new Error(`${appDir} does not exist`)
		err.stack = ''
		throw err
	}
	return appDir
}

module.exports = {
	getAppsDirs,
	runInDirs,
	resolvePath,
}
