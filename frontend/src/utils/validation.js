export const TODO_TITLE_MAX_LENGTH = 100;

export const validateTodoTitle = (title) => {
  const trimmed = title?.trim() || '';
  
  if (!trimmed) {
    return 'Title is required';
  }
  
  if (trimmed.length > TODO_TITLE_MAX_LENGTH) {
    return `Title must be less than ${TODO_TITLE_MAX_LENGTH} characters`;
  }
  
  return '';
};

export const isTodoTitleValid = (title) => {
  return validateTodoTitle(title) === '';
};
