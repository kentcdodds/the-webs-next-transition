import express from 'express'
import bodyParser from 'body-parser'
import * as db from './db.js'

const app = express()

app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// String.raw is a handy trick that works together with the VSCode extension called "inline".
// It allows me to "tag" a template literal as HTML without actually changing its contents
// and the extension will make VSCode treat it like an HTML block with regard to syntax
// highlighting and formatting. Pretty awesome!
const html = String.raw

// makes it easier to conditionally apply classnames
const cn = (...cns) => cns.filter(Boolean).join(' ')

export function incompleteIcon() {
	return html`
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="40"
			height="40"
			viewBox="-3 -3 105 105"
		>
			<circle
				cx="50"
				cy="50"
				r="50"
				fill="none"
				stroke="#ededed"
				strokeWidth="3"
			></circle>
		</svg>
	`
}

export function completeIcon() {
	return html`
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="40"
			height="40"
			viewBox="-3 -3 105 105"
		>
			<circle
				cx="50"
				cy="50"
				r="50"
				fill="none"
				stroke="#bddad5"
				strokeWidth="3"
			></circle>
			<path fill="#5dc2af" d="M72 25L42 71 27 56l-4 4 20 20 34-52z"></path>
		</svg>
	`
}

function renderListItem({ id, title, complete }) {
	return html`
		<li class="${complete ? 'completed' : ''}">
			<div class="view">
				<form data-form="toggleTodo">
					<input type="hidden" name="todoId" value="${id}" />
					<input type="hidden" name="complete" value="${!complete}" />
					<button
						type="submit"
						name="submit"
						class="toggle"
						title="Mark as incomplete"
					>
						${complete ? completeIcon() : incompleteIcon()}
					</button>
				</form>
				<form class="update-form" data-form="updateTodo">
					<input type="hidden" name="todoId" value="${id}" />
					<input name="title" class="edit-input" value="${title}" />
				</form>
				<form data-form="deleteTodo">
					<input type="hidden" name="todoId" value="${id}" />
					<button
						class="destroy"
						title="Delete todo"
						type="submit"
						name="submit"
					></button>
				</form>
			</div>
		</li>
	`
}

async function renderApp(req, res) {
	const todos = await db.getTodos()
	const hasCompleteTodos = todos.some(todo => todo.complete === true)

	const filter = req.url.includes('/complete')
		? 'complete'
		: req.url.includes('/active')
		? 'active'
		: 'all'

	const remainingActive = todos.filter(t => !t.complete)
	const allComplete = remainingActive.length === 0

	res.send(html`
		<!DOCTYPE html>
		<html lang="en">
			<head>
				<meta charset="utf-8" />
				<title>MPA TodoMVC</title>
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				<link rel="stylesheet" href="/todos.css" />
			</head>
			<body>
				<section class="todoapp">
					<div>
						<header class="header">
							<h1>todos</h1>
							<form class="create-form" data-form="createTodo">
								<input
									class="new-todo"
									placeholder="What needs to be done?"
									name="title"
									autofocus
								/>
							</form>
						</header>
						<section class="${cn('main', !todos.length && 'no-todos')}">
							<form data-form="toggleAllTodos">
								<input type="hidden" name="complete" value="${!allComplete}" />
								<button
									class="toggle-all ${allComplete ? 'checked' : ''}"
									type="submit"
									name="submit"
									title="${allComplete
										? 'Mark all as incomplete'
										: 'Mark all as complete'}"
								>
									❯
								</button>
							</form>
							<ul class="todo-list">
								${todos
									.filter(todo => {
										if (filter === 'active') return !todo.complete
										if (filter === 'complete') return todo.complete
										return true
									})
									.map(todo => renderListItem(todo))
									.join('\n')}
							</ul>
						</section>
						<footer class="footer">
							<span class="todo-count">
								<strong>${remainingActive.length}</strong>
								<span>
									${remainingActive.length === 1 ? 'item' : 'items'} left
								</span>
							</span>
							<ul class="filters">
								<li>
									<a
										class="${cn(filter === 'all' && 'selected')}"
										href="/todos"
									>
										All
									</a>
								</li>
								<li>
									<a
										class="${cn(filter === 'active' && 'selected')}"
										href="/todos/active"
									>
										Active
									</a>
								</li>
								<li>
									<a
										class="${cn(filter === 'complete' && 'selected')}"
										href="/todos/complete"
									>
										Completed
									</a>
								</li>
							</ul>
							${hasCompleteTodos
								? html`
										<form data-form="deleteCompletedTodos">
											<button class="clear-completed">Clear completed</button>
										</form>
								  `
								: ''}
						</footer>
					</div>
				</section>
				<footer class="info">
					<p>
						Created by <a href="http://github.com/kentcdodds">Kent C. Dodds</a>
					</p>
				</footer>
				<script src="/todos.js" type="module"></script>
			</body>
		</html>
	`)
}

app.get('/todos', renderApp)
app.get('/todos/active', renderApp)
app.get('/todos/complete', renderApp)

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
	console.log(req.body)
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

app.get('*', (req, res) => res.redirect('/todos'))

const server = app.listen(process.env.PORT || 3000, () => {
	console.log(`Server running at http://localhost:${server.address().port}`)
})
