import useQueryParams from "../../helper/useQueryParams";

const useAppQueryParams = () => {
  const queryParams = useQueryParams({
    connect: { type: Boolean, default: false },
    showFullscreenAvatar: { type: Boolean, default: false },
    registerTrlEvents: { type: String, default: "" },
    avatarId: { type: String, default: process.env.REACT_APP_TRULIENCE_AVATAR_ID ?? "" },
    token: { type: String,  default: process.env.REACT_APP_TRULIENCE_TOKEN ?? "" },
    sdkURL: { type: String, default: process.env.REACT_APP_TRULIENCE_SDK_URL ?? ""},
    loadingBarColor: { type: String, default: "rgb(255, 98, 0)" },
    avatarBackgroundColor: { type: String, default: "rgb(51, 51, 51)" }
  });
  
  return queryParams
}

export default useAppQueryParams;
