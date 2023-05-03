const app = require('express').Router();
const fetch = require('node-fetch');
const UserModel = require('./Models/UserModel');
const fs = require('fs');
const GetSignature = require('./OAuth/Signature');
const containers = require('./DBFileHandling');
const RecordingModel = require('./Models/RecordingModel');

/**
 * Base url for zoom api
 * @link https://api.zoom.us/v2/
 */
const link = 'https://api.zoom.us/v2';

const options = {
    'content-type': 'application/json',
    'method': 'get',
    'muteHttpExceptions': true,
    'headers': { 'Authorization': '' },
}

async function GetAccessToken(User) {
    options.method = 'POST';
    options.headers.Authorization = 'Basic ' + Buffer.from(process.env.CLIENTID + ":" + process.env.CLIENTSECRET).toString('base64');

    // ?grant_type=client_credentials
    const getaccesstoken = await fetch(`https://zoom.us/oauth/token?grant_type=refresh_token&refresh_token=${User.refreshToken}`, options)
    const token = await getaccesstoken.json();
    return token;
}

async function listMeeting(user) {
    const token = await GetAccessToken(user);
    options.method = 'GET';
    options.headers.Authorization = `Bearer ${token.access_token}`;
    const meetings = await fetch(`${link}/users/${user.zoomid}/meetings`, options);
    const listmeetings = await meetings.json();
    return listmeetings;
}

async function GetZakToken(User, token) {
    options.method = 'GET';
    options.headers.Authorization = `Bearer ${token.access_token}`;
    const zaktoken = await fetch(`${link}/users/${User.zoomid}/token?type=zak`, options);
    const zakt = await zaktoken.json();
    return zakt;
}

app.get('/dashboard', async (req, res) => {
    try {
        const user = await UserModel.findById(req.user._id);
        const listMeetings = await listMeeting(user);
        const MapMeetings = [];
        const listedMeetings = listMeetings.meetings;
        for (var i = 0; i < listedMeetings.length; i++) {
            if (req.user.zoomid === listedMeetings[i].host_id) {
                const recording = await RecordingModel.findOne({ meetingid: listedMeetings[i].id, userid: req.user._id })
                let recordID = null;
                if (recording) {
                    recordID = recording.recordingurl.split('/');
                }
                MapMeetings.push({
                    role: 1,
                    id: listedMeetings[i].id,
                    url: listedMeetings[i].join_url,
                    start: listedMeetings[i].start_time,
                    duration: listedMeetings[i].duration,
                    timezone: listedMeetings[i].timezone,
                    topic: listedMeetings[i].topic,
                    recording: recording != null ? recordID[3] : null
                })
            }
        }
        res.render('ZoomRecorder.ejs', { user, type: 'dashboard', MapMeetings });
    } catch (err) {
        console.log(err.message);
        res.send('An error occurred');
    }
});

/**
 * Create a meeting
 */
app.get('/create-meeting', async (req, res) => {
    const User = await UserModel.findById(req.user._id);
    const token = await GetAccessToken(User);
    console.log(token)
    // options.method = 'POST';
    // options["content-type"] = "application/json";
    // options.headers.Authorization = `Bearer ${token.access_token}`;
    // options['body'] = {
    //     "agenda": "To help",
    //     "topic": "Zoom meeting",
    //     "type": 2,
    //     "duration": 90,
    //     "start_time": "2023-05-02T13:30:00",
    //     "timezone": "Asia/Calcutta"
    // }
    const body = {
        "agenda": "To help",
        "topic": "Zoom meeting",
        "type": 2,
        "duration": 90,
        "start_time": "2023-05-02T13:30:00",
        "timezone": "Asia/Calcutta"
    };
    const meeting = await fetch(`${link}/users/${User.zoomid}/meetings`, {
        "method": "POST",
        "Content-Type": "application/json",
        "muteHttpExceptions": true,
        "headers": {
            "Authorization": "Bearer " + token.access_token
        },
        "body": body
    });
    // const meeting_res = await meeting.json();
    console.log(meeting);
    res.send(meeting);
})

app.get('/join-meeting', async (req, res) => {
    const query = req.query;
    const user = req.user;
    res.render('JoinMeeting.ejs', { query, user });
})

app.post('/get-credentials', async (req, res) => {
    try {
        const User = await UserModel.findById(req.user._id);
        const token = await GetAccessToken(User);
        const zaktoken = await GetZakToken(User, token);
        const signature = await GetSignature(req.body.meetingNumber, req.body.role);
        // await ListMeetings(User, token);

        // var authEndpoint = '/create-signature'
        // var sdkKey = 'nGEA4VkuRlGeeHJAmr0q0Q'
        // var meetingNumber = '86439561813'
        // var passWord = 'nZsSV7'
        // var role = 1
        // var userName = 'Harsh Raj'
        // var userEmail = 'aec.cse.harshraj@gmail.com'
        // var registrantToken = ''
        // var zakToken = ''
        // var leaveUrl = 'http://localhost:3000/user/dashboard'

        var credentials = {
            signature: signature,
            zakToken: zaktoken.token,
            sdkKey: process.env.SDK_KEY,
            MN: req.body.meetingNumber,
            role: req.body.role,
            passWord: '69VKNt',
            userName: User.displayName,
            userEmail: User.email,
            registrantToken: '',
            leaveUrl: 'http://localhost:3000/user/join-meeting?id=' + req.body.meetingNumber + '&role=' + req.body.role
        }
        res.json(credentials);
    } catch (err) {
        console.log(err.message)
        res.status(400).json({ message: 'An err occurred' });
    }
})

app.post('/meeting/upload', containers.upload.single('file'), async (req, res) => {
    try {
        const Recording = new RecordingModel({
            meetingid: req.body.meetID,
            recordingurl: '/user/recording/' + req.file.id,
            userid: req.user._id
        })
        await Recording.save();
    } catch (err) {
        res.send('Upload failed');
    }
})

app.get('/recording', (req, res) => {
    const user = req.user;
    const recordID = req.query.id;
    res.render('ZoomRecorder.ejs', { user, type: 'recording', recordID });
})

app.get('/recording/:id', (req, res) => {
    containers.retrieve(req, res);
})

module.exports = app;