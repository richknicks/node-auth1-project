const bcrypt  = require("bcryptjs");
const router = require("express").Router()

const Users = require("../users/users-model");

router.post("/register", (req, res)=>{
    const userInfo= req.body;
    const ROUNDS = process.env.HASHING_ROUNDS || 8
    const hash = bcrypt.hashSync(userInfo.password, ROUNDS);

    userInfo.password = hash;

    Users.add(userInfo)
    .then(user=>{
      user?  res.status(200).json(user):
      res.status(400).json({error: "There is an error"
      })
    })
    .catch(error=>{
        res.status(500).json({
            error:`There is an error${error}`
        });
    });
});

router.post("/login", (req,res)=>{
    const {username, password}= req.body
    Users.findBy({username})
    .then(([user])=>{
       if (user && bcrypt.compareSync(password, user.password))
        {req.session.user={id: user.id, username: user.username}
        res.status(200).json({hello: user.username})}
        else{
            res.status(401).json({message: "invalid credentials"})
        }
    })
    .catch(error=>{
        res.status(500).json({
            error:`There was an error${error}`
        });
    });
});

router.get("/logout", (req, res)=>{
    if(req.session){
        req.session.destroy(error=>{
            if(error) {
                res.status(500).json({
                    message: "some kind of error"
                })
            }else{
                res.status(200).json({message: "logout successful"})
            }
        });
    }else{
        res.status(200).json({message: "Not logged in"})
    }
});

module.exports= router;