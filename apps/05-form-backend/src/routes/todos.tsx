import * as React from 'react'
import {
	useLocation,
	Link,
	useLoaderData,
	useFetcher,
	ActionFunctionArgs,
} from 'react-router-dom'
import { CompleteIcon, IncompleteIcon } from '../icons'

const cn = (...cns: Array<string | false>) => cns.filter(Boolean).join(' ')

type Filter = 'all' | 'active' | 'complete'
type Todo = { id: string; title: string; complete: boolean }

export async function loader() {
	return fetch('http://localhost:3000/api/todos')
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	return fetch('http://localhost:3000/api/todos', {
		method: request.method,
		headers: request.headers,
		// @ts-expect-error
		body: new URLSearchParams(formData.entries()),
		signal: request.signal,
	})
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
								name="title"
								autoFocus
								aria-invalid={createFetcher.data?.error ? true : undefined}
								aria-describedby="new-todo-error"
							/>
							{createFetcher.data?.error ? (
								<div className="error" id="new-todo-error">
									{createFetcher.data?.error}
								</div>
							) : null}
						</createFetcher.Form>
					</header>
					<section className={cn('main', !data.todos.length && 'no-todos')}>
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
								<ListItem todo={todo} key={todo.id} filter={filter} />
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
								<Link to="." className={cn(filter === 'all' && 'selected')}>
									All
								</Link>
							</li>{' '}
							<li>
								<Link
									to="active"
									className={cn(filter === 'active' && 'selected')}
								>
									Active
								</Link>
							</li>{' '}
							<li>
								<Link
									to="complete"
									className={cn(filter === 'complete' && 'selected')}
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

function ListItem({ todo, filter }: { todo: Todo; filter: Filter }) {
	const updateFetcher = useFetcher()
	const toggleFetcher = useFetcher()
	const deleteFetcher = useFetcher()
	const updateFormRef = React.useRef<HTMLFormElement>(null)

	const complete = todo.complete

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
