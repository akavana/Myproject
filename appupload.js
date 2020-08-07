const express = require("express");
const multer = require("multer");
const ejs = require("ejs");
const path = require("path");
const expressLayouts = require('express-ejs-layouts');
//init app
const app = express();

const indexRouter = require('./routes/index');

//EJS
app.set("view engine", "ejs");
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');
app.use(expressLayouts);
app.use(express.static('public'));

//index route
app.use('/', indexRouter);

//Set Storage Engine
const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

//init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("myImage");

//Check File Type
function checkFileType(file, cb) {
  //Allowed extensions
  const filetypes = /jpeg|jpg|png|gif/;
  //Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  //check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("ERROR: Images only");
  }
}





//Public Folder
app.use(express.static(path.join(__dirname, 'public')));


app.get("/supload", (req, res) => res.render("uploader"));

app.post("/upload", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.render("uploader", {
        msg: err,
      });
    } else {
      if (req.file == undefined) {
        res.render("uploader", {
          msg: 'Error: No file selected!'
        });
    } else {
          res.render("uploader", {
            msg: 'File Uploaded!',
            file:`uploads/${req.file.filename}`
          });
      }
    }
  });
});

// Allow assets directory listings
const serveIndex = require('serve-index'); 
app.use('/public/uploads', serveIndex(path.join(__dirname, '/public/uploads')));




app.listen(process.env.PORT || 3000)
