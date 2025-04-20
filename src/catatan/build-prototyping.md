---
title: 🌱 Catatan Membangun Prototipe dengan Elixir Phoenix
created: 2024-10-05
modified: 2024-10-05
layout: tulisan
tags:
  - catatan
  - ide
eleventyExcludeFromCollections: true
---
- Express it as a model
- Map the model to a plan that is 1:1 with phx.live.gen
- Plan for less than 40 hours of work
	- Prioritize

### Filosofi
- Generator first, code second
- Generated code is the canonical representation of your app
- Generated code is complete, don't remove parts
- Don't change context module, make a module for commands
- Run mix test.watch < 5s
- Use liveview for everything
- phx.gen.auth
- Use component framework like petal.build or daisyui

## Sumber

```
https://youtu.be/BNmM2PyHs2c?feature=shared
```
