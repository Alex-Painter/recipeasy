const Button = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}) => {
  const handler = (_: any) => {};
  const onButtonClick = onClick ?? handler;
  return (
    <button
      onClick={(e) => onButtonClick(e)}
      className="bg-orange-400 rounded-md text-white text-sm px-6 py-2 mt-4 hover:bg-orange-500 shadow-lg"
    >
      {children}
    </button>
  );
};

export default Button;
