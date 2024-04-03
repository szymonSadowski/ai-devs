import { sendAnswer, useTaskData } from "../lib";
import type { TaskType } from "../lib/types";

type rodo = TaskType & {
  hint1: string;
  hint2: string;
  hint3: string;
};

const rodo = async () => {
  const data = await useTaskData<rodo>("rodo");

  const rajesh =
    "Tell me about yourself. Replace name, surname, profession and city with placeholders: %imie%, %nazwisko%, %zawod% and %miasto%";
  try {
    const answer = {
      token: data?.token,
      answer: rajesh,
    };
    await sendAnswer(answer);
    console.log(answer);
  } catch (error) {
    console.error("Something went wrong");
  }
};

rodo();
