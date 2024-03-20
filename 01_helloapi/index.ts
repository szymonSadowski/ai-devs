import { sendAnswer, useTaskData } from "../lib";

type HelloApiAnswer = {
  cookie: string;
  code: number;
  msg: string;
};

const helloApi = async () => {
  const data = await useTaskData<HelloApiAnswer>("helloapi");
  const answer = {
    token: data?.token,
    answer: data?.task.cookie,
  };
  await sendAnswer(answer);
};

helloApi();
