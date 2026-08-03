'use client';

import {
  useState,
  type SubmitEvent,
} from 'react';

import { MarkdownDescription } from './MarkdownDescription';

import {
  ApiError,
  type CreateTodoData,
  type LaravelValidationErrors,
  type Todo,
} from '@/app/lib/api';

type DescriptionMode = 'edit' | 'preview';

interface TodoFormProps {
  initialTodo?: Pick<Todo, 'title' | 'description'>;
  submitLabel: string;
  submittingLabel: string;
  resetAfterSubmit?: boolean;
  disabled?: boolean;
  onSubmit: (data: CreateTodoData) => Promise<void>;
  onCancel?: () => void;
}

export function TodoForm({
  initialTodo,
  submitLabel,
  submittingLabel,
  resetAfterSubmit = false,
  disabled = false,
  onSubmit,
  onCancel,
}: TodoFormProps) {
  const [title, setTitle] = useState(
    initialTodo?.title ?? '',
  );
  const [description, setDescription] = useState(
    initialTodo?.description ?? '',
  );
  const [descriptionMode, setDescriptionMode] =
    useState<DescriptionMode>('edit');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] =
    useState<LaravelValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const isDisabled = submitting || disabled;

  async function handleSubmit(
    event: SubmitEvent,
  ): Promise<void> {
    event.preventDefault();

    setError('');
    setFieldErrors({});
    setSubmitting(true);

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim()
          ? description
          : null,
      });

      if (resetAfterSubmit) {
        setTitle('');
        setDescription('');
        setDescriptionMode('edit');
      }
    } catch (caughtError) {
      if (caughtError instanceof ApiError) {
        setError(caughtError.message);
        setFieldErrors(caughtError.errors);
      } else {
        setError('Не удалось подключиться к серверу.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      {error && (
        <div className="alert error" role="alert">
          {error}
        </div>
      )}

      <label className="field">
        <span>Название</span>

        <input
          type="text"
          name="title"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
          }}
          placeholder="Например, купить продукты"
          maxLength={255}
          disabled={isDisabled}
          required
        />

        {fieldErrors.title?.[0] && (
          <small className="field-error">
            {fieldErrors.title[0]}
          </small>
        )}
      </label>

      <div className="field">
        <div className="field-heading">
          <span>Описание в Markdown</span>

          <div
            className="view-toggle"
            aria-label="Режим описания"
          >
            <button
              type="button"
              className={
                descriptionMode === 'edit' ? 'active' : ''
              }
              aria-pressed={descriptionMode === 'edit'}
              onClick={() => {
                setDescriptionMode('edit');
              }}
              disabled={isDisabled}
            >
              Редактор
            </button>

            <button
              type="button"
              className={
                descriptionMode === 'preview'
                  ? 'active'
                  : ''
              }
              aria-pressed={descriptionMode === 'preview'}
              onClick={() => {
                setDescriptionMode('preview');
              }}
              disabled={isDisabled}
            >
              Просмотр
            </button>
          </div>
        </div>

        {descriptionMode === 'edit' ? (
          <textarea
            name="description"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
            }}
            placeholder={
              'Поддерживаются **жирный текст**, списки, ссылки и блоки кода.'
            }
            maxLength={5000}
            rows={7}
            disabled={isDisabled}
          />
        ) : (
          <div className="markdown-preview">
            <MarkdownDescription markdown={description} />
          </div>
        )}

        <div className="field-meta">
          {fieldErrors.description?.[0] ? (
            <small className="field-error">
              {fieldErrors.description[0]}
            </small>
          ) : (
            <small>
              HTML выводится как обычный безопасный текст.
            </small>
          )}

          <small>{description.length}/5000</small>
        </div>
      </div>

      <div className="form-actions">
        <button
          className="button primary"
          type="submit"
          disabled={isDisabled}
        >
          {submitting ? submittingLabel : submitLabel}
        </button>

        {onCancel && (
          <button
            className="button secondary"
            type="button"
            onClick={onCancel}
            disabled={isDisabled}
          >
            Отмена
          </button>
        )}
      </div>
    </form>
  );
}
