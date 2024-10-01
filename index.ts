import mongoose from "mongoose";
import Kitten from "./schemas/Kitty";

async function main() {
  await mongoose.connect(process.env.DB_URL!);

  const silence = new Kitten({ name: "Silence" });
  silence.speak();
}

main();
