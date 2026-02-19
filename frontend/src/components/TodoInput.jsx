import { useState } from "react";
import { validateTodoTitle, isTodoTitleValid, TODO_TITLE_MAX_LENGTH } from "../utils/Validation";


const PRIORITIES = ["low", "medium", "high"];

const priorityStyles = {
  low: "text-(--low) bg-(--low-bg)",
  medium: "text-(--medium) bg-(--medium-bg)",
  high: "text-(--high) bg-(--high-bg)",
};

export default function TodoInput({ onCreate }) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const validateTitle = (value) => {
    return validateTodoTitle(value);
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setError(validateTitle(newTitle));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const trimmedTitle = title.trim();
    const validationError = validateTitle(trimmedTitle);
    
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setSubmitting(true);
    setError("");
    
    try {
      await onCreate({ title: trimmedTitle, priority, completed: false });
      setTitle("");
      setPriority("medium");
    } catch (err) {
      setError("Failed to create todo. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isTitleValid = isTodoTitleValid(title);

  return (
    <form onSubmit={handleSubmit}>
      <div
        className="
          bg-(--bg-card) 
          border border-solid 
          border-(--border) 
          rounded-(--radius)
          py-4 px-5 
          shadow-(--shadow) 
          transition-all duration-200"
      >
        <div className="relative">
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            onBlur={() => setError(validateTitle(title))}
            placeholder="What needs to be done?"
            disabled={submitting}
            maxLength={201}
            className={`
              w-full 
              bg-transparent border-none 
              outline-none 
              text-sm font-[DM Sans, sans-serif] 
              font-light text-(--text-primary) 
              mb-3.5
              ${error ? 'placeholder:text-(--high)/50' : ''}
            `}
          />
          
          <div className="absolute right-0 -top-2.5 p-1 text-[10px] text-(--text-muted)">
            {title.length}/{TODO_TITLE_MAX_LENGTH}
          </div>
        </div>

        {error && (
          <div className="text-(--high) text-xs mb-3 flex items-center gap-1">
            <span>⚠</span> {error}
          </div>
        )}

        <div className="flex items-center justify-between">
          {/* priority buttons */}
          <div className="flex gap-1.5">
            {PRIORITIES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`
                  py-1 px-3
                  rounded-full
                  border
                  cursor-pointer
                  text-xs font-[DM Sans, sans-serif]
                  font-normal
                  transition-all duration-200
                  ${
                    priority === p
                      ? priorityStyles[p]
                      : "bg-transparent text-(--text-muted)"
                  }
                `}
              >
                {p}
              </button>
            ))}
          </div>

          {/* add new todo item button */}
          <button
            type="submit"
            disabled={submitting || !isTitleValid}
            className={`
              py-1.5 px-4
              ${isTitleValid ? "bg-(--accent)" : "bg-(--bg-subtle)"}
              ${isTitleValid ? "text-white" : "text-(--text-muted)"}
              border-none
              rounded-full
              text-xs font-[DM Sans, sans-serif]
              font-normal
              ${isTitleValid ? "cursor-pointer" : "cursor-not-allowed"}
              transition-all duration-200
              relative
            `}
            title={!isTitleValid ? "Title must be 1-100 characters" : ""}
          >
            {submitting ? (
              <span className="flex items-center gap-1">
                <span className="animate-spin">⋯</span>
              </span>
            ) : (
              "Add"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
