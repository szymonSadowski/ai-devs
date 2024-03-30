import OpenAI from "openai";
import { sendAnswer, useTaskData } from "../lib";
import type { TaskType } from "../lib/types";

type Functions = TaskType & {
  hint1: string;
};

const functions = async () => {
  const data = await useTaskData<Functions>("functions");

  const definition = {
    name: "addUser",
    description:
      "Function that is adding a user and requires 3 params, name, surname and year",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Provide name of a user",
        },
        surname: {
          type: "string",
          description: "Provide surname of a user",
        },
        year: {
          type: "number",
          description: "Provide a year of birth of the user.",
        },
      },
    },
  };
  try {
    const answer = {
      token: data?.token,
      answer: definition,
    };
    await sendAnswer(answer);
    console.log(answer);
  } catch (error) {
    console.error("Something went wrong");
  }
};

functions();
