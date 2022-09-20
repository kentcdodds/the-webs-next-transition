import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import * as db from './db.mjs'

const app = express()

app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors())

app.get('/api/todos', async (req, res) => {
	const todos = await db.getTodos()
	res.json({ todos })
})

async function handleFormPost(req, res) {
	const { todoId, intent, complete, title } = req.body
	switch (intent) {
		case 'createTodo': {
			await db.createTodo({ title })
			break
		}
		case 'toggleAllTodos': {
			await db.updateAll({ complete: complete === 'true' })
			break
		}
		case 'deleteCompletedTodos': {
			await db.deleteComplete()
			break
		}
		case 'toggleTodo': {
			await db.updateTodo(todoId, {
				complete: complete === 'true',
			})
			break
		}
		case 'updateTodo': {
			await db.updateTodo(todoId, {
				title,
			})
			break
		}
		case 'deleteTodo': {
			await db.deleteTodo(todoId)
			break
		}
		default: {
			console.warn('Unhandled intent', intent)
			break
		}
	}

	res.redirect(req.url)
}

app.post('/api/todos', handleFormPost)
app.post('/api/todos/:filter', handleFormPost)

const server = app.listen(process.env.SERVER_PORT || 3000, () => {
	console.log(`Server running at http://localhost:${server.address().port}`)
})
