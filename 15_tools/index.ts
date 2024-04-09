import OpenAI from "openai";
import { sendAnswer, useTaskData } from "../lib";
import type { TaskType } from "../lib/types";

type Tools = TaskType & {
  question: string;
};
const openai = new OpenAI();
const functionDefinition = [
  {
    name: "todo",
    description: "dodaje zadanie to listy todo",
    parameters: {
      type: "object",
      properties: {
        tool: {
          type: "string",
          description: "Name of the tool used for task this is ToDo",
        },
        desc: {
          type: "string",
          description: "opis zadania",
        },
      },
    },
  },
  {
    name: "calendar",
    description: "dodaje wydarzenie do kalendarza",
    parameters: {
      type: "object",
      properties: {
        tool: {
          type: "string",
          description: "Name of the tool used for task this is Calednar",
        },
        desc: {
          type: "string",
          description: "opis wydarzenia",
        },
        date: {
          type: "string",
          description: "data wydarzenia w formacie YYYY-MM-DD",
        },
      },
    },
  },
];

const systemPrompt = `Current date is ${new Date().toISOString().slice(0, 10)}. 
Classify all tasks as ToDo or Calendar. 
Calendar should be used for all tasks when the date is provided as part of the question. 
Even if the date is passed as "tomorrow", "next week", "pojutrze" etc. Add tool name to the response`;
const useCompletionsOpenAi = async (question: string) => {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: question },
    ],
    functions: functionDefinition,
    function_call: "auto",
  });

  return {
    message: response.choices[0].message,
  };
};
const tools = async () => {
  const data = await useTaskData<Tools>("tools");
  if (!data) return;
  try {
    const { message } = await useCompletionsOpenAi(data.task.question);
    const pasrsedMessage = JSON.parse(message.function_call!.arguments);

    const answer = {
      token: data?.token,
      answer: pasrsedMessage,
    };
    await sendAnswer(answer);
  } catch (error) {
    console.error("Something went wrong", error);
  }
};

tools();
