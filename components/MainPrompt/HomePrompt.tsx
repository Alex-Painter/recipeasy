import React from "react";
import PromptHeader from "./PromptHeader";
import PromptInput from "./PromptInput";
import { getCurrentUser } from "../../lib/session";
import PromptHeaderText from "./PromptHeaderText";

const HomePrompt: React.FC = async () => {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col items-center justify-center">
      {/* <PromptHeader /> */}
      <PromptHeaderText />
      <PromptInput user={user} />
    </div>
  );
};

export default HomePrompt;
