const crypto = require('crypto'); 
const Datastore = require('nedb');
const database = new Datastore("database.db");
database.loadDatabase();

const fs = require('fs').promises;
const fsextra = require('fs-extra');
const path = require('path');

const ProfilePicPath = path.join(process.cwd(),"ProfilePics");
fsextra.mkdirsSync(ProfilePicPath);

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

async function SaveProfilePicture(b64Data,UserName) {
  
  const ImageType = b64Data.split(';')[0].split('/')[1];
 
  const base64Image = b64Data.split(';base64,').pop();
  
  const GeneratedPath = path.join(ProfilePicPath,UserName + "." + ImageType)

  await fsextra.writeFileSync(GeneratedPath, base64Image, {encoding: 'base64'})

  console.log(GeneratedPath);

  return GeneratedPath;
}

async function RegisterUser(req) {
  
  const reqUserName = req.UserName.trim();
  const reqPassword = req.Password.trim();

  if(reqUserName.toLowerCase() === "admin") return  { error: "You are not Fucking admin" };
  if(reqUserName.toLowerCase() === "administrator") return  { error: "You are not Fucking administrator" };

  doc = await findOne(database, { UserName: reqUserName});

  if (doc)
    return { error: "UserName is taken" };
  
  req.Salt = crypto.randomBytes(16).toString('hex'); 
  req.Hash = crypto.pbkdf2Sync(reqPassword, req.Salt, 1000, 64, `sha512`).toString(`hex`); 

  if (req.PPb64 !== "")
    req.ProfilPicPath = await SaveProfilePicture(req.PPb64, reqUserName);    
  
  delete req.Password;  //Remove Password ==> Simple, easy , why not,
  delete req.PPb64; //Remove ProfilePicFromThis ==> Simple, easy , why not,
  
  database.insert(req);

  return { success: "You have successfully registred" };
}


async function LoginUser(req) {
  
  const reqUserName = req.UserName.trim();
  const reqPassword = req.Password.trim();
  
  doc = await findOne(database, { UserName: reqUserName});

  if (!doc)
    return { error: "UserName not found" };
  
  const GeneratedHash = crypto.pbkdf2Sync(reqPassword, doc.Salt, 1000, 64, `sha512`).toString(`hex`); 

    if (GeneratedHash === doc.Hash)
    {

      let ProfilePic = null;
      
      if (doc.ProfilPicPath)
      {  
        ProfilePic = await fsextra.readFileSync(doc.ProfilPicPath,{encoding: 'base64'});    
      }
        
      return { success: "You have successfully Loged In", ProfilePic: "data:image/jpeg;base64," + ProfilePic};
    }  
   else
     return { error: "Wrong PassWord" };
}


module.exports = { RegisterUser,LoginUser };