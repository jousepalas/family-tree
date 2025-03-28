import React from 'react';

// Define os tipos de props que o Input pode receber, estendendo os atributos padrão de um input HTML
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string; // Label opcional para acessibilidade e clareza
  error?: string; // Mensagem de erro opcional para exibir
}

const Input: React.FC<InputProps> = ({ label, id, error, className, ...props }) => {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`
          block w-full px-3 py-2 border rounded-md shadow-sm
          border-gray-300 dark:border-gray-600
          bg-white dark:bg-gray-700
          text-gray-900 dark:text-gray-100
          placeholder-gray-400 dark:placeholder-gray-500
          focus:outline-none focus:ring-indigo-500 focus:border-indigo-500
          sm:text-sm
          ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
          ${className} // Permite adicionar/sobrescrever classes
        `}
        {...props} // Passa todas as outras props (type, name, value, onChange, etc.)
      />
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};

export default Input;