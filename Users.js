const rusers = [];
const users = [];

const RUserLogin = ({ name, pass }) => {

  name = name.trim();
  pass = pass.trim();

  const hasuser = rusers.find((ruser) => ruser.name === name);
  const haspassword = rusers.find((ruser) => ruser.pass === pass);

  if(!name) return  { error: "Username is required" };
  if(!pass) return  { error: "Password is required." };
  if(!hasuser) return  {error: "Wrong Username" };
  if(!haspassword) return  {error: "Wrong Password" };

  return { success: "You have successfully Logged In" };
}

const addRUser = ({ name, pass }) => {

  name = name.trim();
  pass = pass.trim();

  const existingUser = rusers.find((ruser) => ruser.name === name);

  if(!name) return  { error: "Username is required" };
  if(name.toLowerCase() == "admin") return  { error: "You are not Fucking admin" };
  if(name.toLowerCase() == "administrator") return  { error: "You are not Fucking administrator" };
  if(!pass) return  { error: "Password is required." };
  if(existingUser) return  {error: "Username is taken" };

  const user = {name, pass};

  rusers.push(user);

  return { success: "You have successfully registred" };
}

const addUser = ({ id, name }) => {
 
  name = name.trim().toLowerCase();

  const existingUser = users.find((user) => user.name === name);

  if(!name) return { error: 'Username are required.' };
  if(existingUser) return { error: 'Username is taken.' };

  const user = { id, name };

  users.push(user);

  return { user };
}

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if(index !== -1) return users.splice(index, 1)[0];
}

const getUser = (id) => users.find((user) => user.id === id);

const getUsersInRoom = () => users;

module.exports = { addUser, removeUser, getUser, getUsersInRoom,addRUser,RUserLogin };