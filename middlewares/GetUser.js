getUser=async (req,res,next)=>{
    try {
        let string=jwt.verify(req.body.token,JWT_STRING)
        let item= await Cart.find({user:string.user})
        res.send(item)
    
    } catch (error) {
        res.send("Kindly Login")
    }
}