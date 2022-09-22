const cp = require('child_process')
const { getAppsDirs } = require('./utils')

const dirs = getAppsDirs()

async function go() {
	// TODO: make the tests work for app 7
	const dirsToTest = dirs.filter(d => !d.include('07-'))
	console.log(`🏎  "npx playwright test":\n- ${dirsToTest.join('\n- ')}\n`)
	for (const dir of dirsToTest) {
		console.log(`🏎  "APP_NUMBER=${dir} npx playwright test"`)
		cp.spawnSync(`npx playwright test --trace on`, {
			shell: true,
			stdio: 'inherit',
			env: { APP_NUMBER: dir, ...process.env },
		})
	}
}
go()
