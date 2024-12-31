const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const dotenv = require('dotenv');
const { NodeHttpHandler } = require('@aws-sdk/node-http-handler');


// Load environment variables
dotenv.config();

// Initialize the AWS SDK for v3 with a custom timeout setting
const s3 = new S3Client({
    region: process.env.S3_REGION,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
    },
    requestHandler: new NodeHttpHandler({
        connectionTimeout: 300000, // 5 minutes
        socketTimeout: 300000,
        requestTimeout: 300000
    }),
    maxAttempts: 10,
    retryMode: 'adaptive'
});
// Set up multer storage using S3 (without ACL)
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET_NAME,
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            cb(null, `${Date.now()}-${file.originalname}`);
        }
    })
});
// Swagger schema for file upload response
/**
 * @swagger
 * components:
 *   schemas:
 *     Image:
 *       type: object
 *       properties:
 *         url:
 *           type: string
 *           description: The URL of the uploaded image
 *       example:
 *         url: "https://s3.amazonaws.com/testappblockchain/unique-file-name.jpg"
 */

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload an image to S3
 *     tags: [Files]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The image file to upload
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Image'
 *       404:
 *         description: File not found
 *       500:
 *         description: Server error
 */
 const uploadImage = (req, res) => {
    const uploadPromise = new Promise((resolve, reject) => {
        upload.single('file')(req, res, function(err) {
            if (err) reject(err);
            else resolve(req.file);
        });
    });

    uploadPromise
        .then(file => {
            const imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${file.key}`;
            res.status(200).json({ url: imageUrl });
        })
        .catch(err => {
            console.error('Upload error:', err);
            res.status(500).json({ 
                msg: 'Error uploading file',
                error: err,
                suggestion: 'Please try with a smaller file or check your connection'
            });
        });
};

/**
 * @swagger
 * /file/{filename}:
 *   get:
 *     summary: Retrieve an image by filename from S3
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: filename
 *         schema:
 *           type: string
 *         required: true
 *         description: The filename of the image to retrieve
 *     responses:
 *       200:
 *         description: The image file
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               description: The image file content
 *       404:
 *         description: File not found
 *       500:
 *         description: Server error
 */
 const getImage = (req, res) => {
    const filename = req.params.filename;

    const params = {
        Bucket: BUCKET_NAME,
        Key: filename
    };

    s3.getObject(params, (err, data) => {
        if (err) {
            if (err.code === 'NoSuchKey') {
                return res.status(404).json({ msg: 'File not found' });
            }
            return res.status(500).json({ msg: 'Error retrieving file', error: err });
        }

        res.writeHead(200, {
            'Content-Type': data.ContentType
        });
        res.write(data.Body, 'binary');
        res.end();
    });
};


module.exports = { getImage, uploadImage };