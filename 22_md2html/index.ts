import OpenAI from "openai";
import { sendAnswer, useTaskData } from "../lib";
import type { TaskType } from "../lib/types";

type Md2html = TaskType & {
  input: string;
};

const openai = new OpenAI();
const md2html = async () => {
  const data = await useTaskData<Md2html>("md2html");

  if (!data) return;
  try {
    const response = await openai.chat.completions.create({
      model: "ft:gpt-3.5-turbo-0125:personal:ai-devs:9GnFbCrq",
      messages: [
        { role: "system", content: "md2html" },
        { role: "user", content: data.task.input },
      ],
    });

    const result = response.choices[0].message.content;
    const answer = {
      token: data?.token,
      answer: result,
    };
    await sendAnswer(answer);
  } catch (error) {
    console.error("Something went wrong", error);
  }
};

md2html();
