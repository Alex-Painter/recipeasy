import Avatar from "../Avatar";

const RecipeChatHeader = ({
  promptText,
  username,
  userImgUrl,
}: {
  promptText: string;
  username: string | null;
  userImgUrl: string | null;
}) => {
  return (
    <div className="flex items-center">
      <div className="bg-blue-500 rounded-3xl py-1 px-3 text-white text-sm">
        {promptText}
      </div>
      <Avatar name={username} imageSrc={userImgUrl} />
    </div>
  );
};

export default RecipeChatHeader;
