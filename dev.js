const cp = require('child_process')
const { resolvePath } = require('./scripts/utils')

let { 2: appDir } = process.argv

async function go() {
	const appDirPath = resolvePath(appDir)

	const [_dot, category, numberName] = appDirPath.split('/')
	const [number] = numberName.split('-')
	const PORT = 8000 + Number(number)

	cp.spawn(`npm run dev -s`, {
		cwd: appDirPath,
		shell: true,
		stdio: 'inherit',
		env: { PORT, ...process.env },
	})
}

go()
