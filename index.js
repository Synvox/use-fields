import { useState, useRef, memo } from "react";

/**
 * @param {any} eventOrValue
 */
function getValue(eventOrValue) {
  if (
    eventOrValue &&
    (eventOrValue instanceof Event || eventOrValue.nativeEvent instanceof Event)
  ) {
    return eventOrValue.target.value;
  }

  return eventOrValue;
}

/**
 * @template ValueType
 * @param {object} p
 * @param {ValueType=} p.value
 * @param {ValueType=} p.initialValue
 * @param {Function} p.onChange
 */
export function useFields({ value, initialValue, onChange }) {
  const handlers = useRef({});
  const [handledValue, handledOnChange] = useState(initialValue);

  if (initialValue !== undefined) {
    value = handledValue;
    onChange = handledOnChange;
  }

  const touched = useRef({});

  /**
   * @param {string} name
   * @param {any} defaultValue
   */
  function field(name) {
    // field handlers are attached to handlers ref and
    // not recreated on each render
    const handler =
      handlers.current[name] ||
      (handlers.current[name] = eventOrValue => {
        const newValue = getValue(eventOrValue);
        return onChange(value => {
          const clone = Array.isArray(value) ? [...value] : { ...value };

          clone[name] =
            typeof newValue === "function" ? newValue(value[name]) : newValue;

          touched.current[name] = true;

          return clone;
        });
      });

    return {
      onChange: handler,
      value: value[name]
    };
  }

  function change(key, value) {
    return field(key).onChange(value);
  }

  return { field, value, change, touched: touched.current };
}

/**
 * @param {import('react').FunctionComponent} component
 */
export function input(component) {
  const wrapped = (props, ref) => {
    let { defaultValue, value, onChange } = props;

    const [handledValue, handledOnChange] = useState(defaultValue);

    if (defaultValue !== undefined) {
      value = handledValue;
      onChange = handledOnChange;
    }

    const { defaultValue: _, ...filteredProps } = props;

    return component(
      {
        ...filteredProps,
        value,
        onChange: e => {
          return onChange(getValue(e));
        }
      },
      ref
    );
  };

  Object.assign(memo(wrapped), component, {
    displayName: component.displayName || component.name || "InputComponent"
  });

  return wrapped;
}
