---
title: 'Building a multi-agent marketing platform from zero'
org: 'AI-native marketing startup'
years: '2026'
one_liner: 'A multi-agent platform I built from zero for the startup I founded. The agent did the analysis, a person approved every change to an ad account, and the startup won multiple paid client engagements.'
order: 3
---

## Context

In 2026 I founded an AI-native marketing startup to put what I'd learned building AI for advertisers into practice. The idea was to let AI do the intelligence work and keep people in charge of the decisions. We paired human strategists with AI-agent workflows for campaign analysis, execution, and reporting. As founder, I owned engineering and go-to-market.

## What I built

I built the platform from zero. Two design choices mattered most:

- **Two modes.** In analysis mode the agent could only read. In execution mode it showed a plan and waited for a person's approval before changing anything in an ad account.
- **One owner per tool.** The orchestration service owned every tool the model could call, and the execution sandbox only ran commands, which kept the system easy to reason about.

## The hard call

The hardest decisions weren't technical. Client work can easily turn into custom service work, so I set a rule: client work was R&D, not the product. Every engagement had to surface at least one piece of work that software could do with no per-client human cost.

The demand signal also moved. Clients pulled harder toward content and creative generation than toward ad optimization, which turned out to be table stakes.

## Outcome

The startup won multiple paid client engagements.

## What I learned

- **Client work only counts as R&D if it keeps pointing at the same product.** Otherwise you're running an agency.
- **The agent layer commoditizes fast.** When one builder can ship over a hundred agent skills, "we run AI for you" has a short shelf life. I came to agree with [Pete Koomen](https://koomen.dev/essays/horseless-carriages/) that AI-native software looks more like an agent wrapping deterministic tools than like deterministic software wrapping an AI. For me, that put the durable value in the tool layer, not in the interface.
