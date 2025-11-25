import express from "express";
import protect from "../middlewares/authMiddleware.js";
import { enhancejobdescription, enhanceProfessionalSummary, uploadResume } from "../controllers/aiController.js";


const aiRouter = express.Router();

aiRouter.post('/enhance-pro-sum', protect, enhanceProfessionalSummary)
aiRouter.post('/enhance-job-desc', protect, enhancejobdescription)
aiRouter.post('/upload-resume', protect, uploadResume)

export default aiRouter