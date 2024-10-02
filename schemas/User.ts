import { Schema, model, Document, Model } from "mongoose";

// Interface for the User document
interface IUser extends Document {
  firstName: string;
  lastName: string;
  dob: Date;
  age: number;
  fullName: string;
  getAge: () => number;
}

// Interface for the User model
interface IUserStaticMethods extends Model<IUser> {
  findByFullName(name: string): Promise<IUser | null>;
}

const UserSchema = new Schema<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dob: { type: Date, required: true },
  age: { type: Number, required: true },
});

// Virtual
UserSchema.virtual("fullName").get(function (this: IUser) {
  return `${this.firstName} ${this.lastName}`;
});

// Method
UserSchema.methods.getAge = function (this: IUser): number {
  return this.age;
};

// Static
UserSchema.statics.findByFullName = function (
  name: string,
): Promise<IUser | null> {
  const [firstName, lastName] = name.split(" ");
  return this.findOne({ firstName, lastName });
};

// Create and export the model
const User = model<IUser, IUserStaticMethods>("User", UserSchema);
export default User;
