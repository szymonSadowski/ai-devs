import OpenAI from "openai";
import { sendAnswer, useTaskData } from "../lib";
import type { TaskType } from "../lib/types";

type Knowledge = TaskType & {
  question: string;
};

const openai = new OpenAI();

const functionDefinition = [
  {
    name: "currency",
    description: "check exchange rate of currency",
    parameters: {
      type: "object",
      properties: {
        code: {
          type: "string",
          description: "a three- letter currency code (ISO 4217 standard)",
        },
      },
    },
  },
  {
    name: "country",
    description: "check population of the country",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "a country name in english",
        },
      },
    },
  },
  {
    name: "knowledge",
    description: "all other questions",
    parameters: {
      type: "object",
      properties: {
        answer: {
          type: "string",
          description: "answer to the question asked by the user",
        },
      },
    },
  },
];

const fetchCurrencyData = async (code: string) => {
  const url =
    "http://api.nbp.pl/api/exchangerates/rates/A/" + code + "?format=json";
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  // @ts-expect-error I am to lazy to type return
  return data.rates[0].mid;
};

const fetchCountryData = async (name: string) => {
  const url = "https://restcountries.com/v3.1/name/" + name;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  // @ts-expect-error I am to lazy to type return
  return data[0].population;
};

const useCompletionsOpenAi = async (question: string) => {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: question }],
    functions: functionDefinition,
    function_call: "auto",
  });

  return {
    message: response.choices[0].message,
  };
};

const knowledge = async () => {
  const data = await useTaskData<Knowledge>("knowledge");
  if (!data) return;
  try {
    const { message } = await useCompletionsOpenAi(data.task.question);
    if (!message.function_call) return;
    let response, answer;
    const functionName = message.function_call.name;
    switch (functionName) {
      case "currency":
        const currency = JSON.parse(message.function_call.arguments).code;
        console.log("CODE: ", currency);
        response = await fetchCurrencyData(currency);
        break;
      case "country":
        const country = JSON.parse(message.function_call.arguments).name;
        console.log("NAME: ", country);
        response = await fetchCountryData(country);
        break;
      case "knowledge":
        response = JSON.parse(message.function_call.arguments).answer;
        break;
      default:
        return;
    }
    answer = {
      token: data?.token,
      answer: response,
    };
    await sendAnswer(answer);
  } catch (error) {
    console.error("Something went wrong", error);
  }
};

knowledge();
