import { sendAnswer, useTaskData } from "../lib";
import { OpenAIModerationChain } from "langchain/chains";
import type { TaskType } from "../lib/types";

type Moderation = TaskType & {
  input: string;
};

const moderation = async () => {
  const data = await useTaskData<Moderation>("moderation");

  try {
    const moderation = new OpenAIModerationChain();
    const { output: badResult, results } = await moderation.call({
      input: data?.task.input,
    });

    const resultsArray = results.map((result: { flagged: boolean }) => {
      if (result.flagged) return 1;
      else return 0;
    });
    const answer = {
      token: data?.token,
      answer: resultsArray,
    };
    await sendAnswer(answer);
  } catch (error) {
    console.error("Something went wrong");
  }
};

moderation();
