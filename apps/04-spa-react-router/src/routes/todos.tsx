import * as React from 'react'
import './todos.css'
import {
	useLocation,
	Link,
	useLoaderData,
	useFetcher,
	ActionFunctionArgs,
} from 'react-router-dom'
import invariant from 'tiny-invariant'
import { CompleteIcon, IncompleteIcon } from '../icons'

type Filter = 'all' | 'active' | 'complete'
type Todo = { id: string; title: string; complete: boolean }

export async function loader() {
	return fetch('http://localhost:3000/api/todos')
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	const intent = formData.get('intent')
	switch (intent) {
		case 'createTodo': {
			const title = formData.get('title')
			invariant(typeof title === 'string', 'title must be a string')
			if (title.length === 0) return
			return fetch(`http://localhost:3000/api/todos`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ title }),
			})
		}
		case 'toggleAllTodos': {
			const complete = formData.get('complete')
			return fetch(`http://localhost:3000/api/todos`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ complete: complete === 'true' }),
			})
		}
		case 'deleteCompletedTodos': {
			return fetch(`http://localhost:3000/api/todos`, {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
			})
		}
		case 'toggleTodo': {
			const todoId = formData.get('todoId')
			invariant(typeof todoId === 'string', 'todoId must be a string')
			const complete = formData.get('complete') === 'true'
			return fetch(`http://localhost:3000/api/todos/${todoId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ complete }),
			})
		}
		case 'updateTodo': {
			const todoId = formData.get('todoId')
			invariant(typeof todoId === 'string', 'todoId must be a string')
			const title = formData.get('title')
			invariant(typeof title === 'string', 'title must be a string')
			return fetch(`http://localhost:3000/api/todos/${todoId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ title }),
			})
		}
		case 'deleteTodo': {
			const todoId = formData.get('todoId')
			invariant(typeof todoId === 'string', 'todoId must be a string')
			return fetch(`http://localhost:3000/api/todos/${todoId}`, {
				method: 'DELETE',
			})
		}
		default: {
			console.warn('Unhandled intent', intent)
			break
		}
	}
}

export default function TodosRoute() {
	const data = useLoaderData() as { todos: Array<Todo> }
	const createFetcher = useFetcher()
	const clearFetcher = useFetcher()
	const toggleAllFetcher = useFetcher()
	const createFormRef = React.useRef<HTMLFormElement>(null)
	const location = useLocation()

	const hasCompleteTodos = data.todos.some(todo => todo.complete === true)

	const filter: Filter = location.pathname.endsWith('/complete')
		? 'complete'
		: location.pathname.endsWith('/active')
		? 'active'
		: 'all'

	const remainingActive = data.todos.filter(t => !t.complete)
	const allComplete = remainingActive.length === 0

	return (
		<>
			<section className="todoapp">
				<div>
					<header className="header">
						<h1>todos</h1>
						<createFetcher.Form
							ref={createFormRef}
							method="post"
							className="create-form"
							onSubmit={event => {
								const form = event.currentTarget
								requestAnimationFrame(() => {
									form.reset()
								})
							}}
						>
							<input type="hidden" name="intent" value="createTodo" />
							<input
								className="new-todo"
								placeholder="What needs to be done?"
								title="New todo title"
								name="title"
								autoFocus
								aria-invalid={createFetcher.data?.error ? true : undefined}
								aria-describedby="new-todo-error"
								data-pending={Boolean(createFetcher.formData)}
							/>
							{createFetcher.data?.error ? (
								<div className="error" id="new-todo-error">
									{createFetcher.data?.error}
								</div>
							) : null}
						</createFetcher.Form>
					</header>
					<section className={`main ${data.todos.length ? '' : 'no-todos'}`}>
						<toggleAllFetcher.Form method="post">
							<input
								type="hidden"
								name="complete"
								value={(!allComplete).toString()}
							/>
							<button
								className={`toggle-all ${allComplete ? 'checked' : ''}`}
								type="submit"
								name="intent"
								value="toggleAllTodos"
								title={
									allComplete
										? 'Mark all as incomplete'
										: 'Mark all as complete'
								}
							>
								❯
							</button>
						</toggleAllFetcher.Form>
						<ul className="todo-list" hidden={!data.todos.length}>
							{data.todos.map(todo => (
								<ListItem
									todo={todo}
									key={todo.id}
									filter={filter}
									pending={Boolean(
										(toggleAllFetcher.formData &&
											toggleAllFetcher.formData.get('complete') !==
												String(todo.complete)) ||
											(clearFetcher.formData && todo.complete),
									)}
								/>
							))}
						</ul>
					</section>
					<footer className="footer" hidden={!data.todos.length}>
						<span className="todo-count">
							<strong>{remainingActive.length}</strong>
							<span>
								{' '}
								{remainingActive.length === 1 ? 'item' : 'items'} left
							</span>
						</span>
						<ul className="filters">
							<li>
								<Link to="." className={filter === 'all' ? 'selected' : ''}>
									All
								</Link>
							</li>{' '}
							<li>
								<Link
									to="active"
									className={filter === 'active' ? 'selected' : ''}
								>
									Active
								</Link>
							</li>{' '}
							<li>
								<Link
									to="complete"
									className={filter === 'complete' ? 'selected' : ''}
								>
									Completed
								</Link>
							</li>
						</ul>
						{hasCompleteTodos ? (
							<clearFetcher.Form method="post">
								<input
									type="hidden"
									name="intent"
									value="deleteCompletedTodos"
								/>
								<button className="clear-completed">Clear completed</button>
							</clearFetcher.Form>
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
	pending: externallyPending,
}: {
	todo: Todo
	filter: Filter
	pending: boolean
}) {
	const updateFetcher = useFetcher()
	const toggleFetcher = useFetcher()
	const deleteFetcher = useFetcher()
	const updateFormRef = React.useRef<HTMLFormElement>(null)

	const complete = todo.complete
	const pending = Boolean(
		externallyPending ||
			updateFetcher.formData ||
			toggleFetcher.formData ||
			deleteFetcher.formData,
	)

	const shouldRender =
		filter === 'all' ||
		(filter === 'complete' && complete) ||
		(filter === 'active' && !complete)

	if (!shouldRender) return null

	return (
		<li className={complete ? 'completed' : ''}>
			<div className="view">
				<toggleFetcher.Form method="post">
					<input type="hidden" name="todoId" value={todo.id} />
					<input type="hidden" name="complete" value={(!complete).toString()} />
					<button
						type="submit"
						name="intent"
						value="toggleTodo"
						className="toggle"
						title={complete ? 'Mark as incomplete' : 'Mark as complete'}
					>
						{complete ? <CompleteIcon /> : <IncompleteIcon />}
					</button>
				</toggleFetcher.Form>
				<updateFetcher.Form
					method="post"
					className="update-form"
					ref={updateFormRef}
				>
					<input type="hidden" name="intent" value="updateTodo" />
					<input type="hidden" name="todoId" value={todo.id} />
					<input
						name="title"
						className="edit-input"
						defaultValue={todo.title}
						onBlur={e => {
							if (todo.title !== e.currentTarget.value) {
								updateFetcher.submit(e.currentTarget.form)
							}
						}}
						aria-invalid={updateFetcher.data?.error ? true : undefined}
						aria-describedby={`todo-update-error-${todo.id}`}
						data-pending={pending}
					/>
					{updateFetcher.data?.error && updateFetcher.state !== 'submitting' ? (
						<div
							className="error todo-update-error"
							id={`todo-update-error-${todo.id}`}
						>
							{updateFetcher.data?.error}
						</div>
					) : null}
				</updateFetcher.Form>
				<deleteFetcher.Form method="post">
					<input type="hidden" name="todoId" value={todo.id} />
					<button
						className="destroy"
						title="Delete todo"
						type="submit"
						name="intent"
						value="deleteTodo"
					/>
				</deleteFetcher.Form>
			</div>
		</li>
	)
}
