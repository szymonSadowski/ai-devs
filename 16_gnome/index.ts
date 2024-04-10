import OpenAI from "openai";
import { sendAnswer, useTaskData } from "../lib";
import type { TaskType } from "../lib/types";

type Gnome = TaskType & {
  url: string;
};
const openai = new OpenAI();
const gnome = async () => {
  const data = await useTaskData<Gnome>("gnome");
  console.log(data);
  if (!data) return;
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Jaki kolor czapki ma gnom na obrazku. Jezeli nie ma gnoma zwroc ERROR. Zwroc tylko jedno slowo",
            },
            {
              type: "image_url",
              image_url: {
                url: data.task.url,
              },
            },
          ],
        },
      ],
    });
    const answer = {
      token: data?.token,
      answer: response.choices[0].message.content,
    };
    await sendAnswer(answer);
  } catch (error) {
    console.error("Something went wrong", error);
  }
};

gnome();
