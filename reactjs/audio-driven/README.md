# Sample app to demonstrate usage of the Trulience SDK being driven by an audio mediastream via npm

Still in beta. 

## Run the following commands to get it working

Go to the project directory:
```
cd audio-driven
```

In this folder, add a .env file with the following contents:
```
REACT_APP_TRULIENCE_SDK_URL=https://digitalhuman.uk/home/assets/trulience.sdk.js
REACT_APP_TRULIENCE_AVATAR_ID=1832157654720400978
REACT_APP_TRULIENCE_TOKEN=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJUb2tlbiBmcm9tIGN1c3RvbSBzdHJpbmciLCJleHAiOjQ4NzU0MDAzNTV9.YAD8AtI915qA2HZC21U2Arlpoi4wmJ91g5leb0Ez77irxQqogU-eHEBZJE40HtL777R33gchTfWxA8UhL4M_Eg
```

Build and run the app using:
```
npm install
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.
