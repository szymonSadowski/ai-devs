import { endpoints } from "../const";

export async function getToken(taskName: string): Promise<string | null> {
  try {
    const response = await fetch(endpoints.token + taskName, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apikey: process.env.AI_DEVS_API_KEY,
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const data = (await response.json()) as { token: string };
    console.log("token: ", data);
    return data.token;
  } catch (error) {
    console.error("Error fetching token:", error);
    return null;
  }
}

export async function getTaskData(token: string) {
  try {
    const response = await fetch(endpoints.task.getTask + token, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const data = await response.json();
    console.log("task data: ", data);
    return data;
  } catch (error) {
    console.error("Error fetching task data:", error);
  }
}

export async function useTaskData<HelloApiAnswer>(taskName: string) {
  const token = await getToken(taskName);
  if (token) {
    const task = (await getTaskData(token)) as HelloApiAnswer;
    const taskData = {
      token: token,
      task: task,
    };
    return taskData;
  }
  return null;
}

type SendAnswerProps = {
  answer: any;
  token: string | undefined;
};
export async function sendAnswer(props: SendAnswerProps) {
  console.log(props.answer);
  try {
    const response = await fetch(endpoints.task.answerTask + props.token, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        answer: props.answer,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    console.log("Answer Response: ", data);
    return data;
  } catch (error) {
    console.error("Error when sending answer:", error);
    return null;
  }
}
