'use client';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import Link from 'next/link';

import { TodoCard } from '@/app/components/todos/TodoCard';
import { TodoForm } from '@/app/components/todos/TodoForm';
import { useAuth } from '@/app/context/AuthContext';

import {
  ApiError,
  todoApi,
  type CreateTodoData,
  type Todo,
  type UpdateTodoData,
} from '@/app/lib/api';

type TodoFilter = 'all' | 'active' | 'completed';

function requireToken(token: string | null): string {
  if (!token) {
    throw new ApiError(
      'Сессия не найдена. Войдите в аккаунт снова.',
      401,
    );
  }

  return token;
}

function getLoadErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  return 'Не удалось загрузить задачи.';
}

export default function TodosPage() {
  const { token, user } = useAuth();

  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] =
    useState<TodoFilter>('all');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadTodos(): Promise<void> {
      setLoading(true);
      setLoadError('');

      try {
        const response = await todoApi.list(
          requireToken(token),
        );

        if (active) {
          setTodos(response.data);
        }
      } catch (error) {
        if (active) {
          setLoadError(getLoadErrorMessage(error));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadTodos();

    return () => {
      active = false;
    };
  }, [token, reloadKey]);

  const activeCount = todos.filter(
    (todo) => !todo.is_completed,
  ).length;
  const completedCount = todos.length - activeCount;

  const filteredTodos = useMemo(() => {
    if (filter === 'active') {
      return todos.filter((todo) => !todo.is_completed);
    }

    if (filter === 'completed') {
      return todos.filter((todo) => todo.is_completed);
    }

    return todos;
  }, [filter, todos]);

  async function handleCreate(
    data: CreateTodoData,
  ): Promise<void> {
    const response = await todoApi.create(
      data,
      requireToken(token),
    );

    setTodos((currentTodos) => [
      response.data,
      ...currentTodos,
    ]);
    setFilter('all');
    setStatusMessage('Задача создана.');
  }

  async function handleUpdate(
    todoId: number,
    data: UpdateTodoData,
  ): Promise<void> {
    const response = await todoApi.update(
      todoId,
      data,
      requireToken(token),
    );

    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === todoId ? response.data : todo,
      ),
    );
    setStatusMessage('Изменения сохранены.');
  }

  async function handleDelete(todoId: number): Promise<void> {
    await todoApi.delete(todoId, requireToken(token));

    setTodos((currentTodos) =>
      currentTodos.filter((todo) => todo.id !== todoId),
    );
    setStatusMessage('Задача удалена.');
  }

  const emptyMessage =
    todos.length === 0
      ? 'У вас пока нет задач. Создайте первую выше.'
      : 'В этом разделе нет задач.';

  return (
    <main className="todos-page">
      <header className="todos-header">
        <div>
          <span className="eyebrow">Tasken</span>
          <h1>Мои задачи</h1>
          <p>
            {user?.email}. Все изменения сохраняются
            автоматически.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="button secondary"
        >
          Назад в панель
        </Link>
      </header>

      {statusMessage && (
        <div className="alert success" role="status">
          {statusMessage}
        </div>
      )}

      <section className="panel todo-create-panel">
        <header className="todo-panel-header">
          <span className="eyebrow">Новая задача</span>
          <h2>Что нужно сделать?</h2>
          <p>
            Описание поддерживает безопасный Markdown и
            предварительный просмотр.
          </p>
        </header>

        <TodoForm
          submitLabel="Создать задачу"
          submittingLabel="Создание..."
          resetAfterSubmit
          disabled={loading}
          onSubmit={handleCreate}
        />
      </section>

      <section className="todo-list-section">
        <div className="todo-list-header">
          <div>
            <span className="eyebrow">Ваш список</span>
            <h2>Задачи</h2>
          </div>

          <div className="filter-bar" aria-label="Фильтр задач">
            <button
              type="button"
              className={filter === 'all' ? 'active' : ''}
              aria-pressed={filter === 'all'}
              onClick={() => {
                setFilter('all');
              }}
            >
              Все <span>{todos.length}</span>
            </button>

            <button
              type="button"
              className={filter === 'active' ? 'active' : ''}
              aria-pressed={filter === 'active'}
              onClick={() => {
                setFilter('active');
              }}
            >
              Активные <span>{activeCount}</span>
            </button>

            <button
              type="button"
              className={
                filter === 'completed' ? 'active' : ''
              }
              aria-pressed={filter === 'completed'}
              onClick={() => {
                setFilter('completed');
              }}
            >
              Выполненные <span>{completedCount}</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="state-panel" role="status">
            <div className="loader" />
            <p>Загрузка задач...</p>
          </div>
        ) : loadError ? (
          <div className="state-panel error-state" role="alert">
            <h3>Не удалось загрузить задачи</h3>
            <p>{loadError}</p>

            <button
              type="button"
              className="button secondary"
              onClick={() => {
                setReloadKey((currentKey) => currentKey + 1);
              }}
            >
              Повторить
            </button>
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="state-panel empty-state">
            <span aria-hidden="true">✓</span>
            <h3>Список пуст</h3>
            <p>{emptyMessage}</p>
          </div>
        ) : (
          <div className="todo-list">
            {filteredTodos.map((todo) => (
              <TodoCard
                key={todo.id}
                todo={todo}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
