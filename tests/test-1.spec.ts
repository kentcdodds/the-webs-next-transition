import { test as base, expect } from '@playwright/test'
import {
	locatorFixtures as fixtures,
	LocatorFixtures as TestingLibraryFixtures,
} from '@playwright-testing-library/test/fixture'

const test = base.extend<TestingLibraryFixtures>(fixtures)

test('test', async ({ page, screen }) => {
	// Go to http://localhost:7999/todos
	await page.goto('http://localhost:7999/todos')

	// Click text=todos
	await expect(screen.getByRole('heading', { name: 'todos' })).toBeVisible()

	// Click text=❯
	await screen.getByRole('button', { name: 'Mark all as complete' }).click()
	await expect(page).toHaveURL('http://localhost:7999/todos')

	// Click text=Clear completed
	await screen.getByRole('button', { name: 'Clear completed' }).click()

	await expect(page.locator('text=items left')).not.toBeVisible()

	await screen
		.getByRole('textbox', { name: 'New todo title' })
		.fill('Wash my hair')
	await screen.getByRole('textbox', { name: 'New todo title' }).press('Enter')
	await expect(page).toHaveURL('http://localhost:7999/todos')
	await expect(page.locator('text=1 item left')).toBeVisible()

	await screen.getByRole('link', { name: 'Active' }).click()
	await expect(page).toHaveURL('http://localhost:7999/todos/active')

	await screen.getByRole('button', { name: 'Mark all as complete' }).click()

	await expect(screen.queryByDisplayValue('Wash my hair')).not.toBeVisible()

	await screen.getByRole('link', { name: 'Completed' }).click()

	await screen.getByDisplayValue('Wash my hair').fill('Wash my hands')
	await screen.getByDisplayValue('Wash my hands').press('Enter')

	await expect(page).toHaveURL('http://localhost:7999/todos/complete')

	await screen.getByRole('button', { name: /Mark as incomplete/i }).click()
	await expect(page).toHaveURL('http://localhost:7999/todos/complete')
	await expect(page.locator('text=1 item left')).toBeVisible()
	await expect(screen.queryByDisplayValue('Wash my hands')).not.toBeVisible()

	await screen.getByRole('link', { name: 'All' }).click()
	await expect(page).toHaveURL('http://localhost:7999/todos')

	await screen.getByRole('button', { name: /Mark as complete/i }).click()
	await expect(page).toHaveURL('http://localhost:7999/todos')
	await expect(page.locator('text=0 items left')).toBeVisible()

	await screen.getByRole('button', { name: /Delete todo/i }).click()
	await expect(page).toHaveURL('http://localhost:7999/todos')

	await expect(page.locator('text=items left')).not.toBeVisible()
})
