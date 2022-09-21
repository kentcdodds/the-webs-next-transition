type Todo = {
	id: string
	title: string
	complete: boolean
	createdAt: number
}

const todosInitted = Boolean(global.todos)

declare global {
	var todos: Array<Todo> | undefined
}
const todos: Array<Todo> = (global.todos = global.todos ?? [])

if (!todosInitted) {
	createTodo({ title: 'Eat breakfast', complete: true })
	createTodo({ title: 'Shower', complete: true })
	createTodo({ title: 'Get Dressed', complete: true })
	createTodo({ title: 'Brush teeth' })
	createTodo({ title: 'Review PRs' })
	createTodo({ title: 'Eat Lunch' })
	createTodo({ title: 'Make PRs' })
}

export async function createTodo({
	title,
	complete = false,
}: {
	title: string
	complete?: boolean
}) {
	const newTodo = {
		id: Math.random().toString(8).slice(2),
		title,
		complete,
		createdAt: Date.now(),
	}
	todos.push(newTodo)
	return newTodo
}

export async function getTodos() {
	return todos
}

export async function updateTodo(
	todoId: string,
	{ title, complete }: Partial<Pick<Todo, 'title' | 'complete'>>,
) {
	const todo = todos.find(({ id }) => todoId === id)
	if (todo) {
		Object.assign(todo, {
			title: title ?? todo.title,
			complete: complete ?? todo.complete,
		})
	}
	return todo
}

export async function updateAll({
	title,
	complete,
}: Partial<Pick<Todo, 'title' | 'complete'>>) {
	for (const todo of todos) {
		await updateTodo(todo.id, { title, complete })
	}
	return todos
}

export async function getTodo(todoId: string) {
	return todos.find(({ id }) => todoId === id)
}

export async function deleteTodo(todoId: string) {
	todos.splice(
		todos.findIndex(({ id }) => todoId === id),
		1,
	)
}

export async function deleteComplete() {
	const completeTodoIds = todos.filter(t => t.complete).map(t => t.id)
	for (const id of completeTodoIds) {
		await deleteTodo(id)
	}
}
