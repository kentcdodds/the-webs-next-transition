import * as React from 'react'
import { useLocation, Link, useLoaderData, useFetcher } from '@remix-run/react'
import { ActionArgs, json, LinksFunction } from '@remix-run/node'
import invariant from 'tiny-invariant'
import * as db from '../db'
import { CompleteIcon, IncompleteIcon } from '../icons'
import todosStylesheet from './todos.css'

type Filter = 'all' | 'active' | 'complete'
type Todo = { id: string; title: string; complete: boolean }

export const links: LinksFunction = () => {
	return [{ rel: 'stylesheet', href: todosStylesheet }]
}

export async function loader() {
	const todos = await db.getTodos()
	return json({ todos })
}

export async function action({ request }: ActionArgs) {
	const formData = await request.formData()
	const intent = formData.get('intent')
	switch (intent) {
		case 'createTodo': {
			const title = formData.get('title')
			invariant(typeof title === 'string', 'title must be a string')
			await db.createTodo({ title })
			return new Response(null)
		}
		case 'toggleAllTodos': {
			const complete = formData.get('complete')
			await db.updateAll({ complete: complete === 'true' })
			return new Response(null)
		}
		case 'deleteCompletedTodos': {
			await db.deleteComplete()
			return new Response(null)
		}
	}

	const todoId = formData.get('todoId')
	invariant(typeof todoId === 'string', 'todoId must be a string')

	switch (intent) {
		case 'toggleTodo': {
			const complete = formData.get('complete')
			await db.updateTodo(todoId, {
				complete: complete === 'true',
			})
			return new Response(null)
		}
		case 'updateTodo': {
			const title = formData.get('title')
			invariant(typeof title === 'string', 'title must be a string')
			await db.updateTodo(todoId, { title })
			return new Response(null)
		}
		case 'deleteTodo': {
			await db.deleteTodo(todoId)
			return new Response(null)
		}
		default: {
			console.warn('Unhandled intent', intent)
			return new Response('Unhandled intent', { status: 400 })
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
								disabled={Boolean(createFetcher.submission)}
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
									disabled={Boolean(
										toggleAllFetcher.submission ||
											(clearFetcher.submission && todo.complete),
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
	disabled: externallyDisabled,
}: {
	todo: Todo
	filter: Filter
	disabled: boolean
}) {
	const updateFetcher = useFetcher()
	const toggleFetcher = useFetcher()
	const deleteFetcher = useFetcher()
	const updateFormRef = React.useRef<HTMLFormElement>(null)

	const complete = todo.complete
	const disabled = Boolean(
		externallyDisabled ||
			updateFetcher.submission ||
			toggleFetcher.submission ||
			deleteFetcher.submission,
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
						disabled={disabled}
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
						disabled={disabled}
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
						disabled={disabled}
					/>
				</deleteFetcher.Form>
			</div>
		</li>
	)
}
