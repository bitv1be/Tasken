'use client';

import { useState } from 'react';

import { MarkdownDescription } from './MarkdownDescription';
import { TodoForm } from './TodoForm';

import {
  ApiError,
  type Todo,
  type UpdateTodoData,
} from '@/app/lib/api';

interface TodoCardProps {
  todo: Todo;
  onUpdate: (
    todoId: number,
    data: UpdateTodoData,
  ) => Promise<void>;
  onDelete: (todoId: number) => Promise<void>;
}

function getActionErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  return 'Не удалось подключиться к серверу.';
}

export function TodoCard({
  todo,
  onUpdate,
  onDelete,
}: TodoCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] =
    useState(false);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState('');

  async function handleToggle(): Promise<void> {
    setActionError('');
    setToggling(true);

    try {
      await onUpdate(todo.id, {
        is_completed: !todo.is_completed,
      });
    } catch (error) {
      setActionError(getActionErrorMessage(error));
    } finally {
      setToggling(false);
    }
  }

  async function handleDelete(): Promise<void> {
    setActionError('');
    setDeleting(true);

    try {
      await onDelete(todo.id);
    } catch (error) {
      setActionError(getActionErrorMessage(error));
      setDeleting(false);
    }
  }

  async function handleEdit(
    data: UpdateTodoData,
  ): Promise<void> {
    await onUpdate(todo.id, data);
    setIsEditing(false);
  }

  return (
    <article
      className={`todo-card${
        todo.is_completed ? ' completed' : ''
      }`}
      aria-busy={toggling || deleting}
    >
      {isEditing ? (
        <div className="todo-editing">
          <div className="todo-card-heading">
            <div>
              <span className="eyebrow">
                Редактирование
              </span>

              <h2>{todo.title}</h2>
            </div>
          </div>

          <TodoForm
            initialTodo={todo}
            submitLabel="Сохранить"
            submittingLabel="Сохранение..."
            onSubmit={handleEdit}
            onCancel={() => {
              setIsEditing(false);
            }}
          />
        </div>
      ) : (
        <>
          <div className="todo-card-heading">
            <label className="todo-checkbox">
              <input
                type="checkbox"
                checked={todo.is_completed}
                onChange={() => {
                  void handleToggle();
                }}
                disabled={toggling || deleting}
              />

              <span className="sr-only">
                {todo.is_completed
                  ? 'Отметить задачу активной'
                  : 'Отметить задачу выполненной'}
              </span>
            </label>

            <div className="todo-title-group">
              <h2>{todo.title}</h2>

              <span
                className={`status-badge ${
                  todo.is_completed ? 'done' : 'active'
                }`}
              >
                {todo.is_completed
                  ? 'Выполнено'
                  : 'Активно'}
              </span>
            </div>
          </div>

          {todo.description ? (
            <MarkdownDescription
              markdown={todo.description}
            />
          ) : (
            <p className="markdown-empty">
              Описание не добавлено.
            </p>
          )}

          <div className="todo-card-footer">
            <time dateTime={todo.created_at}>
              Создано{' '}
              {new Date(todo.created_at).toLocaleString(
                'ru-RU',
              )}
            </time>

            <div className="todo-actions">
              <button
                type="button"
                className="button secondary compact"
                onClick={() => {
                  setActionError('');
                  setConfirmingDelete(false);
                  setIsEditing(true);
                }}
                disabled={toggling || deleting}
              >
                Редактировать
              </button>

              <button
                type="button"
                className="button danger-outline compact"
                onClick={() => {
                  setActionError('');
                  setConfirmingDelete(true);
                }}
                disabled={toggling || deleting}
              >
                Удалить
              </button>
            </div>
          </div>

          {confirmingDelete && (
            <div className="delete-confirmation">
              <p>
                Удалить эту задачу без возможности
                восстановления?
              </p>

              <div className="form-actions">
                <button
                  type="button"
                  className="button danger compact"
                  onClick={() => {
                    void handleDelete();
                  }}
                  disabled={deleting}
                >
                  {deleting ? 'Удаление...' : 'Удалить'}
                </button>

                <button
                  type="button"
                  className="button secondary compact"
                  onClick={() => {
                    setConfirmingDelete(false);
                  }}
                  disabled={deleting}
                >
                  Отмена
                </button>
              </div>
            </div>
          )}

          {actionError && (
            <div className="alert error" role="alert">
              {actionError}
            </div>
          )}
        </>
      )}
    </article>
  );
}
