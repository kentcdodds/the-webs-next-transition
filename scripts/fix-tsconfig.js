const fs = require('fs')
const path = require('path')
const prettier = require('prettier')
const { getAppsDirs } = require('./utils')

async function go() {
	const apps = await getAppsDirs()
	const workshopRoot = process.cwd()
	const config = {
		files: [],
		exclude: ['node_modules'],
		references: apps.map(a => ({ path: a })),
	}
	await fs.promises.writeFile(
		path.join(workshopRoot, 'tsconfig.json'),
		prettier.format(JSON.stringify(config, null, 2), { parser: 'json' }),
	)
}

go()
