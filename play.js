let { 2: appDir } = process.argv
if (appDir) {
	require('./advance')
}
process.argv[2] = '00'
require('./dev')
