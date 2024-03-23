import { ChatOpenAI } from "@langchain/openai";
import { sendAnswer, useTaskData } from "../lib";
import { PromptTemplate } from "langchain/prompts";

type Blogger = {
  blog: Array<string>;
  code: number;
  msg: string;
};

const moderation = async () => {
  const data = await useTaskData<Blogger>("blogger");
  console.log(data);
  try {
    const model = new ChatOpenAI({});

    const blogPrompt = data!.task.blog.map((topic, index) => {
      return topic;
    });

    const promptTemplate = PromptTemplate.fromTemplate(
      "Napisz kilka zdań na ten temat {topic}"
    );
    const chain = promptTemplate.pipe(model);

    const result = await chain.batch([
      { topic: blogPrompt[0] },
      { topic: blogPrompt[1] },
      { topic: blogPrompt[2] },
      { topic: blogPrompt[3] },
    ]);

    const blog = result.map((text) => {
      return text.content as string;
    });

    const answer = {
      token: data?.token,
      answer: blog,
    };
    await sendAnswer(answer);
  } catch (error) {
    console.error("Something went wrong");
  }
};

moderation();
