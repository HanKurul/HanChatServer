const crypto = require('crypto'); 
const fsextra = require('fs-extra');
const path = require('path');

/*Create ProfilePics Path*/
const ProfilePicPath = path.join(process.cwd(),"./Users/ProfilePics");
fsextra.mkdirsSync(ProfilePicPath);

const {User} = require('../Config/Config.js');

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}
async function SaveProfilePicture(b64Data,UserName) {
  
  const ImageType = b64Data.split(';')[0].split('/')[1];
 
  const base64Image = b64Data.split(';base64,').pop();
  
  const GeneratedPath = path.join(ProfilePicPath,UserName + "." + ImageType)

  await fsextra.writeFileSync(GeneratedPath, base64Image, {encoding: 'base64'})

  return path.join("Users/ProfilePics",UserName + "." + ImageType);
}

async function RegisterUser(req) {
  if (!req.UserName || !req.Password || !req.PPb64)
    return { error: "Bad Request" };

  const reqUserName = req.UserName.trim();
  const reqPassword = req.Password.trim();

  if (reqUserName.toLowerCase() === "admin")
    return { error: "You are not Fucking admin" };
  if (reqUserName.toLowerCase() === "administrator")
    return { error: "You are not Fucking administrator" };

  const userfound = await User.findAll({
    attributes: ["Username"],
    where: {
      Username: reqUserName,
    },
  });

  if (userfound.length > 0) return { error: "UserName is taken" };

  const Salt = crypto.randomBytes(16).toString("hex");
  const Hash = crypto.pbkdf2Sync(reqPassword, Salt, 1000, 64, `sha512`).toString(`hex`);
  const PicturePath = await SaveProfilePicture(req.PPb64, reqUserName);

  await User.create({
    Username: reqUserName,
    Salt: Salt,
    Hash: Hash,
    PicturePath: PicturePath,
  });

  return { success: "You have successfully registred" };
}


async function LoginUser(req) {
  if (!req.UserName || !req.Password) return { error: "Bad Request" };

  const reqUserName = req.UserName.trim();
  const reqPassword = req.Password.trim();

  const result = await User.findAll({
    where: {
      Username: reqUserName,
    },
  });

  if (result.length === 0) return { error: "Wrong UserName" };

  let valret = {};

  await asyncForEach(result, async (user) => {
    const GeneratedHash = crypto.pbkdf2Sync(reqPassword, user.dataValues.Salt, 1000, 64, `sha512`).toString(`hex`);

    if (GeneratedHash === user.dataValues.Hash) {
      const ProfilePic = await fsextra.readFileSync(
        path.join(process.cwd(), user.dataValues.PicturePath),
        { encoding: "base64" }
      );

      valret = {
        success: "You have successfully Loged In",
        ProfilePic: "data:image/jpeg;base64," + ProfilePic,
      };
    } else {
      valret = { error: "Wrong Password" };
    }
  });

  return valret;
}


module.exports = { RegisterUser,LoginUser };