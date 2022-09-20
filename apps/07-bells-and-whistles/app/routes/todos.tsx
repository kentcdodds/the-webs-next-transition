import * as React from "react";
import type { Todo } from "@prisma/client";
import type { ActionArgs, LinksFunction, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  useCatch,
  useFetcher,
  useLoaderData,
  Link,
  useLocation,
  useFetchers,
} from "@remix-run/react";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";
import todosStylesheet from "./todos.css";
import invariant from "tiny-invariant";
import { CompleteIcon, IncompleteIcon } from "~/icons";
import cuid from "cuid";

type TodoItem = Pick<Todo, "id" | "complete" | "title" | "createdAt">;
type Filter = "all" | "active" | "complete";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: todosStylesheet }];
};

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  return json({
    todos: await prisma.todo.findMany({
      where: { userId },
      select: { id: true, complete: true, title: true, createdAt: true },
    }),
  });
}

function validateNewTodoTitle(title: string) {
  return title ? null : "Todo title required";
}

function validateId(id: string) {
  return id ? null : "Todo id required";
}

function validateCreatedAt(createdAt: string) {
  if (!createdAt) return null;
  const dateTime = new Date(createdAt).getTime();
  if (Number.isNaN(dateTime)) return "Todo createdAt date is invalid";
}

type CreateTodoActionData = {
  id: string;
  error: string;
};

type UpdateTodoActionData = {
  title: string;
  error: string;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function action({ request }: ActionArgs) {
  // await sleep(Math.random() * 1000 + 500);
  const formData = await request.formData();
  const userId = await requireUserId(request);

  const intent = formData.get("intent");

  switch (intent) {
    case "createTodo": {
      const title = formData.get("title");
      const id = formData.get("id");
      const createdAt = formData.get("createdAt");
      invariant(typeof title === "string", "title must be a string");
      invariant(typeof id === "string", "id must be a string");
      invariant(typeof createdAt === "string", "createdAt must be a string");
      if (title.includes("error")) {
        return json<CreateTodoActionData>(
          { id, error: `Todos cannot include the word "error"` },
          { status: 400 }
        );
      }
      const createdAtError = validateCreatedAt(createdAt);
      if (createdAtError) {
        throw new Error("We messed up the createdAt. Sorry");
      }
      const idError = validateId(id);
      if (idError) {
        throw new Error("We messed up the id. Sorry");
      }
      const titleError = validateNewTodoTitle(title);
      if (titleError) {
        return json<CreateTodoActionData>(
          { id, error: titleError },
          { status: 400 }
        );
      }
      await prisma.todo.create({
        data: {
          id,
          complete: false,
          title: String(title),
          userId,
          createdAt: createdAt ? new Date(createdAt) : undefined,
        },
      });
      return new Response(null);
    }
    case "toggleAllTodos": {
      await prisma.todo.updateMany({
        where: { userId },
        data: { complete: formData.get("complete") === "true" },
      });
      return new Response(null);
    }
    case "deleteCompletedTodos": {
      await prisma.todo.deleteMany({ where: { complete: true, userId } });
      return new Response(null);
    }
  }

  const todoId = String(formData.get("todoId"));
  // make sure the todo belongs to the user
  const todo = await prisma.todo.findFirst({ where: { id: todoId, userId } });

  if (!todo) {
    throw json({ error: "todo not found" }, { status: 404 });
  }

  switch (intent) {
    case "toggleTodo": {
      await prisma.todo.update({
        where: { id: todoId },
        data: { complete: formData.get("complete") === "true" },
      });
      return new Response(null);
    }
    case "updateTodo": {
      const title = formData.get("title");
      invariant(typeof title === "string", "title must be a string");
      if (title.includes("error")) {
        return json<UpdateTodoActionData>(
          { title, error: `Todos cannot include the word "error"` },
          { status: 400 }
        );
      }
      const titleError = validateNewTodoTitle(title);
      if (titleError) {
        return json<UpdateTodoActionData>(
          { title, error: titleError },
          { status: 400 }
        );
      }

      await prisma.todo.update({
        where: { id: todoId },
        data: { title },
      });
      return new Response(null);
    }
    case "deleteTodo": {
      await prisma.todo.delete({ where: { id: todoId } });
      return new Response(null);
    }
    default: {
      throw json({ message: `Unknown intent: ${intent}` }, { status: 400 });
    }
  }
}

const cn = (...cns: Array<string | false>) => cns.filter(Boolean).join(" ");

function canBeOptimistic(fetcher: { state: string; data: any }) {
  return (
    fetcher.state === "submitting" ||
    (fetcher.state === "loading" && !fetcher.data)
  );
}

export default function TodosRoute() {
  const todos = useLoaderData<typeof loader>().todos.map((t: any) => ({
    ...t,
    createdAt: new Date(t.createdAt),
  }));
  const clearFetcher = useFetcher();
  const toggleAllFetcher = useFetcher();
  const location = useLocation();

  const [newTodoIds, setNewTodoIds] = React.useState<Array<string>>(() => [
    cuid(),
  ]);

  let optimisticTodos = [...todos];

  let clearingTodos = canBeOptimistic(clearFetcher);
  if (clearingTodos) {
    optimisticTodos = optimisticTodos.filter((todo) => !todo.complete);
  }

  let togglingComplete: boolean | undefined;
  if (canBeOptimistic(toggleAllFetcher)) {
    togglingComplete =
      toggleAllFetcher.submission?.formData.get("complete") === "true";
    optimisticTodos = optimisticTodos.map((todo) => ({
      ...todo,
      complete: togglingComplete as boolean,
    }));
  }

  const allFetchers = useFetchers();
  const optimisticFetchers = allFetchers.filter((f) => canBeOptimistic(f));
  const createFetchers = optimisticFetchers.filter(
    (f) => f.submission?.formData.get("intent") === "createTodo"
  );
  const deleteFetchers = optimisticFetchers.filter(
    (f) => f.submission?.formData.get("intent") === "deleteTodo"
  );
  const toggleFetchers = optimisticFetchers.filter(
    (f) => f.submission?.formData.get("intent") === "toggleTodo"
  );

  for (const fetcher of deleteFetchers) {
    optimisticTodos = optimisticTodos.filter(
      (todo) => todo.id !== fetcher.submission?.formData.get("todoId")
    );
  }

  for (const fetcher of toggleFetchers) {
    optimisticTodos = optimisticTodos.map((todo) => {
      if (todo.id === fetcher.submission?.formData.get("todoId")) {
        return {
          ...todo,
          complete: fetcher.submission?.formData.get("complete") === "true",
        };
      }
      return todo;
    });
  }

  const newTodoInputNeeded = newTodoIds.every(
    (id) =>
      todos.some((t) => t.id === id) ||
      optimisticFetchers.some(
        (f) =>
          f.submission?.formData.get("intent") === "createTodo" &&
          f.submission?.formData.get("id") === id
      )
  );
  React.useEffect(() => {
    if (newTodoInputNeeded) {
      setNewTodoIds((ids) => [...ids, cuid()]);
    }
  }, [newTodoInputNeeded]);

  const unfinishedTodos = newTodoIds.filter((id) =>
    todos.every((t) => t.id !== id)
  );
  const hasFinishedTodos = unfinishedTodos.length !== newTodoIds.length;
  React.useEffect(() => {
    if (hasFinishedTodos) {
      setNewTodoIds(unfinishedTodos);
    }
  }, [hasFinishedTodos, unfinishedTodos]);

  const firstFailedNewTodoFetcher = allFetchers.find(
    (f) => !canBeOptimistic(f) && f.state !== "submitting" && f.data?.error
  );

  const newTodoIdToDisplay =
    firstFailedNewTodoFetcher?.data.id ?? newTodoIds.at(-1);

  const optimisticNewTodos: Array<TodoItem> = [];
  for (const fetcher of createFetchers) {
    const newTodoTitle = fetcher.submission?.formData.get("title");
    const id = fetcher.submission?.formData.get("id");
    const createdAt = fetcher.submission?.formData.get("createdAt");
    if (
      // it's already finished
      todos.every((t) => t.id !== id) &&
      // the ID is valid
      typeof id === "string" &&
      !validateId(id) &&
      // the title is valid
      typeof newTodoTitle === "string" &&
      !validateNewTodoTitle(newTodoTitle) &&
      // the createdAt is valid
      typeof createdAt === "string" &&
      !validateCreatedAt(createdAt)
    ) {
      const newTodo = {
        id,
        title: newTodoTitle,
        complete: false,
        createdAt: new Date(createdAt),
      };
      optimisticTodos.push(newTodo);
      optimisticNewTodos.push(newTodo);
    }
  }

  const todosToRender = [...todos, ...optimisticNewTodos].sort((a, b) => {
    return a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0;
  });

  const hasCompleteTodos = optimisticTodos.some(
    (todo) => todo.complete === true
  );

  const filter: Filter = location.pathname.endsWith("/complete")
    ? "complete"
    : location.pathname.endsWith("/active")
    ? "active"
    : "all";

  const remainingActive = optimisticTodos.filter((t) => !t.complete);
  const optimisticTodosToRender = todosToRender.filter((t) =>
    optimisticTodos.some((ot) => ot.id === t.id)
  );
  const optimisticTodosRemain = optimisticTodosToRender.length > 0;
  const allComplete = optimisticTodosRemain && remainingActive.length === 0;

  return (
    <>
      <section className="todoapp">
        <div>
          <header className="header">
            <h1>todos</h1>
            {newTodoIds.map((id) => (
              <CreateInput
                key={id}
                id={id}
                hidden={newTodoIdToDisplay !== id}
              />
            ))}
          </header>
          <section className={cn("main", !optimisticTodosRemain && "no-todos")}>
            <toggleAllFetcher.Form method="post">
              <input
                type="hidden"
                name="complete"
                value={(!allComplete).toString()}
              />
              <button
                className={`toggle-all ${allComplete ? "checked" : ""}`}
                type="submit"
                name="intent"
                value="toggleAllTodos"
                disabled={todosToRender.length === 0}
                title={
                  allComplete
                    ? "Mark all as incomplete"
                    : "Mark all as complete"
                }
              >
                ❯
              </button>
            </toggleAllFetcher.Form>
            <ul className="todo-list" hidden={!optimisticTodosRemain}>
              {todosToRender.map((todo) => (
                <ListItem
                  todo={todo}
                  key={todo.id}
                  filter={filter}
                  togglingComplete={togglingComplete}
                  clearingTodos={clearingTodos}
                />
              ))}
            </ul>
          </section>
          <footer className="footer" hidden={!optimisticTodosRemain}>
            <span className="todo-count">
              <strong>{remainingActive.length}</strong>
              <span>
                {" "}
                {remainingActive.length === 1 ? "item" : "items"} left
              </span>
            </span>
            <ul className="filters">
              <li>
                <Link
                  to="."
                  className={cn(filter === "all" && "selected")}
                  prefetch="render"
                >
                  All
                </Link>
              </li>{" "}
              <li>
                <Link
                  to="active"
                  className={cn(filter === "active" && "selected")}
                  prefetch="render"
                >
                  Active
                </Link>
              </li>{" "}
              <li>
                <Link
                  to="complete"
                  className={cn(filter === "complete" && "selected")}
                  prefetch="render"
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
  );
}

function CreateInput({ id, hidden }: { id: string; hidden?: boolean }) {
  const createFetcher = useFetcher<CreateTodoActionData>();

  const createFetcherData = createFetcher.data;

  const createInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!hidden) createInputRef.current?.focus();
  }, [hidden]);

  return (
    <createFetcher.Form
      method="post"
      className="create-form"
      hidden={hidden}
      onSubmit={(e) =>
        ((e.currentTarget.elements as any).createdAt.value = new Date()
          .toISOString()
          .slice(0, -1))
      }
    >
      <input type="hidden" name="intent" value="createTodo" />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="createdAt" />
      <input
        className="new-todo"
        placeholder="What needs to be done?"
        name="title"
        autoFocus
        ref={createInputRef}
        aria-invalid={createFetcherData?.error ? true : undefined}
        aria-describedby="new-todo-error"
      />
      {createFetcherData?.error ? (
        <div className="error" id="new-todo-error">
          {createFetcherData?.error}
        </div>
      ) : null}
    </createFetcher.Form>
  );
}

function ListItem({
  todo,
  filter,
  togglingComplete,
  clearingTodos,
}: {
  todo: TodoItem;
  filter: Filter;
  togglingComplete?: boolean;
  clearingTodos: boolean;
}) {
  const updateFetcher = useFetcher();
  const toggleFetcher = useFetcher();
  const deleteFetcher = useFetcher();
  const updateFormRef = React.useRef<HTMLFormElement>(null);

  const isDeleting =
    canBeOptimistic(deleteFetcher) || (clearingTodos && todo.complete);
  const isToggling = canBeOptimistic(toggleFetcher);

  const optimisticComplete = isToggling
    ? toggleFetcher.submission?.formData.get("complete") === "true"
    : typeof togglingComplete === "boolean"
    ? togglingComplete
    : todo.complete;

  const shouldRender =
    filter === "all" ||
    (filter === "complete" && optimisticComplete) ||
    (filter === "active" && !optimisticComplete);

  if (isDeleting || !shouldRender) return null;

  return (
    <li className={optimisticComplete ? "completed" : ""}>
      <div className="view">
        <toggleFetcher.Form method="post">
          <input type="hidden" name="todoId" value={todo.id} />
          <input
            type="hidden"
            name="complete"
            value={(!optimisticComplete).toString()}
          />
          <button
            type="submit"
            name="intent"
            value="toggleTodo"
            className="toggle"
            disabled={todo.id === "new"}
            title={
              optimisticComplete ? "Mark as incomplete" : "Mark as complete"
            }
          >
            {optimisticComplete ? <CompleteIcon /> : <IncompleteIcon />}
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
            disabled={todo.id === "new"}
            onBlur={(e) => {
              if (todo.title !== e.currentTarget.value) {
                updateFetcher.submit(e.currentTarget.form);
              }
            }}
            aria-invalid={updateFetcher.data?.error ? true : undefined}
            aria-describedby={`todo-update-error-${todo.id}`}
          />
          {updateFetcher.data?.error && updateFetcher.state !== "submitting" ? (
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
            disabled={todo.id === "new"}
          />
        </deleteFetcher.Form>
      </div>
    </li>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 400) {
    return <div>You did something wrong: {caught.data.message}</div>;
  }

  if (caught.status === 404) {
    return <div>Not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}
