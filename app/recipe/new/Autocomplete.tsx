import { Ingredient } from "../../../components/RecipeList/recipes";
import { useRef, useState } from "react";

const Autocomplete = ({
  items,
  value,
  onChange,
}: {
  items: Ingredient[];
  value: string;
  onChange: (ingredient: Ingredient) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const dropdownOpen = open ? "dropdown-open" : "";
  return (
    <div className="form-control w-full max-w-xs">
      <label className="label">
        <span className="label-text">Ingredient name</span>
      </label>
      <div className={`dropdown dropdown-end w-full ${dropdownOpen}`} ref={ref}>
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="Type something..."
          value={value}
          tabIndex={0}
          readOnly={true}
        />
        <div className="dropdown-content bg-base-200 top-14 max-h-96 overflow-auto flex-col rounded-md">
          <ul
            className="menu menu-compact "
            // use ref to calculate the width of parent
            style={{ width: ref.current?.clientWidth }}
          >
            {items.map((item, index) => {
              return (
                <li
                  key={index}
                  tabIndex={index + 1}
                  onClick={() => {
                    onChange(item);
                    setOpen(false);
                  }}
                  className="border-b border-b-base-content/10 w-full"
                >
                  <button>{item.name}</button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Autocomplete;
