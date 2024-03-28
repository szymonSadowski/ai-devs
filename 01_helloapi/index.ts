import { sendAnswer, useTaskData } from "../lib";
import type { TaskType } from "../lib/types";

type HelloApi = TaskType & {
  cookie: string;
};

const helloApi = async () => {
  const data = await useTaskData<HelloApi>("helloapi");
  const answer = {
    token: data?.token,
    answer: data?.task.cookie,
  };
  await sendAnswer(answer);
};

helloApi();
