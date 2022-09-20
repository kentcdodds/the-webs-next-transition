import * as React from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import TodosRoute from './routes/todos'

function Navigate({ to }: { to: string }) {
	const navigate = useNavigate()
	React.useEffect(() => {
		navigate(to)
	}, [navigate, to])
	return null
}

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/todos" element={<TodosRoute />}>
					<Route path=":filter" element={<></>} />
				</Route>
				<Route path="*" element={<Navigate to="/todos" />} />
			</Routes>
		</BrowserRouter>
	)
}
