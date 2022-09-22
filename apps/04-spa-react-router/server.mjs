import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import * as db from './db.mjs'

const app = express()

app.use(express.static('public'))
app.use(bodyParser.json())
app.use(cors())

app.put('/api/todos', async (req, res) => {
	const todos = await db.updateAll({
		title: req.body.title,
		complete: req.body.complete,
	})
	res.json({ todos })
})

app.delete('/api/todos', async (req, res) => {
	await db.deleteComplete()
	res.json({ todos: await db.getTodos() })
})

app.get('/api/todos', async (req, res) => {
	const todos = await db.getTodos()
	res.json({ todos })
})

app.get('/api/todos/:id', async (req, res) => {
	const todo = await db.getTodo(req.params.id)
	res.json({ todo })
})

app.post('/api/todos', async (req, res) => {
	const todo = await db.createTodo({
		title: req.body.title,
		complete: req.body.complete,
	})
	res.json({ todo })
})

app.put('/api/todos/:id', async (req, res) => {
	const todo = await db.updateTodo(req.params.id, {
		title: req.body.title,
		complete: req.body.complete,
	})
	res.json({ todo })
})

app.delete('/api/todos/:id', async (req, res) => {
	await db.deleteTodo(req.params.id)
	res.json({ success: true })
})

const server = app.listen(process.env.SERVER_PORT || 3000, () => {
	console.log(`Server running at http://localhost:${server.address().port}`)
})
