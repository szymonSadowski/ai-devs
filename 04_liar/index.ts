import { ChatOpenAI } from "@langchain/openai";
import { sendAnswer, sendTaskData, useSendTaskData } from "../lib";
import { PromptTemplate } from "langchain/prompts";
import type { TaskType } from "../lib/types";

type Liar = TaskType & {
  answer: string;
};

const question = "What is the capitol city of Portugal";
const liar = async () => {
  const data = await useSendTaskData<Liar>("liar", question);

  try {
    const model = new ChatOpenAI({});

    const promptTemplate = PromptTemplate.fromTemplate(
      `I want you to check if answer is correct for the question: 
      ### Question
      {question}
      ###
      ### Answer
      {topic}
      ###
      Result should be YES or NO
      `
    );
    const chain = promptTemplate.pipe(model);

    const result = await chain.invoke({
      question: question,
      topic: data!.task.answer,
    });

    const answer = {
      token: data?.token,
      answer: result.content,
    };
    await sendAnswer(answer);
  } catch (error) {
    console.error("Something went wrong");
  }
};

liar();
