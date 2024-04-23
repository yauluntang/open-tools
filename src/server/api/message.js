import { Message } from '../model/message.js';


export const message = async (req, res) => {
  try {
    const messages = await Message.findAll();
    res.json(messages);
    res.end();
  }
  catch (e) {
    console.error(e)
  }
}