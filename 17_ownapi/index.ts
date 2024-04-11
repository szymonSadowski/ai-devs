import { sendAnswer, useTaskData } from "../lib";
import type { TaskType } from "../lib/types";

type Ownapi = TaskType & {};
const myApi = "https://yourapi.com/answer";
const ownapi = async () => {
  const data = await useTaskData<Ownapi>("ownapi");
  console.log(data);
  if (!data) return;
  try {
    const answer = {
      token: data?.token,
      answer: myApi,
    };
    await sendAnswer(answer);
  } catch (error) {
    console.error("Something went wrong", error);
  }
};

ownapi();
