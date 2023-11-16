const Button = ({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}) => {
  const handler = (_: any) => {};
  const onButtonClick = onClick ?? handler;
  return (
    <button
      onClick={(e) => onButtonClick(e)}
      className="bg-orange-400 rounded-md text-white text-sm px-6 py-2 mt-4 hover:bg-orange-500 shadow-lg"
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
