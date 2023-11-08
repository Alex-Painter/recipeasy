type StepListProps = {
  instructions: PrismaJson.RecipeInstructions | null | undefined;
};

const StepList = ({ instructions }: StepListProps) => {
  return (
    <div>
      <h3 className="font-semibold mb-2 mt-4 md:mt-0">Instructions</h3>
      <div className="grid">
        {instructions &&
          instructions.instructions.map((step, index) => (
            <div key={index} className="mb-2">
              <InstructionRow instruction={step} stepNum={index + 1} />
            </div>
          ))}
        {/* {isLoading && <LoadingRows />} */}
      </div>
    </div>
  );
};

export default StepList;

const InstructionRow = ({
  instruction,
  stepNum,
}: {
  instruction: string;
  stepNum: number;
}) => {
  return (
    <div className="flex flex-col">
      <div>
        <div>Step {stepNum}.</div>
        <hr className="mb-3" />
      </div>
      <div className="prose mb-2">{instruction}</div>
    </div>
  );
};
