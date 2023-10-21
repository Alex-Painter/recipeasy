import Image from "next/image";
import React from "react";

const PromptHeader: React.FC = () => {
  return (
    <div className="flex items-center justify-center py-10">
      <Image
        src="/logo-img.jpg"
        alt="Cartoon image of an AI-generated omlette"
        className="w-32 h-32 mr-4"
        width={1024}
        height={1024}
      />
      <Image
        src="/logo-text-new.png"
        alt="Cartoon-ish text spelling omelette like omlete"
        className="w-32 h-32 mr-4"
        width={1024}
        height={1024}
        style={{ transform: "rotate(20deg)" }}
      />
    </div>
  );
};

export default PromptHeader;
