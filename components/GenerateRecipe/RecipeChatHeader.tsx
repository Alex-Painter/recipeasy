import Avatar from "../Avatar";
import { formatTimeAgo } from "../RecipeList/RecipeCardOld";

const RecipeChatHeader = ({
  promptText,
  username,
  userImgUrl,
  createdAt,
}: {
  promptText: string;
  username: string | null;
  userImgUrl: string | null;
  createdAt: Date;
}) => {
  const timeAgo = formatTimeAgo(createdAt);
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center">
        <div className="bg-blue-500 rounded-3xl py-1 px-3 text-white text-sm">
          {promptText}
        </div>
        <Avatar name={username} imageSrc={userImgUrl} shouldShowMenu={false} />
      </div>
      <span className="flex flex-row-reverse text-xs opacity-50 w-full">
        <time className="pl-1 pr-3">{timeAgo}</time>
        &bull;
        <span className="px-1">{username}</span>
      </span>
    </div>
  );
};

export default RecipeChatHeader;
