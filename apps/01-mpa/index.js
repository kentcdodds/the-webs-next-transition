const express = require('express')
const app = express()

// serve public directory as static
app.use(express.static('public'))

const html = String.raw

function renderListItem() {
	return html`
		<li class="completed">
			<div class="view">
				<form
					method="post"
					action="/todos"
					enctype="application/x-www-form-urlencoded"
				>
					<input
						type="hidden"
						name="todoId"
						value="cl84vjnlh0063wfpcr7ht2pef"
					/><input type="hidden" name="complete" value="false" /><button
						type="submit"
						name="intent"
						value="toggleTodo"
						class="toggle"
						title="Mark as incomplete"
					>
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
								stroke-width="3"
							></circle>
							<path
								fill="#5dc2af"
								d="M72 25L42 71 27 56l-4 4 20 20 34-52z"
							></path>
						</svg>
					</button>
				</form>
				<form
					method="post"
					action="/todos"
					enctype="application/x-www-form-urlencoded"
					class="update-form"
				>
					<input type="hidden" name="intent" value="updateTodo" /><input
						type="hidden"
						name="todoId"
						value="cl84vjnlh0063wfpcr7ht2pef"
					/><input
						name="title"
						class="edit-input"
						aria-describedby="todo-update-error-cl84vjnlh0063wfpcr7ht2pef"
						value="Take a nap"
					/>
				</form>
				<form
					method="post"
					action="/todos"
					enctype="application/x-www-form-urlencoded"
				>
					<input
						type="hidden"
						name="todoId"
						value="cl84vjnlh0063wfpcr7ht2pef"
					/><button
						class="destroy"
						title="Delete todo"
						type="submit"
						name="intent"
						value="deleteTodo"
					></button>
				</form>
			</div>
		</li>
	`
}

app.get('/', function (req, res) {
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
							<form
								method="post"
								action="/todos"
								enctype="application/x-www-form-urlencoded"
								class="create-form"
							>
								<input type="hidden" name="intent" value="createTodo" />
								<input
									class="new-todo"
									placeholder="What needs to be done?"
									name="title"
									autofocus
								/>
							</form>
						</header>
						<section class="main">
							<form
								method="post"
								action="/todos"
								enctype="application/x-www-form-urlencoded"
							>
								<input type="hidden" name="complete" value="true" /><button
									class="toggle-all"
									type="submit"
									name="intent"
									value="toggleAllTodos"
									title="Mark all as complete"
								>
									❯
								</button>
							</form>
							<ul class="todo-list">
								<li class="completed">
									<div class="view">
										<form
											method="post"
											action="/todos"
											enctype="application/x-www-form-urlencoded"
										>
											<input
												type="hidden"
												name="todoId"
												value="cl84vjnlh0063wfpcr7ht2pef"
											/><input
												type="hidden"
												name="complete"
												value="false"
											/><button
												type="submit"
												name="intent"
												value="toggleTodo"
												class="toggle"
												title="Mark as incomplete"
											>
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
														stroke-width="3"
													></circle>
													<path
														fill="#5dc2af"
														d="M72 25L42 71 27 56l-4 4 20 20 34-52z"
													></path>
												</svg>
											</button>
										</form>
										<form
											method="post"
											action="/todos"
											enctype="application/x-www-form-urlencoded"
											class="update-form"
										>
											<input
												type="hidden"
												name="intent"
												value="updateTodo"
											/><input
												type="hidden"
												name="todoId"
												value="cl84vjnlh0063wfpcr7ht2pef"
											/><input
												name="title"
												class="edit-input"
												aria-describedby="todo-update-error-cl84vjnlh0063wfpcr7ht2pef"
												value="Take a nap"
											/>
										</form>
										<form
											method="post"
											action="/todos"
											enctype="application/x-www-form-urlencoded"
										>
											<input
												type="hidden"
												name="todoId"
												value="cl84vjnlh0063wfpcr7ht2pef"
											/><button
												class="destroy"
												title="Delete todo"
												type="submit"
												name="intent"
												value="deleteTodo"
											></button>
										</form>
									</div>
								</li>
								<li class="completed">
									<div class="view">
										<form
											method="post"
											action="/todos"
											enctype="application/x-www-form-urlencoded"
										>
											<input
												type="hidden"
												name="todoId"
												value="cl84vjnlh0070wfpczbct70et"
											/><input
												type="hidden"
												name="complete"
												value="false"
											/><button
												type="submit"
												name="intent"
												value="toggleTodo"
												class="toggle"
												title="Mark as incomplete"
											>
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
														stroke-width="3"
													></circle>
													<path
														fill="#5dc2af"
														d="M72 25L42 71 27 56l-4 4 20 20 34-52z"
													></path>
												</svg>
											</button>
										</form>
										<form
											method="post"
											action="/todos"
											enctype="application/x-www-form-urlencoded"
											class="update-form"
										>
											<input
												type="hidden"
												name="intent"
												value="updateTodo"
											/><input
												type="hidden"
												name="todoId"
												value="cl84vjnlh0070wfpczbct70et"
											/><input
												name="title"
												class="edit-input"
												aria-describedby="todo-update-error-cl84vjnlh0070wfpczbct70et"
												value="Stretch"
											/>
										</form>
										<form
											method="post"
											action="/todos"
											enctype="application/x-www-form-urlencoded"
										>
											<input
												type="hidden"
												name="todoId"
												value="cl84vjnlh0070wfpczbct70et"
											/><button
												class="destroy"
												title="Delete todo"
												type="submit"
												name="intent"
												value="deleteTodo"
											></button>
										</form>
									</div>
								</li>
								<li class="completed">
									<div class="view">
										<form
											method="post"
											action="/todos"
											enctype="application/x-www-form-urlencoded"
										>
											<input
												type="hidden"
												name="todoId"
												value="cl84vjnli0077wfpcjf5dcb8z"
											/><input
												type="hidden"
												name="complete"
												value="false"
											/><button
												type="submit"
												name="intent"
												value="toggleTodo"
												class="toggle"
												title="Mark as incomplete"
											>
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
														stroke-width="3"
													></circle>
													<path
														fill="#5dc2af"
														d="M72 25L42 71 27 56l-4 4 20 20 34-52z"
													></path>
												</svg>
											</button>
										</form>
										<form
											method="post"
											action="/todos"
											enctype="application/x-www-form-urlencoded"
											class="update-form"
										>
											<input
												type="hidden"
												name="intent"
												value="updateTodo"
											/><input
												type="hidden"
												name="todoId"
												value="cl84vjnli0077wfpcjf5dcb8z"
											/><input
												name="title"
												class="edit-input"
												aria-describedby="todo-update-error-cl84vjnli0077wfpcjf5dcb8z"
												value="Laundry"
											/>
										</form>
										<form
											method="post"
											action="/todos"
											enctype="application/x-www-form-urlencoded"
										>
											<input
												type="hidden"
												name="todoId"
												value="cl84vjnli0077wfpcjf5dcb8z"
											/><button
												class="destroy"
												title="Delete todo"
												type="submit"
												name="intent"
												value="deleteTodo"
											></button>
										</form>
									</div>
								</li>
								<li class="">
									<div class="view">
										<form
											method="post"
											action="/todos"
											enctype="application/x-www-form-urlencoded"
										>
											<input
												type="hidden"
												name="todoId"
												value="cl84vjnlj0084wfpc2woscffs"
											/><input
												type="hidden"
												name="complete"
												value="true"
											/><button
												type="submit"
												name="intent"
												value="toggleTodo"
												class="toggle"
												title="Mark as complete"
											>
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
														stroke-width="3"
													></circle>
												</svg>
											</button>
										</form>
										<form
											method="post"
											action="/todos"
											enctype="application/x-www-form-urlencoded"
											class="update-form"
										>
											<input
												type="hidden"
												name="intent"
												value="updateTodo"
											/><input
												type="hidden"
												name="todoId"
												value="cl84vjnlj0084wfpc2woscffs"
											/><input
												name="title"
												class="edit-input"
												aria-describedby="todo-update-error-cl84vjnlj0084wfpc2woscffs"
												value="Setup Database"
											/>
										</form>
										<form
											method="post"
											action="/todos"
											enctype="application/x-www-form-urlencoded"
										>
											<input
												type="hidden"
												name="todoId"
												value="cl84vjnlj0084wfpc2woscffs"
											/><button
												class="destroy"
												title="Delete todo"
												type="submit"
												name="intent"
												value="deleteTodo"
											></button>
										</form>
									</div>
								</li>
								<li class="completed">
									<div class="view">
										<form
											method="post"
											action="/todos"
											enctype="application/x-www-form-urlencoded"
										>
											<input
												type="hidden"
												name="todoId"
												value="cl84vjnll0090wfpckd7zxcsl"
											/><input
												type="hidden"
												name="complete"
												value="false"
											/><button
												type="submit"
												name="intent"
												value="toggleTodo"
												class="toggle"
												title="Mark as incomplete"
											>
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
														stroke-width="3"
													></circle>
													<path
														fill="#5dc2af"
														d="M72 25L42 71 27 56l-4 4 20 20 34-52z"
													></path>
												</svg>
											</button>
										</form>
										<form
											method="post"
											action="/todos"
											enctype="application/x-www-form-urlencoded"
											class="update-form"
										>
											<input
												type="hidden"
												name="intent"
												value="updateTodo"
											/><input
												type="hidden"
												name="todoId"
												value="cl84vjnll0090wfpckd7zxcsl"
											/><input
												name="title"
												class="edit-input"
												aria-describedby="todo-update-error-cl84vjnll0090wfpckd7zxcsl"
												value="Give talk"
											/>
										</form>
										<form
											method="post"
											action="/todos"
											enctype="application/x-www-form-urlencoded"
										>
											<input
												type="hidden"
												name="todoId"
												value="cl84vjnll0090wfpckd7zxcsl"
											/><button
												class="destroy"
												title="Delete todo"
												type="submit"
												name="intent"
												value="deleteTodo"
											></button>
										</form>
									</div>
								</li>
							</ul>
						</section>
						<footer class="footer">
							<span class="todo-count"
								><strong>1</strong
								><span>
									<!-- -->item<!-- -->
									left</span
								></span
							>
							<ul class="filters">
								<li><a class="selected" href="/todos">All</a></li>
								<li>
									<a class="" href="/todos/active">Active</a
									><link
										rel="modulepreload"
										href="/build/routes/todos/$filter-2PIU7QZC.js"
									/>
								</li>
								<li>
									<a class="" href="/todos/complete">Completed</a
									><link
										rel="modulepreload"
										href="/build/routes/todos/$filter-2PIU7QZC.js"
									/>
								</li>
							</ul>
							<form
								method="post"
								action="/todos"
								enctype="application/x-www-form-urlencoded"
							>
								<input
									type="hidden"
									name="intent"
									value="deleteCompletedTodos"
								/>
								<button class="clear-completed">Clear completed</button>
							</form>
						</footer>
					</div>
				</section>
				<footer class="info">
					<p>
						Created by <a href="http://github.com/kentcdodds">Kent C. Dodds</a>
					</p>
				</footer>
			</body>
		</html>
	`)
})

const server = app.listen(process.env.PORT || 3000, () => {
	console.log(`Server running at http://localhost:${server.address().port}`)
})
