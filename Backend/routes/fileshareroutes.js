const express = require('express');
const User = require('../Models/userModels');
const Verification = require('../Models/verificationModel');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const multer = require('multer'); // No longer needed
const nodemailer = require('nodemailer');
const resfunction = require('../utils/resfunction');
const authTokenHandler = require('../middlewares/checkauthMiddle');
const fs = require('fs');
const errormiddlewares = require('../middlewares/errorMiddle');
const cloudinary = require('cloudinary').v2;


cloudinary.config({
    cloud_name: 'day296jea',
    api_key: '225935242689333',
    api_secret: '8pNThx8zUWl8cIDsTVMCazb66Lk'
});
async function mailer(receiveremail, filesenderemail) {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: 'sunnysrivastava258@gmail.com',
            pass: 'lkdk nhga zhjc xrip'
        }
    });

    let info = await transporter.sendMail({
        from: "Team ShareSphere",
        to: receiveremail,
        subject: "New File",
        text: "You received a new file from " + filesenderemail,
        html: "<b>You received a new file from  " + filesenderemail + "</b>",
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

router.get('/test', (req, res) => {
    res.send('File share routes are working!');
});

router.post('/sharefile', authTokenHandler, async (req, res, next) => {
    try {
        const { filename, file } = req.body;
        let senderuser = await User.findOne({ _id: req.userId });
        // let receiveruser = await User.findOne({ email: receiveremail });
        if (!senderuser) {
            return resfunction(res, 400, 'Sender email is not registered', null, false);
        }
        // if (!receiveruser) {
        //     return resfunction(res, 400, 'Receiver email is not registered', null, false);
        // }
        // if (senderuser.email === receiveremail) {
        //     return resfunction(res, 400, 'Receiver email cannot be same as sender', null, false);
        // }

        // Upload file directly to Cloudinary
        const cloudinaryUpload = await cloudinary.uploader.upload_stream({ resource_type: 'auto' },
            async (error, result) => {
                if (error) {
                    console.log(error)
                    return resfunction(res, 400, 'Failed to upload file to Cloudinary', null, false);
                }
                try {
                    senderuser.files.push({
                        senderemail: senderuser.email,
                        receiveremail: "srivastavasunny359@gmail.com",
                        fileurl: result.secure_url,
                        filename: filename ? filename : new Date().toLocaleDateString(),
                        sharedAt: Date.now()
                    });

                    receiveruser.files.push({
                        senderemail: senderuser.email,
                        receiveremail: "srivastavasunny359@gmail.com",
                        fileurl: result.secure_url,
                        filename: filename ? filename : new Date().toLocaleDateString(),
                        sharedAt: Date.now()
                    });

                    await senderuser.save();
                    await receiveruser.save();
                    await mailer(receiveremail, senderuser.email);
                    return resfunction(res, 200, 'Shared successfully', null, true);
                } catch (err) {
                    return resfunction(res, 400, 'Error saving file information', null, false);
                }
            });

        // Pipe the file data to the Cloudinary upload stream
        // file.pipe(cloudinaryUpload);
    } catch (err) {
        next(err);
    }
});

router.get('/getfiles', authTokenHandler, async (req, res, next) => {
    try {
        let user = await User.findOne({ _id: req.userId });
        if (!user) {
            return resfunction(res, 400, 'User Not Found', null, false);
        }
        return resfunction(res, 200, 'Files Fetched Successfully', user.files, true);
    } catch (error) {
        next(error);
    }
});

router.use(errormiddlewares);

module.exports = router;


// const express = require('express');
// const User = require('../Models/userModels');
// const Verification = require('../Models/verificationModel');
// const router = express.Router();
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// import { v2 as cloudinary } from 'cloudinary';

// const multer = require('multer');
// const nodemailer = require('nodemailer');
// const resfunction = require('../utils/resfunction');
// const authTokenHandler = require('../middlewares/checkauthMiddle');
// const fs = require('fs');
// const errormiddlewares = require('../middlewares/errorMiddle');


// cloudinary.config({
//     cloud_name: 'day296jea',
//     api_key: '225935242689333',
//     api_secret: '8pNThx8zUWl8cIDsTVMCazb66Lk'
// });
// async function mailer(recieveremail, filesenderemail) {
//     let transporter = nodemailer.createTransport({
//         host: "smtp.gmail.com",
//         port: 587,
//         secure: false,
//         requireTLS: true,
//         auth: {
//             user: 'sunnysrivastava258@gmail.com',
//             pass: 'lkdk nhga zhjc xrip'
//         }
//     })

//     let info = await transporter.sendMail({
//         from: "Team ShareSphere",
//         to: recieveremail,
//         subject: "New File",
//         text: "You recieved a new file from " + filesenderemail,
//         html: "<b>You recieved a new file from  " + filesenderemail + "</b>",

//     })

//     console.log("Message sent: %s", info.messageId);
//     console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

// }

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, './public');
//     },
//     filename: (req, file, cb) => {
//         let fileType = file.mimetype.split('/')[1];
//         console.log(req.headers.filename);
//         cb(null, `${Date.now()}.${fileType}`);
//     }
// });
// const upload = multer({ storage: storage });

// const fileUploadFunction = (req, res, next) => {

//     upload.single('clientfile')(req, res, (err) => {
//         if (err) {
//             return resfunction(res, 400, 'File upload failed', null, false);
//         }
//         next();
//     })
// }

// router.get('/test', (req, res) => {
//     res.send('File share routes are working!');
// });

// router.post('/sharefile', authTokenHandler, fileUploadFunction, async (req, res, next) => {
//     try {
//         const { receiveremail, filename } = req.body;
//         // console.log(req.body);
//         let senderuser = await User.findOne({ _id: req.userId });
//         let recieveruser = await User.findOne({ email: receiveremail });
//         if (!senderuser) {
//             if (req.file && req.file.path) {
//                 fs.unlink(req.file.path, (err) => {
//                     if (err) {
//                         console.log(err);
//                     }
//                     else {
//                         console.log('File deleted successfully');
//                     }
//                 })
//             }
//             return resfunction(res, 400, 'Sender email is not registered', null, false);
//         }
//         if (!recieveruser) {

//             if (req.file && req.file.path) {
//                 fs.unlink(req.file.path, (err) => {
//                     if (err) {
//                         console.log(err);
//                     }
//                     else {
//                         console.log('File deleted successfully');
//                     }
//                 })
//             }

//             return resfunction(res, 400, 'Reciever email is not registered', null, false);
//         }


//         if (senderuser.email === receiveremail) {
//             if (req.file && req.file.path) {
//                 fs.unlink(req.file.path, (err) => {
//                     if (err) {
//                         console.log(err);
//                     }
//                     else {
//                         console.log('File deleted successfully');
//                     }
//                 })
//             }

//             return resfunction(res, 400, 'Reciever email cannot be same as sender', null, false);
//         }

//         senderuser.files.push({
//             senderemail: senderuser.email,
//             receiveremail: receiveremail,
//             fileurl: req.file.path,
//             filename: filename ? filename : new Date().toLocaleDateString(),
//             sharedAt: Date.now()
//         })

//         recieveruser.files.push({
//             senderemail: senderuser.email,
//             receiveremail: receiveremail,
//             fileurl: req.file.path,
//             filename: filename ? filename : new Date().toLocaleDateString(),
//             sharedAt: Date.now()
//         })

//         await senderuser.save();
//         await recieveruser.save();
//         await mailer(receiveremail, senderuser.email);
//         return resfunction(res, 200, 'shared successfully', null, true);

//     }
//     catch (err) {
//         next(err);
//     }
// })

// router.get('/getfiles', authTokenHandler, async (req, res, next) => {
//     try {
//         let user = await User.findOne({ _id: req.userId })
//         if (!user) {
//             return resfunction(res, 400, 'User Not Found', null, false);
//         }
//         return resfunction(res, 200, 'Files Fetched Successfully', user.files, true);
//     } catch (error) {
//         next(error)
//     }
// })

// router.use(errormiddlewares)

// module.exports = router;