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

**Once all pass → move to Phase 2 (learned_facts, approvals, updates)**
