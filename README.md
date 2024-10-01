# Mongoose vituals and statics and methods

## .methods (INstance Methods):

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
