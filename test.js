import React, { useState } from "react";
import { act } from "react-dom/test-utils";
import { render, fireEvent, cleanup } from "react-testing-library";
import { useFields, input } from "./index.js";

afterEach(cleanup);

it("should handle basic usage", async () => {
  let value = null;
  function Component() {
    const { field, value: v } = useFields({
      initialValue: {
        username: "",
        password: ""
      }
    });

    value = v;

    return (
      <>
        <input type="text" {...field("username")} data-testid="username" />
        <input type="password" {...field("password")} data-testid="password" />
      </>
    );
  }

  const { findByTestId } = render(<Component />);

  fireEvent.change(await findByTestId("username"), {
    target: { value: "a@b.com" }
  });

  fireEvent.change(await findByTestId("password"), {
    target: { value: "password" }
  });

  expect(value).toEqual({
    username: "a@b.com",
    password: "password"
  });
});

it("should handle list touched properties", async () => {
  let touched = null;
  function Component() {
    const { field, touched: t } = useFields({
      initialValue: {
        username: "",
        password: ""
      }
    });

    touched = t;

    return (
      <>
        <input type="text" {...field("username")} data-testid="username" />
        <input type="password" {...field("password")} data-testid="password" />
      </>
    );
  }

  const { findByTestId } = render(<Component />);

  expect(touched).toEqual({});

  fireEvent.change(await findByTestId("username"), {
    target: { value: "a@b.com" }
  });

  expect(touched).toEqual({
    username: true
  });

  fireEvent.change(await findByTestId("password"), {
    target: { value: "password" }
  });

  expect(touched).toEqual({
    username: true,
    password: true
  });
});

it("should allow changing a value using change", async () => {
  let change = null;
  let value = null;
  function Component() {
    const { field, change: c, value: v } = useFields({
      initialValue: {
        username: "",
        password: ""
      }
    });

    change = c;
    value = v;

    return (
      <>
        <input type="text" {...field("username")} data-testid="username" />
        <input type="password" {...field("password")} data-testid="password" />
      </>
    );
  }

  render(<Component />);

  act(() => {
    change("username", "a@b.com");
    change("password", "password");
  });

  expect(value).toEqual({
    username: "a@b.com",
    password: "password"
  });

  act(() => {
    change("username", v => {
      expect(v).toBe("a@b.com");
      return "something@else.com";
    });
  });

  expect(value).toEqual({
    username: "something@else.com",
    password: "password"
  });
});

it("should handle custom inputs", async () => {
  let value = null;

  const ToggleBox = input(({ value, onChange, ...props }) => {
    return (
      <button onClick={() => onChange(!value)} {...props}>
        {value ? "on" : "off"}
      </button>
    );
  });

  function Component() {
    const [v, setV] = useState([false, true, false]);

    const { field } = useFields({ value: v, onChange: setV });

    value = v;

    return (
      <>
        {value.map((_, index) => (
          <ToggleBox
            key={index}
            {...field(index)}
            data-testid={`key-${index}`}
          />
        ))}
      </>
    );
  }

  const { findByTestId } = render(<Component />);

  expect(value).toEqual([false, true, false]);

  fireEvent.click(await findByTestId("key-0"));
  fireEvent.click(await findByTestId("key-1"));
  fireEvent.click(await findByTestId("key-2"));

  expect(value).toEqual([true, false, true]);
});

it("should handle custom uncontrolled inputs ", async () => {
  let value = null;

  const ToggleBox = input(({ value: v = false, onChange, ...props }) => {
    value = v;
    return (
      <button onClick={() => onChange(!value)} {...props}>
        {value ? "on" : "off"}
      </button>
    );
  });

  const { findByTestId } = render(
    <ToggleBox data-testid="toggle" defaultValue={false} />
  );

  expect(value).toBe(false);
  fireEvent.click(await findByTestId("toggle"));
  expect(value).toBe(true);
  fireEvent.click(await findByTestId("toggle"));
  expect(value).toBe(false);
});
