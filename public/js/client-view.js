ZoomMtg.setZoomJSLib('https://source.zoom.us/2.11.5/lib', '/av')

ZoomMtg.preLoadWasm()
ZoomMtg.prepareWebSDK()
// loads language files, also passes any error messages to the ui
ZoomMtg.i18n.load('en-US')
ZoomMtg.i18n.reload('en-US')

var authEndpoint = '/create-signature'
var sdkKey = 'nGEA4VkuRlGeeHJAmr0q0Q'
var meetingNumber = '86439561813'
var passWord = 'nZsSV7'
var role = 1
var userName = 'Harsh Raj'
var userEmail = 'aec.cse.harshraj@gmail.com'
var registrantToken = ''
var zakToken = ''
var leaveUrl = 'http://localhost:3000/zoom'

function getSignature() {
  fetch('/zak-token', {
    method: 'GET'
  }).then((response) => {
    return response.json()
  }).then((data) => {
    zakToken = data.token;
  })
  fetch(authEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      meetingNumber: meetingNumber,
      role: role
    })
  }).then((response) => {
    return response.json()
  }).then((data) => {
    startMeeting(data.signature)
  }).catch((error) => {
    console.log(error.message)
  })
}
console.log(JSON.stringify(ZoomMtg.checkFeatureRequirements()));

function startMeeting(signature) {

  document.getElementById('zmmtg-root').style.display = 'block'

  ZoomMtg.init({
    leaveUrl: leaveUrl,
    success: (success) => {
      ZoomMtg.i18n.load('en-US')
      ZoomMtg.i18n.reload('en-US')
      console.log('Init successful')
      ZoomMtg.join({
        signature: signature,
        sdkKey: sdkKey,
        meetingNumber: meetingNumber,
        passWord: passWord,
        userName: userName,
        userEmail: userEmail,
        // tk: registrantToken,
        zak: zakToken,
        success: (success) => {
          console.log('Join successful');
          start();
          ZoomMtg.stopIncomingAudio({
            stop: true,
            success: (success) => {
              console.log(success);
            },
            error: (error) => {
              console.log('An error occurred')
            }
          })
          ZoomMtg.showInviteFunction({
            show: true
          })
          // console.log("get currentuser");
          // ZoomMtg.getCurrentUser({
          //   success: function (res) {
          //     console.log("success getCurrentUser", res.result.currentUser);
          //   },
          // });
        },
        error: (error) => {
          console.log('An error occurred during join : ', err.message)
        },
      })
    },
    error: (error) => {
      console.log('An error occurred during init : ', err.message)
    }
  })
}