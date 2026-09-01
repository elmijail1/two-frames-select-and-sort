# 2 Frames: Select & Sort
*Simple on the outside, sophisticated on the inside*

## ℹ️ Description
This is a fullstack web app that lets users select, sort, filter, and add items in two frames.

![2 Frames Select & Sort Overview](https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExcnBzd3d5dDNkcXI4aWFud3B2ZmMydHRkdGVzeDg5NTVpcGhsYjMyNCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/TxYG15jdbsBvQd3Fa0/giphy.gif)

This app was built for a take-home test task – and, of course, for practice. It's not a standalone commercial app.

## 👀 See it in action

Find 2 Frames live by following this link (loading can take some time since it's hosted with Render.com's free plan):

https://two-frames-select-and-sort.onrender.com/

## 🤔 Why did I make this app?
As I've mentioned, I had a take-home test task to build it with certain requirements (more on them below).
But it also became a good challenge of building a small fullstack app from 0 to 1 fast.
And I also got more hands-on practice with these tools:
- Express
- TanStack Query (especially this one!)
- React
- TypeScript
- DND Kit (I wish it stood for Dungeons & Dragons, but it's Drag-and-Drop actually)

## ⚙️ Features
### How you'll interact with it
- ✌️ 2 frames: one for un-selected squares, one for selected
- ↔️ Select and un-select squares all you want – they move from one frame to the other
- ⛔️ Selected squares are strictly sorted from smallest to greatest and their order can't be changed
- 😵‍💫 Unselected squares aren't sorted – and you can move them around by dragging and dropping
- 🔎 Look for squares you need by filtering frames – you can even look for just negatives (just type "-")
- ✅ Add new items with any ID you want: new ones instantly appear in the selected frame (can't be selected for a while)

### What's inside (initial requirements)
- 🤯 By default the app has 1 million un-selected squares (from 1 to 1,000,000) – all stored in memory, no DB
- 📥 Items are loaded in batches of 20 with an infinite scroll
- 📀 Selection & sorting persist while the app is running (reloading don't discard them)
- 🐏🐑 Queueing: changes and additions are queued – changes are flushed each second, additions – each 10 sec
- 🙅‍♀️ Deduplication: you can't add the same ID twice, the server won't let you

## 🛠️ Tech stack
1. Express (backend's framework)
2. React (frontend's main lib)
3. TypeScript (the language)
4. TanStack Query (server state caching & management)
5. DND-Kit (a library for dragging and dropping)

## 💬 Thoughts
- **TSQ Love & Hate**: TanStack Query is powerful and comes with way more features than I expected. However, it seems to be a bit too idiomatic and I often found myself confused with how I should solve this or that task with it.
- **Queues are qool**: This is the first time I'm building a queue-update system on my own and I like the idea, but I'm sure my implementation isn't perfect (it survived a couple of pivots at least). I'd like to learn to do it better.

