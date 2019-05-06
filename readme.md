# `use-fields`

```
npm i use-fields
```

This is a lightweight state management system for composable forms.
Use like this:

```js
const { field, value, touched } = useFields({ initialValue: { name: "blah" } });
```

and

```js
<input {...field("name")} />
```

or the `field` function returns a object with the shape:

```js
{
  value: T
  onChange: function<T | T => T | Event>
}
```

useFields can be used to build big/flexible forms. To work on a nested property,
you must nest components too. I've debated making this easy by changing fields to
accept a path, but decided against it because you probably should be building a
child component at that point. ;)

This also comes with an `input` Higher Order Function. This function takes a
function component and `memo`s the function component as well as allows a
`defaultValue` prop to be passed creating an uncontrolled input.

Notice it is _always_ onChange and value, not onClick and checked (for checkbox).
Wrap these types of components with `input` and a function to map these
props together:

```js
const Checkbox = input(function Checkbox({ value: checked, onChange }) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onClick={() => onChange(!checked)}
    />
  );
});
```

It is recommended to use useFields within these input functions where needed:

```js
const { field } = useFields({ value, onChange });
```

which allows you to build data trees that are from separate components.

## Usage:

```js
import React from "react";
import { useFields, input } from "use-fields";

const ToggleBox = input(({ value, onChange, ...props }, ref) => {
  return (
    <button type="button" onClick={() => onChange(!value)} {...props} ref={ref}>
      {value ? "on" : "off"}
    </button>
  );
});

function LoginForm() {
  const { field, value } = useFields({
    initialValue: {
      username: "",
      password: "",
      rememberMe: false
    }
    // or pass value and onChange
  });

  function submit(e) {
    e.preventDefault();
    // do something with value:
    // {username: '', password: ''}
  }

  return (
    <form onSubmit={value}>
      <label>
        Username: <input type="text" {...field("username")} />
      </label>
      <label>
        Password: <input type="password" {...field("password")} />
      </label>
      <label>
        Remember Me: <ToggleBox {...field("rememberMe")} />
      </label>
      <button>Log In</button>
    </form>
  );
}
```

## License

MIT
