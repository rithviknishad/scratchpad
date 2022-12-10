interface InputProps {
  id?: string | undefined;
  name?: string | undefined;
  type?: React.HTMLInputTypeAttribute;
  className?: string | undefined;
  placeholder?: string | undefined;
  value?: string | undefined;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  label?: string | undefined;
}

export const Input = ({ type = "text", ...props }: InputProps) => {
  return (
    <div className={props.className}>
      <label
        htmlFor={props.id}
        className="block text-sm font-medium text-gray-700"
      >
        {props.label}
      </label>
      <div className="mt-1">
        <input
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          type={type}
          name={props.name}
          id={props.id}
          placeholder={props.placeholder}
          value={props.value}
          onChange={props.onChange}
        />
      </div>
    </div>
  );
};
