// String.raw is a handy trick that works together with the VSCode extension called "inline".
// It allows me to "tag" a template literal as HTML without actually changing its contents
// and the extension will make VSCode treat it like an HTML block with regard to syntax
// highlighting and formatting. Pretty awesome!
const html = String.raw

// makes it easier to conditionally apply classnames
const cn = (...cns) => cns.filter(Boolean).join(' ')

function updateTodoCount(change) {
	const todoCount = document.querySelector('.todo-count')
	const currentCount = Number(todoCount.querySelector('strong').textContent)
	const count = currentCount + change
	todoCount.querySelector('strong').textContent = count
	todoCount.querySelector('span').textContent =
		count === 1 ? 'item left' : 'items left'
}

function getCurrentFilter() {
	return window.location.href.includes('/complete')
		? 'complete'
		: window.location.href.includes('/active')
		? 'active'
		: 'all'
}

document.addEventListener('submit', async event => {
	event.preventDefault()
	const form = event.target
	switch (form.dataset.form) {
		case 'toggleTodo': {
			const {
				todoId: todoIdInput,
				complete: completeInput,
				submit: submitButton,
			} = form.elements
			const response = await fetch(`/api/todos/${todoIdInput.value}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ complete: completeInput.value === 'true' }),
			})
			const { todo: updatedTodo } = await response.json()
			updateTodoCount(updatedTodo.complete ? -1 : 1)
			const li = form.closest('li')
			const filter = getCurrentFilter()
			if (
				(updatedTodo.complete && filter === 'active') ||
				(!updatedTodo.complete && filter === 'complete')
			) {
				li.remove()
			} else {
				li.className = cn(updatedTodo.complete && 'complete')
				completeInput.value = !updatedTodo.complete
				submitButton.title = updatedTodo.complete
					? 'Mark as incomplete'
					: 'Mark as complete'
				submitButton.innerHTML = updatedTodo.complete
					? completeIcon()
					: incompleteIcon()
			}
			break
		}
		case 'updateTodo': {
			break
		}
		case 'deleteTodo': {
			break
		}
		case 'createTodo': {
			break
		}
		case 'toggleAllTodos': {
			break
		}
		case 'deleteCompletedTodos': {
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
