let { 2: appDir } = process.argv
async function go() {
	if (appDir) {
		await require('./advance')(appDir)
	}
	await require('./dev')('00')
}
go()
