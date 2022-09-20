import * as React from 'react'
import { useLocation, Link } from 'react-router-dom'
import { CompleteIcon, IncompleteIcon } from '../icons'

const cn = (...cns: Array<string | false>) => cns.filter(Boolean).join(' ')

type Filter = 'all' | 'active' | 'complete'
type Todo = { id: string; title: string; complete: boolean }

export default function TodosRoute() {
	const [todos, setTodos] = React.useState<Array<Todo>>([])
	const [status, setStatus] = React.useState('loading')
	const location = useLocation()

	// initial load of todos
	React.useEffect(() => {
		fetch('http://localhost:3000/api/todos')
			.then(res => res.json())
			.then(({ todos }) => {
				setTodos(todos)
				setStatus('loaded')
			})
	}, [])

	const hasCompleteTodos = todos.some(todo => todo.complete === true)

	const filter: Filter = location.pathname.endsWith('/complete')
		? 'complete'
		: location.pathname.endsWith('/active')
		? 'active'
		: 'all'

	const remainingActive = todos.filter(t => !t.complete)
	const allComplete = remainingActive.length === 0

	return (
		<>
			<section className="todoapp" data-status={status}>
				<div>
					<header className="header">
						<h1>todos</h1>
						<form
							className="create-form"
							onSubmit={event => {
								event.preventDefault()
								const form = event.currentTarget
								const titleInput = form.elements.namedItem(
									'title',
								) as HTMLInputElement
								const title = titleInput.value.trim()
								if (title.length === 0) return
								fetch(`http://localhost:3000/api/todos`, {
									method: 'POST',
									headers: { 'Content-Type': 'application/json' },
									body: JSON.stringify({ title }),
								})
									.then(res => res.json())
									.then(data => {
										setTodos([...todos, data.todo])
									})
								requestAnimationFrame(() => {
									form.reset()
								})
							}}
						>
							<input
								className="new-todo"
								placeholder="What needs to be done?"
								title="New todo title"
								name="title"
								autoFocus
							/>
						</form>
					</header>
					<section className={cn('main', !todos.length && 'no-todos')}>
						<button
							className={`toggle-all ${allComplete ? 'checked' : ''}`}
							title={
								allComplete ? 'Mark all as incomplete' : 'Mark all as complete'
							}
							onClick={() => {
								fetch(`http://localhost:3000/api/todos`, {
									method: 'PUT',
									headers: { 'Content-Type': 'application/json' },
									body: JSON.stringify({ complete: !allComplete }),
								})
									.then(res => res.json())
									.then(data => {
										setTodos(data.todos)
									})
							}}
						>
							❯
						</button>
						<ul className="todo-list" hidden={!todos.length}>
							{todos.map(todo => (
								<ListItem
									todo={todo}
									key={todo.id}
									filter={filter}
									updateTodo={updates => {
										setTodos(currentTodos =>
											currentTodos.map(t =>
												t.id === todo.id ? { ...t, ...updates } : t,
											),
										)
									}}
									removeTodo={() => {
										setTodos(currentTodos =>
											currentTodos.filter(t => t.id !== todo.id),
										)
									}}
								/>
							))}
						</ul>
					</section>
					<footer className="footer" hidden={!todos.length}>
						<span className="todo-count">
							<strong>{remainingActive.length}</strong>
							<span>
								{' '}
								{remainingActive.length === 1 ? 'item' : 'items'} left
							</span>
						</span>
						<ul className="filters">
							<li>
								<Link
									to="/todos"
									className={cn(filter === 'all' && 'selected')}
								>
									All
								</Link>
							</li>{' '}
							<li>
								<Link
									to="/todos/active"
									className={cn(filter === 'active' && 'selected')}
								>
									Active
								</Link>
							</li>{' '}
							<li>
								<Link
									to="/todos/complete"
									className={cn(filter === 'complete' && 'selected')}
								>
									Completed
								</Link>
							</li>
						</ul>
						{hasCompleteTodos ? (
							<button
								className="clear-completed"
								onClick={() => {
									fetch(`http://localhost:3000/api/todos`, {
										method: 'DELETE',
										headers: { 'Content-Type': 'application/json' },
									})
										.then(res => res.json())
										.then(data => {
											setTodos(data.todos)
										})
								}}
							>
								Clear completed
							</button>
						) : null}
					</footer>
				</div>
			</section>
			<footer className="info">
				<p>
					Created by <a href="http://github.com/kentcdodds">Kent C. Dodds</a>
				</p>
			</footer>
		</>
	)
}

function ListItem({
	todo,
	filter,
	updateTodo,
	removeTodo,
}: {
	todo: Todo
	filter: Filter
	updateTodo: (todo: Todo) => void
	removeTodo: () => void
}) {
	const complete = todo.complete

	const shouldRender =
		filter === 'all' ||
		(filter === 'complete' && complete) ||
		(filter === 'active' && !complete)

	if (!shouldRender) return null

	return (
		<li className={complete ? 'completed' : ''}>
			<div className="view">
				<button
					className="toggle"
					title={complete ? 'Mark as incomplete' : 'Mark as complete'}
					onClick={() => {
						fetch(`http://localhost:3000/api/todos/${todo.id}`, {
							method: 'PUT',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ complete: !complete }),
						})
							.then(res => res.json())
							.then(data => {
								updateTodo(data.todo)
							})
					}}
				>
					{complete ? <CompleteIcon /> : <IncompleteIcon />}
				</button>
				<input
					name="title"
					className="edit-input"
					defaultValue={todo.title}
					onKeyDown={e => {
						e.key === 'Enter' && e.currentTarget.blur()
					}}
					onBlur={e => {
						const newTitle = e.currentTarget.value
						if (todo.title !== newTitle) {
							fetch(`http://localhost:3000/api/todos/${todo.id}`, {
								method: 'PUT',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify({ title: newTitle }),
							})
						}
					}}
				/>
				<button
					className="destroy"
					title="Delete todo"
					onClick={() => {
						fetch(`http://localhost:3000/api/todos/${todo.id}`, {
							method: 'DELETE',
						})
							.then(res => res.json())
							.then(data => {
								if (data.success) {
									removeTodo()
								}
							})
					}}
				/>
			</div>
		</li>
	)
}
