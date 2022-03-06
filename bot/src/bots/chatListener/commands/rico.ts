import { getRandomNumber } from "../../../helpers/number";
import { CommandType } from "../chatListener";

const commandRico = ({ client, channel, username }: CommandType) => {
  const respostas = [
    "investe tudo em bitcoin que é sucesso.",
    "compra tudo em NFT que você com certeza vai ficar.",
    "blockchain é a resposta",
    "joga na mega-sena",
    "já pensou em pedir adoção ao Jeff Bezos?",
    "jamais.",
    "mais chances reincarnando.",
    "você já não é?",
    "riqueza é saúde, não?",
    "melhor mudar de assunto.",
  ];
  client.send(
    `PRIVMSG #${channel} :@${username}, ${
      respostas[getRandomNumber(0, respostas.length - 1)]
    }`
  );
};

export default commandRico;
