process.argv[2] = process.env.APP_NUMBER ?? '1'
process.env.PORT = 7999
require('./dev')
