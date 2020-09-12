const router = require("express").Router();
const { catchErrors } = require("../handlers/errorHandlers");
const userController = require("../controllers/userController");

router.post("/login", catchErrors(userController.login));
router.post("/register", catchErrors(userController.register));
router.get('/halo', (req, res)=>{
    res.json({"message":"berhasil"});
})
module.exports = router;