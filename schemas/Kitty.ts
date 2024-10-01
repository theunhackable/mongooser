import mongoose, { Model } from "mongoose";

interface IKitty {
  name: String;
}

interface IKittyMethods {
  speak(): void;
}

type KittyModel = Model<IKitty, {}, IKittyMethods>;

const kittySchema = new mongoose.Schema<IKitty, KittyModel, IKittyMethods>({
  name: {
    type: String,
    require: true,
  },
});

kittySchema.methods.speak = function speak() {
  const greeting = this.name
    ? "Meow name is " + this.name
    : "I dont have an name";
  console.log(greeting);
};

const Kitten = mongoose.model("Kitten", kittySchema);

export default Kitten;
