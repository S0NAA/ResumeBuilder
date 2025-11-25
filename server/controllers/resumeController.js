import imagekit from "../configs/imageKit.js";
import Resume from "../models/Resume.js";
import fs from "fs";

// controller for creating a new resume
// POST: /api/resumes/create
export const createResume = async (req, res) => {
  try {
    const userId = req.userId;
    const {title} = req.body;
    
    const newResume = await Resume.create({userId, title})
    
    return res.status(201).json({
      message: 'Resume created successfully', 
      resume: newResume
    })
    
  } catch (error) {
    console.error('createResume error:', error)
    return res.status(500).json({message: error.message})
  }
}

// controller for deleting a resume
// DELETE: /api/resumes/delete/:resumeId
export const deleteResume = async (req, res) => {
  try {
    const userId = req.userId;
    const {resumeId} = req.params;
    
    const deleted = await Resume.findOneAndDelete({userId, _id: resumeId})
    
    if(!deleted) {
      return res.status(404).json({message: 'Resume not found'})
    }

    return res.status(200).json({message: 'Resume deleted successfully'})
    
  } catch (error) {
    console.error('deleteResume error:', error)
    return res.status(500).json({message: error.message})
  }
}

//get user resume by id
//GET: /api/resumes/get/:resumeId
export const getResumeBYId = async (req, res) => {
  try{
    const userId = req.userId;
    const {resumeId} = req.params;

    const resume = await Resume.findOne({userId, _id: resumeId})

    if(!resume){
      return res.status(404).json({message: "Resume not found"})
    }
    
    // Clean up fields
    const resumeObj = resume.toObject();
    delete resumeObj.__v;
    delete resumeObj.createdAt;
    delete resumeObj.updatedAt;

    return res.status(200).json({resume: resumeObj})

  }catch (error) {
    console.error('getResumeById error:', error)
    return res.status(500).json({message: error.message})
  }
}

//get resume by id public
// GET: /api/resumes/public/:resumeId
export const getPublicResumeById = async (req, res) => {
  try {
    const {resumeId} = req.params;
    const resume = await Resume.findOne({public: true, _id: resumeId})

    if(!resume){
      return res.status(404).json({message: "Resume not found"})
    }
    return res.status(200).json({resume})
  }catch (error) {
    console.error('getPublicResumeById error:', error)
    return res.status(500).json({message: error.message})
  }
}

//controller for updating a resume
// PUT: /api/resumes/update
export const updateResume = async (req, res) => {
  try {
    const userId = req.userId;
    const {resumeId, resumeData, removeBackground} = req.body
    const image = req.file;

    console.log('Update resume request:', { 
      resumeId, 
      hasImage: !!image, 
      removeBackground: removeBackground,
      removeBackgroundType: typeof removeBackground
    })

    // Parse resumeData
    let resumeDataCopy; 
    if(typeof resumeData === 'string'){
      resumeDataCopy = JSON.parse(resumeData)
    } else {
      resumeDataCopy = structuredClone(resumeData)
    }
     
    // Handle image upload if present
    if(image){
      try {
        // Check if removeBackground is truthy
        const shouldRemoveBackground = removeBackground === 'yes' || removeBackground === 'true' || removeBackground === true;
        
        console.log('Should remove background:', shouldRemoveBackground);
        
        // Build transformation string
        let transformationString = 'w-300,h-300,fo-face,z-0.75';
        if (shouldRemoveBackground) {
          transformationString += 'bg-remove'; // or try 'e-background_remove'
        }
        
        console.log('Transformation string:', transformationString);
        
        const response = await imagekit.upload({
          file: fs.readFileSync(image.path),
          fileName: `resume-${Date.now()}.${image.mimetype.split('/')[1]}`,
          folder: '/user-resumes',
          transformation: {
            pre: transformationString
          }
        });
        
        resumeDataCopy.personal_info = resumeDataCopy.personal_info || {};
        resumeDataCopy.personal_info.image = response.url;
        
        // Clean up uploaded file
        fs.unlinkSync(image.path);
        
        console.log('Image uploaded successfully:', response.url)
        console.log('Full ImageKit response:', JSON.stringify(response, null, 2))
      } catch (imageError) {
        console.error('Image upload error:', imageError)
        console.error('ImageKit error details:', imageError.message)
        // Continue without image if upload fails
      }
    }

    // Update resume in database
    const resume = await Resume.findOneAndUpdate(
      {userId, _id: resumeId}, 
      resumeDataCopy, 
      {new: true, runValidators: true}
    )

    if(!resume) {
      return res.status(404).json({message: 'Resume not found'})
    }

    console.log('Resume updated successfully')
    return res.status(200).json({message: 'Saved successfully', resume})
    
  }catch (error){
    console.error('updateResume error:', error)
    return res.status(500).json({message: error.message})
  }
}