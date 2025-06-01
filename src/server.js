import express from 'express';
import axios from 'axios';
import { CozeAPI, COZE_CN_BASE_URL, ChatEventType, ChatStatus, RoleType } from '@coze/api';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

const cozeClient = new CozeAPI({
  token: "pat_OaffiWFeftiOHSn4lTDCwONON06iFqebzP1vBmmauhMt3y9pwrrUHXqoFYIQzs5v",
  baseURL: COZE_CN_BASE_URL,
});

app.post('/api/coze/chat', async (req, res) => {
  const { bot_id, user_id, additional_messages } = req.body;

  try {
    const stream = await cozeClient.chat.stream({
      bot_id: bot_id,
      user_id: user_id,
      additional_messages: additional_messages
    });

    // 设置响应头，支持流式传输
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    let fullResponse = '';

    for await (const part of stream) {
      if (part.event === ChatEventType.CONVERSATION_MESSAGE_DELTA) {
        const content = part.data.content;
        console.log('[Bot]:', content);

        fullResponse += content;
        res.write(content);
      }
    }
    res.end();

    console.log('Complete response:', fullResponse);

    //if (result.chat.status === ChatStatus.COMPLETED) {
    //     for (const item of result.messages) {
    //         console.log('[%s]:[%s]:%s', item.role, item.type, item.content);
    //     }
    //}
    //console.log('usage', result.chat.usage);
    //res.json(result);
  } catch (error) {
    console.error("server.js:Error calling Coze API:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});