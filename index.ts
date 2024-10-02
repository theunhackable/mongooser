import mongoose from "mongoose";
import User from "./schemas/User";

async function main() {
  await mongoose.connect(process.env.DB_URL!);
  const firstName = "sai";
  const lastName = "pagala";
  const dob = new Date("2000-05-23");
  const age = 24;
  const newUser = new User({ firstName, lastName, dob, age });

  const fullName = newUser.fullName;
  console.log("full Name: ", fullName);
  console.log(newUser.getAge());
}

main();
