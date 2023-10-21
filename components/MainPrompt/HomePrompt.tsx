import React from "react";
import PromptHeader from "./PromptHeader";
import PromptInput from "./PromptInput";

const HomePrompt: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <PromptHeader />
      <PromptInput />
    </div>
  );
};

export default HomePrompt;
