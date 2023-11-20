const Button = ({
  children,
  onClick,
  disabled,
  formMethod,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  formMethod?: string;
}) => {
  const handler = (_: any) => {};
  const onButtonClick = onClick ?? handler;
  return (
    <button
      formMethod={formMethod}
      onClick={(e) => onButtonClick(e)}
      className="bg-orange-400 rounded-md text-white text-sm px-6 py-2 hover:bg-orange-500 shadow-lg"
      disabled={disabled}
    >
      <div className="flex">{children}</div>
    </button>
  );
};

export default Button;
