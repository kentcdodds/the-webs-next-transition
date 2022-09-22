import * as React from 'react'
import {
	RouterProvider,
	createBrowserRouter,
	useNavigate,
} from 'react-router-dom'
import TodosRoute, {
	loader as todoLoader,
	action as todoAction,
} from './routes/todos'

function Navigate({ to }: { to: string }) {
	const navigate = useNavigate()
	React.useEffect(() => {
		navigate(to)
	}, [navigate, to])
	return null
}

const router = createBrowserRouter([
	{
		path: '/todos',
		element: <TodosRoute />,
		loader: todoLoader,
		action: todoAction,
		children: [{ path: ':filter', element: <></> }],
	},
	{ path: '*', element: <Navigate to="/todos" /> },
])

export default function App() {
	return <RouterProvider router={router} />
}
