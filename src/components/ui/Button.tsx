import React from 'react';

// Define os tipos de props, estendendo os atributos padrão de um botão HTML
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // Adicione variantes se necessário (ex: 'primary', 'secondary', 'danger')
  variant?: 'primary' | 'secondary';
  isLoading?: boolean; // Para mostrar estado de carregamento
}

const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary', // Define 'primary' como padrão
  isLoading = false,
  disabled,
  ...props
}) => {
  // Estilos base e variantes
  const baseStyle = 'inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const primaryStyle = 'text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600';
  const secondaryStyle = 'text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:ring-indigo-500 dark:text-indigo-300 dark:bg-indigo-800 dark:hover:bg-indigo-700';

  const variantStyle = variant === 'primary' ? primaryStyle : secondaryStyle;

  return (
    <button
      type="button" // Padrão para evitar submit acidental em forms
      className={`${baseStyle} ${variantStyle} ${className}`}
      disabled={disabled || isLoading} // Desabilita se estiver carregando ou explicitamente desabilitado
      {...props}
    >
      {isLoading && (
        // Spinner simples
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;