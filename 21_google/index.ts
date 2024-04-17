import { sendAnswer, useTaskData } from "../lib";
import type { TaskType } from "../lib/types";

type Google = TaskType & {};
const myApi = "https://ownapipro.azurewebsites.net/answer";
const google = async () => {
  const data = await useTaskData<Google>("google");
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

google();
