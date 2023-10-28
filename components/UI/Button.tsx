const Button = ({ text }: { text: string }) => {
  return (
    <button className="bg-orange-400 rounded-md text-white text-sm px-6 py-2 mt-4 hover:bg-orange-500">
      {text}
    </button>
  );
};

export default Button;
