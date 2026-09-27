---
title: "The small details in a form component adapter"
date: 2026-09-22
summary: "React Hook Form Mantine centralizes field wiring while preserving the different value and event contracts of Mantine inputs."
draft: true
reviewed: 2026-09-27
date_basis: approximate-project-timeline
repository: https://github.com/aranlucas/react-hook-form-mantine
---

Connecting a component library to a form library starts with a few repeated lines: read the field value, attach an onChange handler, forward a ref, and show the validation error. Repeat that across a form and the wiring soon becomes harder to review than the labels and layout.

The goal is to centralize form-state wiring while preserving the different value and event contracts of individual Mantine inputs.

React Hook Form Mantine packages that wiring as components. A caller supplies a field name and the usual Mantine presentation props, while the wrapper connects the input to React Hook Form. The project is small in concept, but its interesting work is at the boundary between two APIs that do not have exactly the same responsibilities.

The TextInput wrapper shows the basic pattern. Its props combine React Hook Form's generic controller props with Mantine's input props, omitting Mantine's value and defaultValue declarations. It passes name, control, rules, defaultValue, and shouldUnregister to useController. The returned field value drives the input, and the field's validation message becomes the displayed error. [TextInput implementation](https://github.com/aranlucas/react-hook-form-mantine/blob/533f0e9dc43e2b216dceb3597c1557745a6c6d44/src/TextInput/TextInput.tsx)

There is a useful detail in the change handler. It updates the form first and then invokes the caller's optional onChange callback. A page can still perform an extra action when the user types without having to remember to update form state itself. The wrapper owns the repeated connection, while the page retains a place for behavior specific to that form.

The remaining field properties and component props are spread onto the Mantine input. That keeps the wrapper thin and preserves access to the underlying component's options. It also means prop precedence is part of the adapter's contract. In this implementation, later caller props can override overlapping forwarded properties, including an explicit error display. Small ordering decisions like that are observable behavior in a library.

Checkboxes make it clear why a completely generic wrapper would be awkward. A standalone checkbox connects the form value to checked. A checkbox inside a group should not register another controller for the same group value, so the library exposes Checkbox.Item as the original Mantine checkbox and Checkbox.Group as the group adapter. The implementation calls out double registration directly. [Checkbox implementation](https://github.com/aranlucas/react-hook-form-mantine/blob/533f0e9dc43e2b216dceb3597c1557745a6c6d44/src/Checkbox/Checkbox.tsx)

Date inputs provide another variation. The DatePickerInput adapter accepts Mantine's date-picker type surface and forwards the changed value through both handlers. The important abstraction is ownership of form state; it does not require every input to emit a browser text-change event. [DatePickerInput implementation](https://github.com/aranlucas/react-hook-form-mantine/blob/533f0e9dc43e2b216dceb3597c1557745a6c6d44/src/DatePickerInput/DatePickerInput.tsx)

This kind of library benefits from tests that cross the integration boundary. The TextInput tests render a real form-backed input, set an error through the form API, and verify that typing changes the stored form value. Those checks are more informative than a snapshot of the wrapper's markup because the value of the wrapper is the connection itself. [TextInput tests](https://github.com/aranlucas/react-hook-form-mantine/blob/533f0e9dc43e2b216dceb3597c1557745a6c6d44/src/TextInput/TextInput.test.tsx)

There is a maintenance cost to this approach. Every wrapper depends on the behavior and types of two upstream libraries, and new input variants can need their own treatment. The repository's component-by-component structure makes that repetition visible. In exchange, application forms get a consistent place for value wiring, validation messages, and event forwarding. It is a useful example of an abstraction whose job is to preserve small differences while removing the repetitive work around them.
