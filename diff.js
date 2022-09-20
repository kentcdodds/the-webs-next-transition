const cp = require('child_process')
const { resolvePath } = require('./scripts/utils')

let { 2: first, 3: second } = process.argv

async function go() {
	if (!second) {
		second = first
		first = (Number(second) - 1).toString()
	}
	const firstPath = resolvePath(first)
	const secondPath = resolvePath(second)

	cp.spawnSync(`git diff --no-index ${firstPath} ${secondPath}`, {
		shell: true,
		stdio: 'inherit',
	})
}

go()
