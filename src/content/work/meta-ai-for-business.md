---
title: 'Defining "good" for an AI assistant that advises advertisers'
org: 'Meta — Meta AI for Business'
years: '2024–2026'
one_liner: "There's no public benchmark for good marketing advice. I built the post-training and evaluation loop end to end: SFT, DPO and GRPO, human and LLM-judge evals, and launch gates."
order: 1
---

## Context

Meta AI for Business is Meta's AI assistant for advertisers. It's an agent that helps businesses diagnose campaign issues, optimize performance, and create campaigns through natural conversation. Many of the advertisers it serves are small businesses without an agency or a dedicated marketer.

I was a founding AI researcher on it. I led product direction and core agent-system design for what became a 100+ person initiative spanning four Meta organizations, and I worked closely with domain experts throughout.

## What "good" meant

The model was already good at the intelligence work: plausible recommendations, scenarios, answers that sounded right. The open question was whether an answer was right for *this* business, given its history and its goals.

With no public benchmark for good marketing advice, one of the most important questions wasn't about training at all. It was what we would count as good, and how we would know.

## What I built

I built the post-training and evaluation loop end to end: SFT, DPO and GRPO, human and LLM-judge evals, and launch gates.

I also designed the production agent infrastructure around the model: multi-step planning, tool use, context management, and multi-agent orchestration.

## Outcome

The agent infrastructure went into production, and the work grew from a founding team into a cross-organization initiative.

## What I learned

The hard part wasn't getting the model to sound right. It was deciding what to do when the model is confident and wrong, and designing the system so human judgment can step in fast. Better models make that problem more important, not less. It's the thread that runs through everything I've built since.
