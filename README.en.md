# todo-example-segregating-model-for-frontend

## About this repository

This repository is a sample application to validate and explain the idea of
**"designing the frontend as an application."**

The goal is not to introduce a specific framework or technique.
By separating the **application core (knowledge and behavior)** from UI frameworks
like React / Vue, this repository shows, as working code:

- why Fat Components are easy to create
- what to move out of the UI to stabilize design
- where the decision criteria for frontend design should live

## Background: why build this sample

Modern frontend work is not just rendering screens. It now handles:

- state transitions
- constraints during input
- conditional operations
- temporary consistency

As a result, UI components often mix
**knowledge (rules and constraints)** and **behavior (operations and transitions)**,
which leads to so-called *Fat Components*.

This repository starts from the premise:

> The problem is not "having logic,"
> but **"mixing logic into UI without separation."**

and expands the design scope beyond the UI layer.

## What this sample wants to show

- Frontend has its own "domain knowledge"
- UI frameworks are great at "rendering and syncing," but not everything else
- By separating knowledge and behavior from UI:
  - it becomes testable
  - framework changes are localized
  - design intent is fixed as code

This sample does not argue for "reuse" or "trendy architecture."
It is material to think about **where to draw design boundaries**.

## Architecture overview

```txt

packages/
├─ front/     # framework-agnostic application core
├─ react/     # React UI implementation
├─ vue/       # Vue UI implementation
└─ jquery/    # jQuery UI implementation
```

### Dependency rules

- UI may depend on front
- front knows nothing about UI frameworks
- front does not reference DOM / browser APIs / routing

## Responsibility of front

front provides:

- application state (Single Source of Truth)
- operations that change state (commands / use cases)
- rules, constraints, invariants
- testable behavior

front does **not** do:

- rendering
- collecting user input
- using UI framework APIs

## Responsibility of the UI layer

The UI layer is simple:

1. get state from front
2. send user actions as front commands
3. render the returned state

The UI does not interpret the meaning of front.
**What is valid and which transitions are allowed** are delegated to front.

## About testing

- the front layer is unit tested without UI
- tests focus on describing "specs" rather than implementation
- UI tests are minimal or omitted

This setup confirms that UI framework changes do not affect front tests.

## What this sample DOES NOT aim for

- a universal frontend architecture
- a design that fits every app
- comparing frameworks

Depending on the scale and nature of the application,
this separation can be excessive.

This repository is a **thought experiment and implementation example** to consider:

**What should be view, and what should be application?**

## Suggested reading order

- read front code and tests first
- check UI implementations to see how thin they are
- ask: "what is the application core in my project?"

## Related

- previous sample based on the same idea:
  - <https://github.com/tooppoo/separate-model-on-front>

## License

MIT
