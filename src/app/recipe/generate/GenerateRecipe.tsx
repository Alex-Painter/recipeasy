"use client";

import React, { useState } from "react";

const GenerateRecipeBody = () => {
  const [step, setStep] = useState(1);
  const [meal, setMeal] = useState();
  const [portions, setPortions] = useState();

  const getStep = () => {
    switch (step) {
      case 1:
        return (
          <StepMealType
            onNext={() => setStep(2)}
            onBack={() => setStep(1)}
            onChange={setMeal}
            meal={meal}
          />
        );
      case 2:
        return (
          <StepMealPortions
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
            onChange={setPortions}
            portions={portions}
          />
        );
    }
  };

  return (
    <>
      <div>{meal}</div>
      <div>{portions}</div>
      <div>{getStep()}</div>
    </>
  );
};

const StepMealType = ({
  onNext,
  onBack,
  onChange,
  meal,
}: {
  onNext: () => void;
  onBack: () => void;
  onChange: any;
  meal: string | undefined;
}) => {
  const setMealType = (meal: string) => {
    onChange(meal);
  };

  return (
    <>
      <h1>Meal type</h1>
      <div className="flex">
        <StepCard
          text="Dinner"
          handleClick={() => setMealType("dinner")}
          isSelected={meal === "dinner"}
        />
        <StepCard
          text="Lunch"
          handleClick={() => setMealType("lunch")}
          isSelected={meal === "lunch"}
        />
        <StepCard
          text="Breakfast"
          handleClick={() => setMealType("breakfast")}
          isSelected={meal === "breakfast"}
        />
      </div>
      <button className="btn" onClick={onBack}>
        Back
      </button>
      <button className="btn" onClick={onNext}>
        Next
      </button>
    </>
  );
};

const StepMealPortions = ({
  onNext,
  onBack,
  onChange,
  portions,
}: {
  onNext: () => void;
  onBack: () => void;
  onChange: any;
  portions: number | undefined;
}) => {
  const handlePortions = (portions: number) => {
    onChange(portions);
  };

  return (
    <>
      <h1>Number of portions</h1>
      <div className="flex">
        <StepCard
          text="2"
          handleClick={() => handlePortions(2)}
          isSelected={portions === 2}
        />
        <StepCard
          text="3"
          handleClick={() => handlePortions(3)}
          isSelected={portions === 3}
        />
        <StepCard
          text="4"
          handleClick={() => handlePortions(4)}
          isSelected={portions === 4}
        />
      </div>
      <button className="btn" onClick={onBack}>
        Back
      </button>
      <button className="btn" onClick={onNext}>
        Next
      </button>
    </>
  );
};

const StepCard = ({
  handleClick,
  text,
  isSelected,
}: {
  handleClick: () => void;
  text: string;
  isSelected: boolean;
}) => {
  return (
    <div className="card card-bordered" onClick={handleClick}>
      <div className="card-body">
        <div
          className={`card-title ${isSelected ? "font-bold" : "font-normal"}`}
        >
          <div>{text}</div>
        </div>
      </div>
    </div>
  );
};

export default GenerateRecipeBody;
