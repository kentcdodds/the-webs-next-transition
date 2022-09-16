const express = require('express')
const app = express()

// serve public directory as static
app.use(express.static('public'))

const server = app.listen(process.env.SERVER_PORT || 8000, () => {
	console.log(`Server running at http://localhost:${server.address().port}`)
})
