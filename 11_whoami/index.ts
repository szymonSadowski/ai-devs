import { ChatPromptTemplate } from "langchain/prompts";
import { sendAnswer, useTaskData } from "../lib";
import type { TaskType } from "../lib/types";
import { ChatOpenAI } from "@langchain/openai";

type Whoami = TaskType & {
  hint: string;
};
const regex = /(?:YES,?\s+)([A-Za-z\s]+)\b/;
const systemTemplate = `You need to guess the person with the hints provided. 
If you don't know the answer respond NO if yes respond YES and the name of the person..
`;

const humanTemplate = `Hints {hints}`;

const chatPromptTemplate = ChatPromptTemplate.fromMessages([
  ["system", systemTemplate],
  ["human", humanTemplate],
]);
const whoami = async () => {
  const data = await useTaskData<Whoami>("whoami");
  const chat = new ChatOpenAI();
  let name;
  const hints = [];
  if (!data) return;
  try {
    while (true) {
      hints.push(data.task.hint);
      const chatPrompt = await chatPromptTemplate.formatMessages({
        hints,
      });
      const { content } = await chat.invoke(chatPrompt);
      const response = content as string;
      if (content !== "NO" && response !== null) {
        // @ts-expect-error
        name = response.match(regex)[1];
        break;
      }
    }
    const answer = {
      token: data?.token,
      answer: name,
    };
    await sendAnswer(answer);
  } catch (error) {
    console.error("Something went wrong", error);
  }
};

whoami();
