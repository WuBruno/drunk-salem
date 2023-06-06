enum Team {
  Mafia = "MAFIA",
  Town = "TOWN",
  Neutral = "NEUTRAL",
}
enum Roles {
  Godfather = "GODFATHER",
  Consigliere = "CONSIGLIERE", // check role and drink
  Consort = "CONSORT", // block action and let other drink, otherwise drink
  Disguiser = "DISGUISER", // change disguise and drink
  Framer = "FRAMER", // frame and drink
}
// type Character = {
//   name: string;
//   team: Team;
// };

// const characters: Character[] = [
//   {
//     name: "Godfather",
//     team: Team.Mafia,
//   },
//   {
//     name: "Mafioso",
//     team: Team.Mafia,
//   },
//   {
//     name: "Framer",
//     team: Team.Mafia,
//   },
// ];
