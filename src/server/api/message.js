import { Message } from '../model/message.js';


export const message = async (req, res) => {
  try {
    const messages = await Message.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']]
    });

    const returnMessages = messages.reverse();
    res.json(returnMessages);
    res.end();
  }
  catch (e) {
    console.error(e)
  }
}