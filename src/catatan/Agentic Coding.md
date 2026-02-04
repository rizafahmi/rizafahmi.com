---
title: 🌱 Catatan Tentang Agentic Coding
created: 2026-01-25
modified: 2026-01-25
layout: tulisan
tags:
  - catatan
  - ide
eleventyExcludeFromCollections: true
---
## Daftar Isi

| Post | Title                            | Concept                                             | Checkpoint      |
| ---- | -------------------------------- | --------------------------------------------------- | --------------- |
| 1    | What is Agentic Coding?          | Theory + architecture overview                      |                 |
| 2    | Hello Claude API                 | Basic API call, handle response                     | step-1 branch   |
| 3    | Teaching Your Agent to Use Tools | Tool definitions, JSON schema                       | step-2 branch   |
| 4    | The Agentic Loop                 | Recursive continuation, tool_use → execute → repeat | step-3 branch   |
| 5    | Real-time Streaming              | SSE, better UX                                      | step-4 branch   |
| 6    | Make It Useful                   | read_file, write_file tools                         | step-5 branch   |
| 7    | Your Turn                        | Exercise: add run_command tool                      | Solution branch |
Each post should have:

- 🎯 Learning goal - one sentence
- 📝 Code diff from previous step
- 🧪 "Try it" - command to run and expected output
- 💡 Key insight - what this teaches about agents
- 🏋️ Exercise - small challenge before next post

## Post 1: "What is Agentic Coding?"
---

🎯 Goal: Reader understands what makes code "agentic" and why it matters

---

Outline:
1. Hook - "You've used Cursor/Copilot/Claude Code - but how do they actually work?"
2. The Traditional LLM Pattern
	- User asks → LLM responds → done
	- One-shot, no action, just text
3. The Agentic Pattern
	- User asks → LLM thinks → uses tool → observes result → thinks again → repeats until done
	- Diagram: the loop
4. Three Core Components
	- Tools - what the agent can do (read files, write code, run commands)
	- Decision-making - LLM chooses which tool, when
	- The Loop - keep going until task complete
5. What We're Building
	- Show final demo: ./mbb "Read mix.exs and add a new dependency"
	- ~200 lines of Elixir
	- Real Claude API, real file operations
6. Why Elixir?
	- Pattern matching makes the loop explicit
	- Functional style = no hidden state
	- (Optional - can skip if audience is general)
7. Series Roadmap
	- Preview of posts 2-7
8. CTA - "Next: Let's call the Claude API"