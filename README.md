# Mongoose vituals and statics and methods

## .methods (Instance Methods):

- methods are known as `insatnce methods`
- They are defined for an individual record/document.

Example:

```js
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  age: Number,
});

// Defining an instance method
userSchema.methods.getFullName = function () {
  return this.firstName + " " + this.lastName;
};

const User = mongoose.model("User", userSchema);

const user = new User({ firstName: "John", lastName: "Doe" });
console.log(user.getFullName()); // Outputs: "John Doe"
```

Here we can observe that the getFullName method is defined in such a way that it require the data of a single
document i.e. firstName, lastName.

> Note: (In terms of sql) In a case where you need to define an operation on the data of a row use this.

## .statics ( Static Methods )

- `static methods` are defined on top of the whole model itself.
- It can access all the data inside a data model, unlike methods which can access only one value.

Example:

```js
// Defining a static method
userSchema.statics.findByAge = function (age) {
  return this.find({ age });
};

const User = mongoose.model("User", userSchema);

// Using the static method
User.findByAge(30).then((users) => {
  console.log(users); // Outputs users with age 30
});
```

## Virtual fields

Virtual fields in Mongoose are properties that are not stored in the MongoDB database
but are computed on the fly when you query a document. These fields can be used to
create derived data or perform calculations based on existing fields in the document.

Example of getter:

```js
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
});

// Define a virtual property 'fullName'
userSchema.virtual("fullName").get(function () {
  return this.firstName + " " + this.lastName;
});

const User = mongoose.model("User", userSchema);

const user = new User({ firstName: "John", lastName: "Doe" });
console.log(user.fullName); // Outputs: "John Doe"
```

Example of setter:

```js
const userSchema = new mongoose.Schema({
  birthDate: Date,
  age: Number, // We'll calculate and set this using a virtual setter
});

// Virtual setter for age
userSchema.virtual("setAge").set(function (birthDate) {
  // Calculate age from the birth date
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  // Adjust for months/days to get the accurate age
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    this.age = age - 1;
  } else {
    this.age = age;
  }

  // Store the birthDate as well
  this.birthDate = birthDate;
});

const User = mongoose.model("User", userSchema);

// Example usage
const user = new User();
user.setAge = new Date("1990-05-15"); // Setting the birth date

console.log(user.age); // Outputs the calculated age based on the birth date
console.log(user.birthDate); // Outputs: 1990-05-15
```

## How to make them type safe?

Let's take another model similar to the previous user model:

```js
const UserSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dob: { type: Date, required: true },
  age: { type: Number, required: true },
});

// Virtual
UserSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Method
UserSchema.methods.getAge = function () {
  return this.age;
};

// Static
UserSchema.statics.findByFullName = function (name) {
  const [firstName, lastName] = name.split(" ");
  return this.findOne({ firstName, lastName });
};
```

Let's understand how we should type these schema and model.

You as the developer are responsible for ensuring that your document interface lines up with your
Mongoose schema. For example, Mongoose won't report an error if email is required in your Mongoose
schema but optional in your document interface.

### Types for the Schema:

- Schema accepts an object where keys represent the fields of the
  document and the values are the types and configurations of those fields in addition to the Document defination.

- we can use interface to extend the Mongoose's `Document`, which adds properties like \_id and methods
  like save to the user model.

- this is the best spot to define types for methods as well as virtuals, if you have any
  ( as methods and vitruals work on each specific document)

```ts
// Interface for the User document
interface IUser extends Document {
  firstName: string;
  lastName: string;
  dob: Date;
  age: number;
  fullName: string;
  getAge: () => number;
}
```

After defining this interface we can user `IUser` as a generic to the Schema;

```ts
const UserSchema = new Schema<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dob: { type: Date, required: true },
  age: { type: Number, required: true },
});
```

> Note: If you notice carefully the schema doesnot contain `fullName` and `getAge()`
> but the interface does. It is because we have
> a vitual field called `fullName` and a method called `getAge()`

### Typing your model:

- This can be a little tricky part. You have seen that there is no type defination
  given to the static method i.e. `UserSchema.statics.findByFullName`
- The reason for this is because the static method is applied to the whole model itself.
- So you basically need to define the static methods inside an interface which extends `Model<IUser>`.

```ts
// Interface for the User model
interface IUserStaticMethods extends Model<IUser> {
  findByFullName(name: string): Promise<IUser | null>;
}
```

- Finally whenever you are creating the model just pass the `IUser`, `IUserStaticMethods` into the Model

```ts
// Create and export the model
const User = model<IUser, IUserStaticMethods>("User", UserSchema);
```

> Note: You should also define the types for your instance methods, virtuals, statics

```ts
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
```

This is how we secure our mongoose models with typesafety.
