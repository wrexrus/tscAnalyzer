import Joi from 'joi';

// Joi Validation middleware ensures that bad or malicious data never even reaches our controller.
 

const analyzeRequestSchema = Joi.object({
    code: Joi.string().min(1).required().messages({
        'string.empty': 'Code cannot be empty',
        'any.required': 'Code is a required field'
    }),
    mode: Joi.string().valid('analyze', 'optimize', 'convert', 'test').default('analyze'),
    targetLanguage: Joi.string().optional()
});


export const validateAnalyzeRequest = (req, res, next) => {
    const { error, value } = analyzeRequestSchema.validate(req.body);
    
    if (error) {
        return res.status(400).json({ 
            success: false, 
            message: "Validation Error", 
            details: error.details.map(err => err.message) 
        });
    }

    req.body = value;
    
    next();
};
