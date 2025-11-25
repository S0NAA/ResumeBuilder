import User from "../models/User.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Resume from "../models/Resume.js";

const generateToken = (userId)=>{
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: '7d'})
    return token;
}


export const registerUser = async (req, res) => {
    try {
        const{name, email, password}= req.body;

        // check if required fields are present
        if(!name || !email, !password){
            return res.status(400).json({message: 'Missing required field'})
        }

        // check if user already exists
        const user = await User.findOne({email})
        if(user){
            return res.status(400).json({message: 'User already exists'})
        }

        // create new user
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = await User.create({
            name, email, password: hashedPassword
        })

        // return success message
        const token = generateToken(newUser._id)
        newUser.password = undefined;

        return res.status(201).json({message: 'User created successfully', token,
            user: newUser
        })

    } catch (error){
        return res.status(400).json({message: error.message})
    }
}


// controller for user login
// POST: /api/users/login

export const loginUser = async (req, res) => {
    try {
        const{ email, password}= req.body;

        // check if user exists
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({message: 'Invalid email or password'})
        }

        // check if password is correct
        if(!await user.comparePassword(password)){
             return res.status(400).json({message: 'Invalid email or password'})
        }

        // return success message
        const token = generateToken(user._id)
        user.password = undefined;

        return res.status(200).json({message: 'Login successfully', token,user })

    } catch (error){
        return res.status(400).json({message: error.message})
    }
}

// controller for getting user id
// Get: /api/users/data

export const getUserById = async (req, res) => {
    try {
        
        const userId = req.userId;

        // check if user exists
        const user = await User.findById(userId)
        if(!user){
            return res.status(404).json({message: 'User not found'})
        }
        // return user
        user.password = undefined;
        return res.status(200).json({user})

    } catch (error){
        return res.status(400).json({message: error.message})
    }
}

//controller for getting user resumes
//GET: /api/users/resumes
export const getUserResumes = async (req, res) => {
    try{
        const userId = req.userId;

        //return user resumes
        const resumes = await Resume.find({userId})
        return res.status(200).json({resume: resumes})
    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}

// In userController.js or create a new migration file
export const migrateSkills = async (req, res) => {
  try {
    const resumes = await Resume.find({});
    
    for (const resume of resumes) {
      if (typeof resume.skills === 'string' && resume.skills) {
        // Convert string to array
        const skillsArray = resume.skills
          .split(',')
          .map(skill => skill.trim())
          .filter(skill => skill.length > 0);
        
        resume.skills = skillsArray;
        await resume.save();
      }
    }
    
    res.json({ message: `Migrated ${resumes.length} resumes` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}