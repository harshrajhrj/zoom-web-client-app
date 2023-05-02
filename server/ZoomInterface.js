const app = require('express').Router();
const fetch = require('node-fetch');
const UserModel = require('./Models/UserModel');
const MeetingModel = require('./Models/MeetingModel');
const fs = require('fs');


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
    return token
}

async function listMeeting(user) {
    const token = await GetAccessToken(user);
    options.method = 'GET';
    options.headers.Authorization = `Bearer ${token.access_token}`;
    const meetings = await fetch(`${link}/users/${user.zoomid}/meetings`, options);
    const listmeetings = await meetings.json();
    return listmeetings;
}

app.get('/dashboard', async (req, res) => {
    try {
        const user = await UserModel.findById(req.user._id);
        const listMeetings = await listMeeting(user);
        const MapMeetings = [];
        listMeetings.meetings.forEach(meet => {
            if (req.user.zoomid === meet.host_id) {
                MapMeetings.push({
                    role: 1,
                    id: meet.id,
                    url: meet.join_url,
                    start: meet.start_time,
                    duration: meet.duration,
                    timezone: meet.timezone,
                    topic: meet.topic
                })
            }
        })
        res.render('ZoomRecorder.ejs', { user, type: 'dashboard', MapMeetings });
    } catch (err) {
        console.log(err.message);
        res.send('An error occurred');
    }
});

app.get('/zoom', async (req, res) => {

    // const User = await UserModel.findById(req.user._id);
    // options.headers.Authorization = `Bearer ${User.accessToken}`;

    // const getaccesstoken = await fetch(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ACCOUNTID}`, {
    //     method: 'POST',
    //     muteHttpExceptions: true,
    //     contentType: 'application/json',
    //     headers: {
    //         Authorization: 'Basic ' + Buffer.from(process.env.CLIENTID + ":" + process.env.CLIENTSECRET).toString('base64')
    //     }
    // })
    // const accesstoken = await getaccesstoken.json();

    // const data = await fetch('https://api.zoom.us/v2/users/me', options);
    // const body = await data.json();
    // fs.writeFileSync('./server/profile.json', JSON.stringify(body));
    res.render('ZoomInterface.ejs');
})

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

app.get('/list-meeting', async (req, res) => {
    const User = await UserModel.findById(req.user._id);
    const token = await GetAccessToken(User);
    options.method = 'GET';
    options.headers.Authorization = `Bearer ${token.access_token}`;
    const meetings = await fetch(`${link}/users/${User.zoomid}/meetings`, options);
    const listmeetings = await meetings.json();
    fs.writeFileSync('./server/meetings.json', JSON.stringify(listmeetings));
    res.send(listmeetings);
})

app.get('/join-meeting', async (req, res) => {
    res.render('JoinMeeting.ejs');
})

app.get('/zak-token', async (req, res) => {
    const User = await UserModel.findById(req.user._id);
    const token = await GetAccessToken(User);
    options.method = 'GET';
    options.headers.Authorization = `Bearer ${token.access_token}`;
    const zaktoken = await fetch(`${link}/users/${User.zoomid}/token?type=zak`, options);
    const zakt = await zaktoken.json();
    res.send(zakt);
})

app.get('/record', (req, res) => {
    res.render('Recording.ejs');
})

module.exports = app;