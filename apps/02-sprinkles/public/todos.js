// String.raw is a handy trick that works together with the VSCode extension called "inline".
// It allows me to "tag" a template literal as HTML without actually changing its contents
// and the extension will make VSCode treat it like an HTML block with regard to syntax
// highlighting and formatting. Pretty awesome!
const html = String.raw

const getTotalTodosCount = () => $('.todo-list li').length
const getIncompleteTodosCount = () =>
	Number($('.todo-count').find('strong').text())

function updateTodoCount({ completeChange = 0, incompleteCount } = {}) {
	const todoCount = $('.todo-count')
	const numberEl = todoCount.find('strong')
	const currentIncompleteCount = getIncompleteTodosCount()
	incompleteCount = incompleteCount ?? currentIncompleteCount + completeChange
	numberEl.text(incompleteCount)
	todoCount
		.find('span')
		.text(incompleteCount === 1 ? 'item left' : 'items left')
	const clearTodos = $('.clear-completed')
	const currentCount = getTotalTodosCount()
	const completeTodos = currentCount - incompleteCount
	if (!completeTodos) clearTodos.hide()
	else clearTodos.show()
}

function handleCreateOrDestroyTodo() {
	const totalCount = getTotalTodosCount()
	if (totalCount === 0) {
		$('.todo-list').attr('hidden', true)
		$('.footer').attr('hidden', true)
		$('.main').addClass('no-todos')
	} else {
		$('.todo-list').removeAttr('hidden')
		$('.footer').removeAttr('hidden')
		$('.main').removeClass('no-todos')
	}
}

function updateLiCompletedState(li, completed) {
	const liEl = $(li)
	if (completed) liEl.addClass('completed')
	else liEl.removeClass('completed')

	liEl.find('input[name=complete]').val(!completed)
	const submitButtonEl = liEl.find('[data-form=toggleTodo] button[type=submit]')
	submitButtonEl.attr(
		'title',
		completed ? 'Mark as incomplete' : 'Mark as complete',
	)
	submitButtonEl.html(completed ? completeIcon() : incompleteIcon())
}

function getCurrentFilter() {
	return window.location.href.includes('/complete')
		? 'complete'
		: window.location.href.includes('/active')
		? 'active'
		: 'all'
}

$('.edit-input').on('change', async event => {
	const form = $(event.target).parents('form')[0]
	const { todoId: todoIdInput, title: titleInput } = form.elements
	await fetch(`/api/todos/${todoIdInput.value}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ title: titleInput.value }),
	})
})

$('ul.filters li a').on('click', async event => {
	event.preventDefault()
	window.history.pushState({}, '', new URL(event.target.href).pathname)
	const filter = getCurrentFilter()
	$('.todoapp')[0].dataset.activeFilter = filter
})

$(document).on('submit', async event => {
	event.preventDefault()
	const form = event.target
	switch (form.dataset.form) {
		case 'toggleTodo': {
			const { todoId: todoIdInput, complete: completeInput } = form.elements
			const response = await fetch(`/api/todos/${todoIdInput.value}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ complete: completeInput.value === 'true' }),
			})
			const { todo: updatedTodo } = await response.json()
			updateTodoCount({ completeChange: updatedTodo.complete ? -1 : 1 })
			const li = form.closest('li')
			updateLiCompletedState(li, updatedTodo.complete)
			handleCreateOrDestroyTodo()
			break
		}
		case 'updateTodo': {
			const { todoId: todoIdInput, title: titleInput } = form.elements
			await fetch(`/api/todos/${todoIdInput.value}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ title: titleInput.value }),
			})
			break
		}
		case 'deleteTodo': {
			const { todoId: todoIdInput } = form.elements
			const wasComplete = Boolean(
				$(form).parents('.todo-list li.completed').length,
			)
			await fetch(`/api/todos/${todoIdInput.value}`, { method: 'DELETE' })
			const li = form.closest('li')
			li.remove()

			if (!wasComplete) updateTodoCount()
			handleCreateOrDestroyTodo()
			break
		}
		case 'createTodo': {
			const { title: titleInput } = form.elements
			const response = await fetch('/api/todos', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ title: titleInput.value }),
			})
			const { todo: createdTodo } = await response.json()
			const li = $.parseHTML(renderListItem(createdTodo))
			$('.todo-list').append(li)
			updateTodoCount({ completeChange: 1 })
			handleCreateOrDestroyTodo()
			form.reset()
			break
		}
		case 'toggleAllTodos': {
			const allComplete =
				$('.todo-list li.completed').length === getTotalTodosCount()
			const complete = !allComplete
			await fetch(`/api/todos`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ complete }),
			})
			const allLis = $('.todo-list li')
			if (complete) {
				allLis.each((i, li) => {
					updateLiCompletedState(li, true)
				})
				updateTodoCount({ incompleteCount: 0 })
			} else {
				allLis.each((i, li) => {
					updateLiCompletedState(li, false)
				})
				const totalCount = getTotalTodosCount()
				updateTodoCount({ incompleteCount: totalCount })
			}
			break
		}
		case 'deleteCompletedTodos': {
			await fetch(`/api/todos`, { method: 'DELETE' })
			updateTodoCount()
			$('.todo-list li.completed').remove()
			handleCreateOrDestroyTodo()

			break
		}
		default: {
			console.warn(`Unhandled form submission`, form)
			break
		}
	}
})

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
