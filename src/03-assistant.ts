// 🧑‍💼 A custom assistant agent, tools over your own "data".
// Run it:  npm run assistant
//
// This is the shape of a real product agent: a small set of well-designed tools
// that read and write some state, wrapped in clear instructions. Here it's an
// in-memory to-do list, but swap the tool bodies for your DB/API and it's real.

import { ToolLoopAgent, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { MODEL } from './config.js';

// "The world" the agent can act on. In production: a database.
type Task = { id: number; title: string; done: boolean };
const tasks: Task[] = [
  { id: 1, title: 'Finalize CascadiaJS slides', done: false },
  { id: 2, title: 'Test the workshop repo', done: true },
];
let nextId = 3;

const assistant = new ToolLoopAgent({
  model: MODEL,
  instructions: [
    'You are a friendly task assistant.',
    'Use tools to read and modify the task list, never make up task data.',
    'After changing anything, briefly confirm what you did.',
  ].join(' '),
  stopWhen: stepCountIs(10),
  tools: {
    listTasks: tool({
      description: 'List all tasks with their status.',
      inputSchema: z.object({ onlyOpen: z.boolean().optional().describe('If true, only incomplete tasks.') }),
      execute: async ({ onlyOpen }) => ({
        tasks: onlyOpen ? tasks.filter((t) => !t.done) : tasks,
      }),
    }),
    addTask: tool({
      description: 'Add a new task.',
      inputSchema: z.object({ title: z.string().min(1) }),
      execute: async ({ title }) => {
        const task = { id: nextId++, title, done: false };
        tasks.push(task);
        return { added: task };
      },
    }),
    completeTask: tool({
      description: 'Mark a task as done by id.',
      inputSchema: z.object({ id: z.number().int() }),
      execute: async ({ id }) => {
        const task = tasks.find((t) => t.id === id);
        if (!task) return { error: `No task with id ${id}` }; // tools can return errors as data!
        task.done = true;
        return { completed: task };
      },
    }),
  },
});

// Notice: one natural-language request → several coordinated tool calls.
const result = await assistant.generate({
  prompt:
    "What's still open on my list? Add a task to 'book the karaoke room', then mark the slides task as done.",
});

console.log('\n🤖 Assistant:\n' + result.text + '\n');
console.log('📋 Final task list:', tasks);
