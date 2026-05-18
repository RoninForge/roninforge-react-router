---
name: rr7-new-action-form
description: Scaffold a <Form method="post"> component plus an action() handler that parses the FormData with Zod, returns data(actionData, status) on validation failure, redirect() on success, and consumes actionData inside the component to render field errors. Includes an ErrorBoundary keyed on isRouteErrorResponse. Mentions useFormAction for relative action URLs and <fetcher.Form> for in-place mutations without navigation.
---

# rr7-new-action-form

Scaffolds a Zod-validated form action.

## When to use

User asks: "add a form to <route>", "create a contact form", "validate this form with Zod", "wire up a POST action".

## Inputs

- Route file (`app/routes/<file>.tsx`) the form lives on
- Field schema (names, types, validation rules)
- Success behaviour (redirect, render success state, refresh data)

## Output template

```tsx
// app/routes/contact.tsx
import { Form, data, redirect, useNavigation, isRouteErrorResponse } from "react-router";
import type { Route } from "./+types/contact";
import { z } from "zod";

const ContactSchema = z.object({
  email: z.string().email(),
  subject: z.string().min(1).max(120),
  message: z.string().min(1).max(2000),
});

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const parsed = ContactSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    return data(
      {
        fieldErrors: parsed.error.flatten().fieldErrors,
        values: Object.fromEntries(form),
      },
      { status: 400 },
    );
  }
  try {
    await sendContact(parsed.data);
  } catch (e) {
    if (e instanceof Response) throw e;
    return data({ formError: "Could not send. Try again." }, { status: 500 });
  }
  return redirect("/contact/thanks");
}

export default function Contact({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";
  const fieldErrors = actionData && "fieldErrors" in actionData ? actionData.fieldErrors : undefined;
  const values = actionData && "values" in actionData ? actionData.values : {};

  return (
    <Form method="post" noValidate>
      {actionData && "formError" in actionData && actionData.formError && (
        <p role="alert">{actionData.formError}</p>
      )}
      <label>
        Email
        <input name="email" type="email" defaultValue={(values as Record<string, string>).email ?? ""} required />
        {fieldErrors?.email && <p role="alert">{fieldErrors.email[0]}</p>}
      </label>
      <label>
        Subject
        <input name="subject" defaultValue={(values as Record<string, string>).subject ?? ""} required />
        {fieldErrors?.subject && <p role="alert">{fieldErrors.subject[0]}</p>}
      </label>
      <label>
        Message
        <textarea name="message" defaultValue={(values as Record<string, string>).message ?? ""} required />
        {fieldErrors?.message && <p role="alert">{fieldErrors.message[0]}</p>}
      </label>
      <button type="submit" disabled={submitting}>
        {submitting ? "Sending..." : "Send"}
      </button>
    </Form>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error)) {
    return <div role="alert">{error.status} {error.statusText}</div>;
  }
  return <div role="alert">Unexpected error sending message</div>;
}
```

## Variants

- Relative action path: replace `<Form method="post">` with `<Form method="post" action={useFormAction()}>` so renames do not break the URL.
- In-place mutation (no navigation): swap `<Form>` for `<fetcher.Form>` and read `fetcher.data` instead of `actionData`. Pass `useFetcher({ key })` when used in a list.

## Refuse

- `<form method="post">` (plain HTML) - full reload, action never runs.
- `<Form action="/x">` without `method="post"` - defaults to GET (runs the loader).
- Catching all in the action without rethrowing `Response` - swallows `redirect()` and `throw data()`.
- Returning `json({ fieldErrors })` - removed; use `data(value, { status })`.

## After scaffolding

1. Submit invalid input; verify 400 status and field errors render
2. Submit valid input; verify redirect
3. Submit with JS disabled; verify progressive enhancement still works
