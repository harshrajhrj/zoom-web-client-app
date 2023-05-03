ZoomMtg.setZoomJSLib('https://source.zoom.us/2.11.5/lib', '/av')

ZoomMtg.preLoadWasm()
ZoomMtg.prepareWebSDK()
// loads language files, also passes any error messages to the ui
ZoomMtg.i18n.load('en-US')
ZoomMtg.i18n.reload('en-US')

function getSignature(e) {
  const AriaLabel = e.getAttribute('aria-label').split('-');
  const MN = AriaLabel[1], Role = AriaLabel[3];
  fetch('/user/get-credentials', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      meetingNumber: MN,
      role: parseInt(Role, 10)
    })
  }).then((response) => {
    return response.json();
  }).then((data) => {
    startMeeting(data);
  })
}

function startMeeting(data) {

  document.getElementById('zmmtg-root').style.display = 'block'

  ZoomMtg.init({
    leaveUrl: data.leaveUrl,
    success: (success) => {
      ZoomMtg.i18n.load('en-US')
      ZoomMtg.i18n.reload('en-US')
      console.log('Init successful')
      ZoomMtg.join({
        signature: data.signature,
        sdkKey: data.sdkKey,
        meetingNumber: data.MN,
        passWord: data.passWord,
        userName: data.userName,
        userEmail: data.userEmail,
        tk: data.registrantToken,
        zak: data.zakToken,
        success: (success) => {
          console.log('Join successful');
          start(data.MN);
          // ZoomMtg.stopIncomingAudio({
          //   stop: true,
          //   success: (success) => {
          //     console.log(success);
          //   },
          //   error: (error) => {
          //     console.log('An error occurred')
          //   }
          // })
          // ZoomMtg.showInviteFunction({
          //   show: true
          // })
          console.log("get currentuser");
          ZoomMtg.getCurrentUser({
            success: function (res) {
              console.log("success getCurrentUser", res.result.currentUser);
            },
          });
        },
        error: (error) => {
          console.log('An error occurred during join : ', error.message)
        },
      })
    },
    error: (error) => {
      console.log('An error occurred during init : ', error.message)
    }
  })
}