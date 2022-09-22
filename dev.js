const cp = require('child_process')
const { resolvePath } = require('./scripts/utils')

async function go(appDir = process.argv[2]) {
	const appDirPath = resolvePath(appDir)

	const { 2: numberAndName } = appDirPath.split('/')
	const [number] = numberAndName.split('-')
	const PORT = 8000 + Number(number)

	cp.spawn(`npm run dev -s`, {
		cwd: appDirPath,
		shell: true,
		stdio: 'inherit',
		env: { PORT, ...process.env },
	})
}

if (require.main === module) {
	go()
} else {
	module.exports = go
}
