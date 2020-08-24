
var crypto = require('crypto'); 
var Datastore = require('nedb')
const database = new Datastore("database.db")
database.loadDatabase();


function findOne(db, opt) {
  return new Promise(function(resolve, reject) {
    db.findOne(opt, function(err, doc) {
      if (err) {
        reject(err)
      } else {
        resolve(doc)
      }
    })
  })
}

async function RegisterUser(req) {
  
  var reqUserName = req.UserName.trim();
  var reqPassword = req.Password.trim();
  console.clear();

  if(reqUserName === "admin") return  { error: "You are not Fucking admin" };
  if(reqUserName === "administrator") return  { error: "You are not Fucking administrator" };

  doc = await findOne(database, { UserName: reqUserName});

  if (doc)
    return { error: "UserName is taken" };
  
  req.Salt = crypto.randomBytes(16).toString('hex'); 
  req.Hash = crypto.pbkdf2Sync(reqPassword, req.Salt, 1000, 64, `sha512`).toString(`hex`); 
   
  database.insert(req);

  return { success: "You have successfully registred" };
}


async function LoginUser(req) {
  
  var reqUserName = req.UserName.trim();
  var reqPassword = req.Password.trim();
  console.clear();

  doc = await findOne(database, { UserName: reqUserName});

  if (!doc)
  {
    return { error: "UserName not found" };
  }

  var GeneratedHash = crypto.pbkdf2Sync(reqPassword,  
    doc.Salt, 1000, 64, `sha512`).toString(`hex`); 

    if (GeneratedHash === doc.Hash)
      return { success: "You have successfully Loged In" };
   else
     return { error: "Wrong PassWord" };
}


module.exports = { RegisterUser,LoginUser };