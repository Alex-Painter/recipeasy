import React from "react";

const PromptHeaderText: React.FC = () => {
  return (
    <>
      <div className="flex items-center justify-center py-10 text-6xl text-slate-700">
        What will&nbsp;<span className="underline text-orange-400">you</span>
        &nbsp;create?
      </div>
      {/* <div className="flex items-center justify-center py-10 text-5xl text-slate-700">
        So, what do you want to eat?
      </div> */}
    </>
  );
};

export default PromptHeaderText;
