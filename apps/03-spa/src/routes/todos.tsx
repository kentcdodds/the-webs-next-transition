import * as React from 'react'
import { useLocation, Link } from 'react-router-dom'
import './todos.css'
import { CompleteIcon, IncompleteIcon } from '../icons'

type Filter = 'all' | 'active' | 'complete'
type Todo = { id: string; title: string; complete: boolean }

export default function TodosRoute() {
	const [todos, setTodos] = React.useState<Array<Todo>>([])
	const [statuses, setStatuses] = React.useState<{
		loadingTodos: 'idle' | 'loading'
		creatingTodo: 'idle' | 'loading'
		togglingAllTodos: 'idle' | 'loading'
		clearingCompleteTodos: 'idle' | 'loading'
	}>({
		loadingTodos: 'loading',
		creatingTodo: 'idle',
		togglingAllTodos: 'idle',
		clearingCompleteTodos: 'idle',
	})

	const location = useLocation()

	// initial load of todos
	React.useEffect(() => {
		fetch('http://localhost:3000/api/todos')
			.then(res => res.json())
			.then(({ todos }) => {
				setTodos(todos)
				setStatuses(old => ({ ...old, loadingTodos: 'idle' }))
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
			<section className="todoapp" data-status={statuses.loadingTodos}>
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
								setStatuses(old => ({ ...old, creatingTodo: 'loading' }))
								fetch(`http://localhost:3000/api/todos`, {
									method: 'POST',
									headers: { 'Content-Type': 'application/json' },
									body: JSON.stringify({ title }),
								})
									.then(res => res.json())
									.then(data => {
										setTodos([...todos, data.todo])
										form.reset()
										setStatuses(old => ({ ...old, creatingTodo: 'idle' }))
									})
							}}
						>
							<input
								className="new-todo"
								placeholder="What needs to be done?"
								title="New todo title"
								name="title"
								autoFocus
								data-pending={statuses.creatingTodo === 'loading'}
							/>
						</form>
					</header>
					<section className={`main ${todos.length ? '' : 'no-todos'}`}>
						<button
							className={`toggle-all ${allComplete ? 'checked' : ''}`}
							title={
								allComplete ? 'Mark all as incomplete' : 'Mark all as complete'
							}
							onClick={() => {
								setStatuses(old => ({ ...old, togglingAllTodos: 'loading' }))
								fetch(`http://localhost:3000/api/todos`, {
									method: 'PUT',
									headers: { 'Content-Type': 'application/json' },
									body: JSON.stringify({ complete: !allComplete }),
								})
									.then(res => res.json())
									.then(data => {
										setStatuses(old => ({ ...old, togglingAllTodos: 'idle' }))
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
									pending={
										(statuses.togglingAllTodos === 'loading' &&
											todo.complete === allComplete) ||
										(statuses.clearingCompleteTodos === 'loading' &&
											todo.complete)
									}
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
									className={filter === 'all' ? 'selected' : ''}
								>
									All
								</Link>
							</li>{' '}
							<li>
								<Link
									to="/todos/active"
									className={filter === 'active' ? 'selected' : ''}
								>
									Active
								</Link>
							</li>{' '}
							<li>
								<Link
									to="/todos/complete"
									className={filter === 'complete' ? 'selected' : ''}
								>
									Completed
								</Link>
							</li>
						</ul>
						{hasCompleteTodos ? (
							<button
								className="clear-completed"
								onClick={() => {
									setStatuses(old => ({
										...old,
										clearingCompleteTodos: 'loading',
									}))
									fetch(`http://localhost:3000/api/todos`, {
										method: 'DELETE',
										headers: { 'Content-Type': 'application/json' },
									})
										.then(res => res.json())
										.then(data => {
											setStatuses(old => ({
												...old,
												clearingCompleteTodos: 'idle',
											}))
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
	pending: externalPending,
	updateTodo,
	removeTodo,
}: {
	todo: Todo
	filter: Filter
	pending: boolean
	updateTodo: (todo: Todo) => void
	removeTodo: () => void
}) {
	const [statuses, setStatuses] = React.useState<{
		updating: 'idle' | 'loading'
		toggling: 'idle' | 'loading'
		deleting: 'idle' | 'loading'
	}>({
		updating: 'idle',
		toggling: 'idle',
		deleting: 'idle',
	})
	const complete = todo.complete
	const pending =
		externalPending ||
		statuses.updating === 'loading' ||
		statuses.toggling === 'loading' ||
		statuses.deleting === 'loading'

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
						setStatuses(old => ({ ...old, toggling: 'loading' }))
						fetch(`http://localhost:3000/api/todos/${todo.id}`, {
							method: 'PUT',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ complete: !complete }),
						})
							.then(res => res.json())
							.then(data => {
								setStatuses(old => ({ ...old, toggling: 'idle' }))
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
					data-pending={pending}
					onKeyDown={e => {
						e.key === 'Enter' && e.currentTarget.blur()
					}}
					onBlur={e => {
						const input = e.currentTarget
						const newTitle = input.value
						if (todo.title !== newTitle) {
							setStatuses(old => ({ ...old, updating: 'loading' }))
							fetch(`http://localhost:3000/api/todos/${todo.id}`, {
								method: 'PUT',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify({ title: newTitle }),
							}).then(() => {
								setStatuses(old => ({ ...old, updating: 'idle' }))
							})
						}
					}}
				/>
				<button
					className="destroy"
					title="Delete todo"
					onClick={() => {
						setStatuses(old => ({ ...old, deleting: 'loading' }))
						fetch(`http://localhost:3000/api/todos/${todo.id}`, {
							method: 'DELETE',
						})
							.then(res => res.json())
							.then(data => {
								if (data.success) {
									removeTodo()
								} else {
									setStatuses(old => ({ ...old, deleting: 'idle' }))
								}
							})
					}}
				/>
			</div>
		</li>
	)
}
