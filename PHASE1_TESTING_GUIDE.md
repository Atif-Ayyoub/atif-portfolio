# Phase 1 Testing Guide

This guide walks through systematic testing of the chatbot's conversation memory foundation before Phase 2.

## Setup

1. Open browser console: `F12` → Console tab
2. Start fresh: Clear localStorage `localStorage.clear()` or use incognito mode
3. Open the Assistant page in the portfolio
4. Watch console logs during each test

---

## Test 1: Project Selection with Typos

**Goal:** Verify fuzzy matching handles typos correctly

### Test Cases (run each separately in new sessions):

```
Input: "Wallpaper Hub"
Expected: ✅ High confidence exact match
Console: confidence: 'high', source: 'exact_match'
```

```
Input: "Wallapaper Hub"
Expected: ✅ Medium/High confidence fuzzy match
Console: confidence: 'high' | 'medium', source: 'word_fuzzy'
```

```
Input: "wallpaperhub"
Expected: ✅ High confidence after normalization
Console: confidence: 'high', source: 'full_text_fuzzy'
```

```
Input: "wall paper hub"
Expected: ✅ High confidence (spaces removed)
Console: confidence: 'high', source: 'word_fuzzy'
```

**What to look for in console:**

```
🔍 Project Detection: {
  input: "...",
  detected: "Wallpaper Hub",
  confidence: "high",
  source: "exact_match",
  similarity: 0.95
}
```

**Failure cases:**

- ❌ Detects wrong project (check similarity score)
- ❌ No match found (similarity too low)
- ❌ Medium/low matches for exact names (source should be exact_match)

---

## Test 2: Follow-up Memory

**Goal:** Verify bot remembers selected project across multiple follow-ups

### Test Flow:

```
1. User: "What projects have you built?"
   [Wait for response]

2. User: "Summarize Wallpaper Hub"
   [Wait for response - should summarize this specific project]

   Console check:
   - selectedProject: "Wallpaper Hub"
   - confidence: "high"

3. User: "Tell me more"
   [Wait for response - should still reference Wallpaper Hub]

   Console check:
   - intent: "follow_up"
   - selectedProject: "Wallpaper Hub" (should persist!)

4. User: "What stack was used?"
   [Should reference Wallpaper Hub tech stack]

   Console check:
   - intent: "follow_up"
   - selectedProject: "Wallpaper Hub"

5. User: "Is it completed?"
   [Should reference Wallpaper Hub status]

   Console check:
   - intent: "follow_up"
   - selectedProject: "Wallpaper Hub"
```

**Success criteria:**

- ✅ Each follow-up returns relevant answer for Wallpaper Hub
- ✅ selectedProject stays same across steps
- ✅ Bot never returns generic intro after first message

**Failure cases:**

- ❌ Follow-ups return "tell me which project"
- ❌ selectedProject resets to null
- ❌ Bot returns intro message mid-conversation

---

## Test 3: Multi-Project Ambiguity

**Goal:** Verify bot handles ambiguity correctly

### Test Flow:

```
1. User: "What projects have you built?"
   [Gets project list]

2. User: "Summarize it"
   [Should ask which one]

   Expected response: "Which project would you like me to summarize: ..."

   Console check:
   - intent: "follow_up"
   - selectedProject: null
   - projectContext.candidates.length > 1
```

**Success criteria:**

- ✅ Bot asks clarification
- ✅ User can then say "Wallpaper Hub" and bot summarizes

---

## Test 4: Page Refresh Persistence

**Goal:** Verify session state survives page refresh

### Test Flow:

```
1. User: "Tell me about Wallpaper Hub"
   [Gets summary]

   Console check:
   - selectedProject: "Wallpaper Hub"
   - Session saved to Supabase

2. Manual: Refresh page (F5)
   [Wait for app to load, check console]

   Console: "✓ Session loaded" or similar indicator

3. User: "Tell me more"
   [Should remember Wallpaper Hub despite refresh!]

   Response should continue about Wallpaper Hub
   Console:
   - selectedProject: "Wallpaper Hub" (loaded from Supabase)

4. Check Supabase:
   - Go to project settings → SQL Editor
   - Run: SELECT * FROM chat_sessions LIMIT 5;
   - Verify: selected_project field has "Wallpaper Hub"
```

**Success criteria:**

- ✅ selectedProject persists after refresh
- ✅ Follow-up still works after page reload
- ✅ Supabase chat_sessions table has data

**Failure cases:**

- ❌ selectedProject becomes null after refresh
- ❌ Follow-up loses context
- ❌ Supabase tables empty

---

## Test 5: Topic Switching

**Goal:** Verify bot switches context correctly

### Test Flow:

```
Session A: Project focus
1. User: "Tell me about Wallpaper Hub"
   selectedProject: "Wallpaper Hub"
   currentTopic: "project_inquiry"

2. User: "What services do you offer?"
   Console should show:
   - topic: "service_inquiry"
   - selectedProject: null (cleared by shouldClearProject)
   - Response: Service list (not project-specific)

3. User: "Now summarize Pixel Resize Pro"
   selectedProject: "Pixel Resize Pro"
   Response: Pixel Resize Pro summary (not Wallpaper Hub!)
```

**Success criteria:**

- ✅ Service question doesn't reference Wallpaper Hub
- ✅ New project name switches focus cleanly
- ✅ Console shows topic: "service_inquiry" then "project_inquiry"

**Failure cases:**

- ❌ Service response still mentions Wallpaper Hub
- ❌ Old project persists after topic change
- ❌ "Summarize Pixel Resize Pro" references Wallpaper Hub

---

## Test 6: Edge Typos

**Goal:** Verify the matcher is tolerant, but not reckless.

### Test Inputs:

```
wallpapr hub
wp hub
resize tool
task app
sports system
```

**Expected:**

- `wallpapr hub` should usually match Wallpaper Hub
- `task app` should usually match Task Manager if confidence is high enough
- `resize tool` and `sports system` should not force a wrong project if confidence is weak
- `wp hub` should only auto-select if confidence clears the high/medium threshold

**Console watch:**

- `confidence`
- `similarity`
- `source`
- `selectedProject`

---

## Test 7: Wrong Confidence Protection

**Goal:** Prevent bad auto-selection when a match is weak.

### Test Flow:

```
User: "library"
```

**Expected:**

- If the match is below `0.70`, it must not auto-select a project
- The bot should ask for clarification or return no match

**Failure:**

- Any low-confidence guess being accepted as a project

---

## Test 8: Follow-up Without Context

**Goal:** Make sure a bare follow-up does not invent a project.

### Test Flow:

```
User: "tell me more"
```

**Expected:**

- The bot asks which project to continue with
- It must not return a random project
- It must not return the intro response

---

## Test 9: Context Overwrite

**Goal:** Confirm the latest project wins.

### Test Flow:

```
User: "Tell me about Wallpaper Hub"
User: "Tell me about Task Manager"
User: "tell me more"
```

**Expected:**

- The final follow-up should stay on `Task Manager`
- The older project should not leak back in

---

## Test 10: Rapid Switching

**Goal:** Prevent stale project state after unrelated topic changes.

### Test Flow:

```
User: "Wallpaper Hub"
User: "services?"
User: "tell me more"
```

**Expected:**

- The bot should not jump back to Wallpaper Hub
- It should ask what the user wants to continue with, or stay on services context

---

## Test 11: Partial Entity Mentions

**Goal:** Verify entity-driven project hints are recognized.

### Test Inputs:

```
resize project
flutter app
```

**Expected:**

- `flutter app` should map to `Task Manager`
- `resize project` should only map if the project truly exists in the portfolio data

---

## Test 12: Mixed Intent

**Goal:** Handle one message that contains both project selection and a follow-up.

### Test Flow:

```
User: "Which project uses Flutter and summarize it"
```

**Expected:**

- Detect the Flutter-related project
- Treat the intent as summarize/follow-up
- Answer directly without clarification if the project is clear

---

## Test 13: Repeated Follow-up Chain

**Goal:** Ensure the same project stays active across several questions.

### Test Flow:

```
User: "Wallpaper Hub"
User: "tell me more"
User: "what stack?"
User: "what problem does it solve?"
```

**Expected:**

- All responses stay on Wallpaper Hub
- No reset or generic intro

---

## Test 14: Refresh + Continue Deep Context

**Goal:** Verify session rehydration works after refresh.

### Test Flow:

```
1. Select a project
2. Refresh the page
3. Ask: "what features does it have?"
```

**Expected:**

- The bot still knows the selected project
- It returns the project features, not a generic answer

---

## Test 15: Invalid Entity Test

**Goal:** Prevent hallucinated answers for non-portfolio projects.

### Test Flow:

```
User: "summarize Netflix clone"
```

**Expected:**

- The bot responds: "That project is not in the portfolio."
- It must not invent a project summary

---

## Expanded Console Checks

For every message, verify:

- `detected intent`
- `matched project`
- `confidence score`
- `selectedProject before/after`
- `context sent to backend`
- `final answer source` if you log it

If any one of these is wrong, the bug is in the state or routing layer, not just the prompt.

---

## Safeguard Rule

The backend should enforce this rule before any fallback logic:

```js
if (projectContext.selected && followUpIntent) {
  return summarizeProject(projectContext.selected);
}
```

That prevents AI fallback from overriding a known project.

---

## Console Log Format

For each message, you should see structured logs like:

```
📤 User Input Analysis: {
  text: "Tell me more",
  intent: "follow_up",
  topic: "follow_up",
  entities: { projects: ['Wallpaper Hub'], services: [], skills: [] },
  detectedProject: {
    project: null,
    confidence: "none",
    source: "no_match",
    similarity: 0
  },
  selectedProject: "Wallpaper Hub",
  context: {
    selectedProject: "Wallpaper Hub",
    recentProjects: ['Wallpaper Hub'],
    lastMessage: "Quick answer: Wallpaper Hub is..."
  }
}

📨 Sending to backend: {
  message: "Tell me more",
  history: [...],
  context: { selectedProject: "Wallpaper Hub", ... }
}

✅ Reply: "Quick answer: Wallpaper Hub is..."
```

**Key fields to watch:**

- `confidence`: high | medium | low | none
- `selectedProject`: Should match detected project name
- `intent`: follow_up | project_inquiry | service_inquiry | etc.
- `context.selectedProject`: Must match selectedProject state

---

## Testing Checklist

Run these in order to build confidence:

- [ ] Test 1a: "Wallpaper Hub" (exact)
- [ ] Test 1b: "Wallapaper Hub" (typo)
- [ ] Test 1c: "wallpaperhub" (no space)
- [ ] Test 1d: "wall paper hub" (extra spaces)
- [ ] Test 2: Full follow-up flow (5 steps)
- [ ] Test 3: Ambiguity handling
- [ ] Test 4: Page refresh persistence
- [ ] Test 5a: Service question (clears project)
- [ ] Test 5b: New project selection

---

## If Tests Fail

**1. No fuzzy match:**

- Check: Similarity score < 0.6? Increase threshold
- Check: Confidence 'none'? Project name might be wrong in database

**2. Lost selectedProject:**

- Open DevTools → Application → Local Storage
- Check: `portfolio-assistant-session-id` exists
- Check: Supabase `chat_sessions` table has recent record

**3. Follow-ups fail:**

- Check: `intent` field is "follow_up"
- Check: `selectedProject` in context object (backend sees it)
- Check: Backend console logs show project in resolveProjectContext()

**4. Typos not matching:**

- Adjust fuzzy match threshold in `fuzzyMatch.js`
- Current: high ≥0.85, medium ≥0.7, low ≥0.6
- Try: high ≥0.80, medium ≥0.65, low ≥0.55

---

## Phase 1 Success Criteria

✅ **Phase 1 is ready for Phase 2 when:**

1. All typo variations match correctly
2. Follow-up questions remember project (steps 1-5 flow)
3. Ambiguity prompts for clarification
4. Page refresh loads session state
5. Topic switches clear old project
6. Supabase tables store all messages and sessions
7. Console logs are clean and informative
8. Edge typos do not force wrong projects
9. Invalid entities are rejected instead of hallucinated
10. Bare follow-ups without context ask for a project

**Once all pass → move to Phase 2 (learned_facts, approvals, updates)**
