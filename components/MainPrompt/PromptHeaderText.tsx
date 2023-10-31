import React from "react";

const PromptHeaderText: React.FC = () => {
  return (
    <>
      <div className="flex flex-wrap items-center justify-center py-10 mx-10 text-6xl text-slate-700">
        <div>What will&nbsp;</div>
        <div className="underline text-orange-400">you</div>
        <div>&nbsp;create?</div>
      </div>
      {/* <div className="flex items-center justify-center py-10 text-5xl text-slate-700">
        So, what do you want to eat?
      </div> */}
    </>
  );
};

export default PromptHeaderText;
