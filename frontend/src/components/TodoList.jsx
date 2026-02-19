import { useState } from "react";
import { validateTodoTitle, isTodoTitleValid, TODO_TITLE_MAX_LENGTH} from '../utils/validation';

const priorityColor = {
  low: "text-(--low) bg-(--low-bg)",
  medium: "text-(--medium) bg-(--medium-bg)",
  high: "text-(--high) bg-(--high-bg)",
};

function formatDate(dateStr) {
  return new Date(dateStr + "Z").toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const EditIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const ExpandIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const CollapseIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

function TodoItem({ todo, onToggle, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editPriority, setEditPriority] = useState(todo.priority);
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [editError, setEditError] = useState('');

  const validateEditTitle = (value) => {
    const error = validateTodoTitle(value);
    setEditError(error);
    return error;
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setEditTitle(newTitle);
    validateEditTitle(newTitle);
  };

  const handleSave = async () => {
    const trimmedTitle = editTitle.trim();
    const validationError = validateTodoTitle(trimmedTitle);
    
    if (validationError) {
      setEditError(validationError);
      return;
    }
    
    await onUpdate(todo.id, {
      title: trimmedTitle,
      priority: editPriority,
    });
    setEditing(false);
    setEditError('');
  };

  const handleCancel = () => {
    setEditing(false);
    setEditTitle(todo.title);
    setEditPriority(todo.priority);
    setEditError('');
  };

  const needsTruncation =
    todo.title.length >= 50 ||
    todo.title.split(" ").some((word) => word.length > 20);

  const displayTitle =
    expanded || !needsTruncation
      ? todo.title
      : todo.title.length >= 50
        ? todo.title.slice(0, 47) + "…"
        : todo.title;

  const isEditValid = isTodoTitleValid(editTitle);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        relative
        group 
        flex items-start gap-3.5 
        py-4 px-4
        border-b 
        border-solid border-(--border)
        transition-all duration-200
        ${hovered ? "bg-(--bg-subtle)" : "bg-transparent"}
      `}
    >
      {/* checkbox */}
      <button
        onClick={() => onToggle(todo.id, !todo.completed)}
        className={`
          mt-1 w-4.5 h-4.5 
          rounded-full border-[1.5px] 
          border-solid shrink-0 cursor-pointer
          flex items-center justify-center 
          transition-all duration-200
          ${
            todo.completed
              ? "border-(--accent) bg-(--accent)"
              : "border-(--border-focus) bg-transparent"
          }
        `}
      >
        {todo.completed && (
          <svg
            width="9"
            height="9"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>

      {/* main box */}
      <div className="flex-1 min-w-0 pr-6">
        {editing ? (
          <div className="flex flex-col gap-2">
            <div className="relative">
              <input
                autoFocus
                value={editTitle}
                onChange={handleTitleChange}
                className={`
                  bg-(--bg-card) 
                  border ${editError ? 'border-(--high)' : 'border-(--border-focus)'}
                  rounded-lg 
                  py-1.5 px-2 
                  text-sm text-(--text-primary) 
                  outline-none w-full
                  pr-16
                `}
                maxLength={TODO_TITLE_MAX_LENGTH + 1}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-(--text-muted)">
                {editTitle.length}/{TODO_TITLE_MAX_LENGTH}
              </div>
            </div>
            
            {editError && (
              <div className="text-(--high) text-xs flex items-center gap-1">
                <span>⚠</span> {editError}
              </div>
            )}
            <div className="flex gap-1.5 items-center flex-wrap">
              {["low", "medium", "high"].map((p) => (
                <button
                  key={p}
                  onClick={() => setEditPriority(p)}
                  className={`
                    py-1 px-2.5 
                    text-[0.7rem] 
                    rounded-full 
                    border 
                    cursor-pointer 
                    transition-all 
                    ${
                      editPriority === p
                        ? priorityColor[p]
                        : "bg-transparent text-(--text-muted)"
                    }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={handleSave}
                disabled={!isEditValid}
                className={`
                  ml-auto 
                  text-xs 
                  ${isEditValid 
                    ? 'text-(--accent) hover:underline hover:cursor-pointer' 
                    : 'text-(--text-muted) cursor-not-allowed'}
                `}
              >
                Save
              </button>

              <button
                onClick={handleCancel}
                className="
                  text-xs text-(--text-muted) 
                  hover:underline 
                  hover:text-(--high)/80 
                  hover:cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-2">
              <span
                className={`
                  w-1.5 h-1.5 
                  rounded-full 
                  shrink-0 
                  mt-1.5
                  ${todo.completed ? "opacity-40" : ""}
                `}
                style={{ backgroundColor: `var(--${todo.priority})`}}
              />
              <div className="flex-1 min-w-0">
                <div
                  className={`
                    text-sm font-light 
                    leading-snug 
                    transition-all 
                    duration-200 
                    wrap-break-word
                    ${expanded ? "whitespace-normal" : "line-clamp-2"}
                    ${
                      todo.completed
                        ? "text-(--text-muted) line-through opacity-60"
                        : "text-(--text-primary)"
                    }`}
                >
                  {displayTitle}
                </div>

                {needsTruncation && (
                  <div>
                    <button
                      onClick={() => setExpanded(!expanded)}
                      className="
                        inline-flex items-center gap-0.5
                        text-[10px] 
                        text-(--accent)
                        hover:text-(--accent-hover)
                        transition-colors
                        cursor-pointer
                        font-medium
                      "
                    >
                      {expanded ? (
                        <>
                          Show less <CollapseIcon />
                        </>
                      ) : (
                        <>
                          Show more <ExpandIcon />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
            <p
              className="
                text-[12px]
                text-(--text-muted) 
                mt-1 pl-3.5 
                uppercase tracking-wider"
            >
              {formatDate(todo.created_at)}
            </p>
          </>
        )}
      </div>

      {!editing && (
        <>
          {/* edit icon */}
          <button
            onClick={() => setEditing(true)}
            className={`
              absolute top-2
              right-3 p-1.5
              rounded-lg
              text-(--text-muted) 
              hover:text-(--accent) 
              hover:bg-(--accent)/10
              transition-all duration-200 cursor-pointer
              ${
                hovered
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-1"
              }
            `}
            title="Edit"
          >
            <EditIcon />
          </button>

          {/* delete icon */}
          <button
            onClick={() => onDelete(todo.id)}
            className={`
              absolute bottom-2
              right-3 p-1.5 
              rounded-lg
              text-(--text-muted) 
              hover:text-(--high) 
              hover:bg-(--high)/10
              transition-all duration-200 cursor-pointer
              ${
                hovered
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-1"
              }
            `}
            title="Delete"
          >
            <TrashIcon />
          </button>
        </>
      )}
    </div>
  );
}

export default function TodoList({ todos, onToggle, onUpdate, onDelete }) {
  if (todos.length === 0) {
    return (
      <div
        className="
        text-center
        py-14
        text-(--text-muted)
        text-sm
        italic
        font-serif
      "
      >
        Nothing Here Yet
      </div>
    );
  }

  return (
    <div
      className="
        bg-(--bg-card)
        border border-solid border-(--border)
        rounded-(--radius)
        overflow-hidden
        shadow-(--shadow)
        transition-all duration-200
      "
    >
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
