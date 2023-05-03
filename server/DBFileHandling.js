const mongoose = require('mongoose');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');

let bucket;
mongoose.connection.on("connected", () => {
    var db = mongoose.connections[0].db;
    bucket = new mongoose.mongo.GridFSBucket(db, {
        bucketName: 'application/files'
    })
    console.log('This is GridFSBucket');
})

const storage = new GridFsStorage({
    url: "mongodb://127.0.0.1:27017/ZoomRecorder",
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            const filename = file.originalname;
            const fileInfo = {
                filename: filename,
                bucketName: "application/files"
            };
            resolve(fileInfo);
        });
    }
});

const upload = multer({
    storage
})

function Retrieve(req, res) {
    try {
        const file = bucket
            .find({
                _id: new mongoose.Types.ObjectId(req.params.id)
            })
            .toArray((err, files) => {
                if (!files || files.length === 0) {
                    return res.status(404)
                        .json({
                            err: "no files exist"
                        });
                }
                console.log(files)
                // res.status(200).json({
                //     files
                // })
                bucket.openDownloadStream(new mongoose.Types.ObjectId(req.params.id))
                    .pipe(res);
            });
    } catch (err) {
        console.log(err);
    }
}

function Rename(id, NewName) {
    const file = bucket.rename(id, NewName);
}

function Delete(id) {
    const file = bucket.delete(id);
}

module.exports = { upload: upload, retrieve: Retrieve, rename: Rename, delete: Delete };